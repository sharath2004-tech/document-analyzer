"""Analysis endpoints - summaries, Q&A, Bloom's, concepts, insights, quiz."""

from fastapi import APIRouter, HTTPException, Depends

from app.models import (
    SummaryResponse,
    QARequest,
    QAResponse,
    ConceptOut,
    BloomItemOut,
    InsightOut,
    FullAnalysisResponse,
    QuizResponse,
)
from app.routers.auth import get_current_user
from app.routers.documents import _documents, _document_texts
from app.services.analysis_service import answer_question, generate_quiz

router = APIRouter(prefix="/api/documents/{doc_id}/analysis", tags=["analysis"])


def _get_doc_or_404(doc_id: str, user: dict) -> dict:
    doc = _documents.get(doc_id)
    if not doc or doc["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc["status"] != "ready":
        raise HTTPException(status_code=400, detail="Document is still processing")
    return doc


@router.get("/", response_model=FullAnalysisResponse)
async def get_full_analysis(doc_id: str, user: dict = Depends(get_current_user)):
    """Get the full analysis results for a document."""
    doc = _get_doc_or_404(doc_id, user)
    analysis = doc.get("analysis")
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not available")

    return FullAnalysisResponse(
        summary=SummaryResponse(**analysis["summary"]),
        concepts=[ConceptOut(**c) for c in analysis["concepts"]],
        bloom_taxonomy=[BloomItemOut(**b) for b in analysis["bloom_taxonomy"]],
        insights=[InsightOut(**i) for i in analysis["insights"]],
    )


@router.get("/summary", response_model=SummaryResponse)
async def get_summary(doc_id: str, user: dict = Depends(get_current_user)):
    doc = _get_doc_or_404(doc_id, user)
    analysis = doc.get("analysis", {})
    summary = analysis.get("summary")
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not available")
    return SummaryResponse(**summary)


@router.get("/concepts", response_model=list[ConceptOut])
async def get_concepts(doc_id: str, user: dict = Depends(get_current_user)):
    doc = _get_doc_or_404(doc_id, user)
    concepts = doc.get("analysis", {}).get("concepts", [])
    return [ConceptOut(**c) for c in concepts]


@router.get("/bloom", response_model=list[BloomItemOut])
async def get_bloom_taxonomy(doc_id: str, user: dict = Depends(get_current_user)):
    doc = _get_doc_or_404(doc_id, user)
    bloom = doc.get("analysis", {}).get("bloom_taxonomy", [])
    return [BloomItemOut(**b) for b in bloom]


@router.get("/insights", response_model=list[InsightOut])
async def get_insights(doc_id: str, user: dict = Depends(get_current_user)):
    doc = _get_doc_or_404(doc_id, user)
    insights = doc.get("analysis", {}).get("insights", [])
    return [InsightOut(**i) for i in insights]


@router.post("/qa", response_model=QAResponse)
async def ask_question(
    doc_id: str,
    req: QARequest,
    user: dict = Depends(get_current_user),
):
    """Ask a question about a document."""
    _get_doc_or_404(doc_id, user)

    text = _document_texts.get(doc_id)
    if not text:
        raise HTTPException(status_code=404, detail="Document text not found for Q&A")

    result = await answer_question(text, req.question)
    return QAResponse(**result)


@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz_endpoint(
    doc_id: str,
    user: dict = Depends(get_current_user),
    num_questions: int = 5,
):
    """Generate quiz questions for a document."""
    _get_doc_or_404(doc_id, user)

    text = _document_texts.get(doc_id)
    if not text:
        raise HTTPException(status_code=404, detail="Document text not found")

    questions = await generate_quiz(text, num_questions)
    return QuizResponse(questions=questions)
