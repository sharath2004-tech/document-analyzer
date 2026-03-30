"""Document analysis service - orchestrates PDF processing and LLM calls."""

import json
import logging
import asyncio
import uuid
from app.services.llm_service import call_llm
from app.services.pdf_service import extract_text_from_pdf, chunk_text
from app.utils.prompts import (
    summarize_prompt,
    extract_concepts_prompt,
    bloom_taxonomy_prompt,
    insights_prompt,
    qa_prompt,
    quiz_prompt,
)

logger = logging.getLogger(__name__)


def _parse_json_response(text: str) -> dict:
    """Extract and parse JSON from LLM response, handling markdown fences."""
    text = text.strip()
    # Remove markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (```json or ```) and last line (```)
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)

    # Try to find JSON object/array in the response
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1:
        start = text.find("[")
        end = text.rfind("]") + 1

    if start != -1 and end > start:
        text = text[start:end]

    return json.loads(text)


async def analyze_document(file_path: str) -> dict:
    """Run full analysis pipeline on a document."""
    # Step 1: Extract text
    pdf_data = extract_text_from_pdf(file_path)
    full_text = pdf_data["full_text"]

    if not full_text.strip():
        raise ValueError("Could not extract text from PDF. The document may be scanned/image-only.")

    # Step 2: Chunk for processing
    chunks = chunk_text(full_text)
    # Use first chunks (up to ~8000 chars) for analysis
    analysis_text = "\n\n".join(c["text"] for c in chunks[:4])

    # Step 3: Run all analyses in parallel
    summary_result, concepts_result, bloom_result, insights_result = await asyncio.gather(
        generate_summaries(analysis_text),
        extract_concepts(analysis_text),
        analyze_bloom_taxonomy(analysis_text),
        generate_insights(analysis_text),
    )

    return {
        "pages": pdf_data["pages"],
        "metadata": pdf_data["metadata"],
        "summary": summary_result,
        "concepts": concepts_result,
        "bloom_taxonomy": bloom_result,
        "insights": insights_result,
    }


async def generate_summaries(text: str) -> dict:
    """Generate brief, detailed, and exam note summaries."""
    async def _gen(stype: str) -> tuple[str, str]:
        try:
            messages = summarize_prompt(text, stype)
            result = await call_llm(messages, temperature=0.3)
            return stype, result.strip()
        except Exception as e:
            logger.error(f"Summary generation ({stype}) failed: {e}")
            return stype, f"Summary generation failed: {str(e)}"

    pairs = await asyncio.gather(*[_gen(s) for s in ["brief", "detailed", "exam_notes"]])
    return dict(pairs)


async def extract_concepts(text: str) -> list[dict]:
    """Extract key concepts from document text."""
    try:
        messages = extract_concepts_prompt(text)
        result = await call_llm(messages, temperature=0.2)
        parsed = _parse_json_response(result)
        concepts = parsed.get("concepts", [])
        # Add IDs
        for i, concept in enumerate(concepts):
            concept["id"] = str(i + 1)
        return concepts
    except Exception as e:
        logger.error(f"Concept extraction failed: {e}")
        return []


async def analyze_bloom_taxonomy(text: str) -> list[dict]:
    """Map content to Bloom's Taxonomy levels."""
    try:
        messages = bloom_taxonomy_prompt(text)
        result = await call_llm(messages, temperature=0.2)
        parsed = _parse_json_response(result)
        return parsed.get("bloom_taxonomy", [])
    except Exception as e:
        logger.error(f"Bloom's taxonomy analysis failed: {e}")
        return []


async def generate_insights(text: str) -> list[dict]:
    """Generate learning insights and recommendations."""
    try:
        messages = insights_prompt(text)
        result = await call_llm(messages, temperature=0.4)
        parsed = _parse_json_response(result)
        insights = parsed.get("insights", [])
        for i, insight in enumerate(insights):
            insight["id"] = str(i + 1)
        return insights
    except Exception as e:
        logger.error(f"Insights generation failed: {e}")
        return []


async def answer_question(text: str, question: str) -> dict:
    """Answer a question based on document content."""
    try:
        messages = qa_prompt(text, question)
        result = await call_llm(messages, temperature=0.2)
        parsed = _parse_json_response(result)
        return {
            "question": question,
            "answer": parsed.get("answer", "Could not generate an answer."),
            "sources": parsed.get("sources", []),
        }
    except json.JSONDecodeError:
        # If JSON parsing fails, return the raw text as the answer
        return {
            "question": question,
            "answer": result.strip() if 'result' in dir() else "Failed to generate answer.",
            "sources": [],
        }
    except Exception as e:
        logger.error(f"Q&A failed: {e}")
        return {
            "question": question,
            "answer": f"Error: {str(e)}",
            "sources": [],
        }


async def generate_quiz(text: str, num_questions: int = 5) -> list[dict]:
    """Generate quiz questions from document content."""
    try:
        messages = quiz_prompt(text, num_questions)
        result = await call_llm(messages, temperature=0.5)
        parsed = _parse_json_response(result)
        questions = parsed.get("questions", [])
        for i, q in enumerate(questions):
            q["id"] = str(i + 1)
        return questions
    except Exception as e:
        logger.error(f"Quiz generation failed: {e}")
        return []
