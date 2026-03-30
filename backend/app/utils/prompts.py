"""Prompt templates for document analysis tasks."""

SYSTEM_PROMPT = """You are an expert educational content analyzer. You help students and teachers understand documents deeply by providing structured, accurate analysis aligned with Bloom's Taxonomy of educational objectives."""


def summarize_prompt(text: str, summary_type: str) -> list[dict]:
    """Generate summarization prompt."""
    type_instructions = {
        "brief": "Write a concise 2-3 sentence summary capturing the main topic and key takeaways.",
        "detailed": """Write a comprehensive structured summary with:
- **Overview**: 2-3 sentences about the document's purpose
- **Key Topics Covered**: Numbered list with bold topic names and brief descriptions
- **Important Details**: Any formulas, definitions, or critical facts
Keep it well-organized with markdown formatting.""",
        "exam_notes": """Create exam preparation notes with:
- **Key Formulas**: List all important formulas with labels (use ⭐ prefix)
- **Important Concepts to Remember**: Numbered list of must-know facts (use 📝 prefix)
- **Common Exam Questions**: Likely questions that could appear on a test (use 🎯 prefix)
Use a study-friendly format with clear markers.""",
    }

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""{type_instructions.get(summary_type, type_instructions['detailed'])}

Document content:
---
{text[:8000]}
---

Respond with ONLY the summary, no preamble.""",
        },
    ]


def extract_concepts_prompt(text: str) -> list[dict]:
    """Generate concept extraction prompt."""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Analyze the following educational content and extract key concepts.

For each concept, provide:
1. name: A clear, concise name
2. description: 1-2 sentence explanation
3. related_concepts: List of related concept names from this document
4. bloom_level: The Bloom's Taxonomy level (remember, understand, apply, analyze, evaluate, create)

Return ONLY valid JSON in this format:
{{
  "concepts": [
    {{
      "name": "Concept Name",
      "description": "Brief description",
      "related_concepts": ["Related1", "Related2"],
      "bloom_level": "understand"
    }}
  ]
}}

Document content:
---
{text[:8000]}
---""",
        },
    ]


def bloom_taxonomy_prompt(text: str) -> list[dict]:
    """Generate Bloom's Taxonomy analysis prompt."""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Analyze this educational content and map it to Bloom's Taxonomy levels.

For each level (remember, understand, apply, analyze, evaluate, create), identify:
1. concepts: Key concepts at that level
2. questions: 2 sample questions at that level
3. percentage: Estimated percentage of content at that level (all should sum to 100)

Return ONLY valid JSON:
{{
  "bloom_taxonomy": [
    {{
      "level": "remember",
      "concepts": ["Concept1", "Concept2"],
      "questions": ["Question 1?", "Question 2?"],
      "percentage": 15
    }},
    {{
      "level": "understand",
      "concepts": ["Concept3"],
      "questions": ["Question 3?", "Question 4?"],
      "percentage": 25
    }},
    {{
      "level": "apply",
      "concepts": ["Concept4"],
      "questions": ["Question 5?", "Question 6?"],
      "percentage": 20
    }},
    {{
      "level": "analyze",
      "concepts": ["Concept5"],
      "questions": ["Question 7?", "Question 8?"],
      "percentage": 20
    }},
    {{
      "level": "evaluate",
      "concepts": ["Concept6"],
      "questions": ["Question 9?", "Question 10?"],
      "percentage": 12
    }},
    {{
      "level": "create",
      "concepts": ["Concept7"],
      "questions": ["Question 11?", "Question 12?"],
      "percentage": 8
    }}
  ]
}}

Document content:
---
{text[:8000]}
---""",
        },
    ]


def insights_prompt(text: str) -> list[dict]:
    """Generate learning insights prompt."""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Analyze this educational content and provide learning insights.

Provide exactly 3-5 insights categorized as:
- strength: Areas where the content is strong
- weakness: Areas that need more coverage or clarity
- recommendation: Suggestions for the learner

Return ONLY valid JSON:
{{
  "insights": [
    {{
      "type": "strength",
      "title": "Short title",
      "description": "Detailed description",
      "bloom_level": "Understand"
    }}
  ]
}}

Document content:
---
{text[:8000]}
---""",
        },
    ]


def qa_prompt(text: str, question: str) -> list[dict]:
    """Generate Q&A prompt with document context."""
    return [
        {"role": "system", "content": SYSTEM_PROMPT + """
When answering questions:
- Base your answer ONLY on the provided document content
- If the answer is not in the document, say so clearly
- Cite relevant sections or page references when possible
- Provide thorough but concise answers"""},
        {
            "role": "user",
            "content": f"""Based on the following document content, answer the question.

Document content:
---
{text[:8000]}
---

Question: {question}

Provide your answer and list source references from the document. Return ONLY valid JSON:
{{
  "answer": "Your detailed answer here",
  "sources": ["Page X, Section Y", "Page Z, Paragraph W"]
}}""",
        },
    ]


def quiz_prompt(text: str, num_questions: int = 5) -> list[dict]:
    """Generate quiz questions prompt."""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Generate {num_questions} quiz questions from this educational content.

Create a mix of question types:
- mcq: Multiple choice with 4 options
- fill_blank: Fill in the blank
- true_false: True or false

Each question should target a different Bloom's Taxonomy level when possible.

Return ONLY valid JSON:
{{
  "questions": [
    {{
      "question": "What is...?",
      "question_type": "mcq",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct_answer": "A) Option 1",
      "bloom_level": "remember",
      "explanation": "Brief explanation of the correct answer"
    }},
    {{
      "question": "The process of ____ involves converting...",
      "question_type": "fill_blank",
      "options": null,
      "correct_answer": "photosynthesis",
      "bloom_level": "understand",
      "explanation": "Brief explanation"
    }}
  ]
}}

Document content:
---
{text[:8000]}
---""",
        },
    ]
