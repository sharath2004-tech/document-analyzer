"""Document upload and management router."""

import uuid
import shutil
from pathlib import Path
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, BackgroundTasks

from app.config import settings
from app.database import get_db
from app.models import DocumentOut, DocumentListResponse
from app.routers.auth import get_current_user
from app.services.pdf_service import extract_text_from_pdf
from app.services.analysis_service import analyze_document

router = APIRouter(prefix="/api/documents", tags=["documents"])


async def get_document_text(doc_id: str) -> str:
    """Get the extracted text for a document from MongoDB."""
    db = get_db()
    doc = await db["documents"].find_one({"id": doc_id}, {"_id": 0, "full_text": 1})
    if not doc or not doc.get("full_text"):
        raise HTTPException(status_code=404, detail="Document text not found")
    return doc["full_text"]


async def _process_document(doc_id: str, file_path: str):
    """Background task to process an uploaded document."""
    db = get_db()
    try:
        result = await analyze_document(file_path)
        pdf_data = extract_text_from_pdf(file_path)
        await db["documents"].update_one(
            {"id": doc_id},
            {"$set": {
                "status": "ready",
                "pages": result["pages"],
                "concept_count": len(result.get("concepts", [])),
                "bloom_level": _get_dominant_bloom(result.get("bloom_taxonomy", [])),
                "analysis": result,
                "full_text": pdf_data["full_text"],
            }},
        )
    except Exception as e:
        await db["documents"].update_one(
            {"id": doc_id},
            {"$set": {"status": "error", "error": str(e)}},
        )


def _get_dominant_bloom(bloom_data: list[dict]) -> str:
    """Get the Bloom's level with highest percentage."""
    if not bloom_data:
        return "understand"
    return max(bloom_data, key=lambda x: x.get("percentage", 0)).get("level", "understand")


@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    allowed_types = {".pdf", ".txt", ".docx"}
    suffix = Path(file.filename).suffix.lower()
    if suffix not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {suffix}. Allowed: {', '.join(allowed_types)}",
        )

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail=f"File too large. Max: {settings.MAX_FILE_SIZE_MB}MB"
        )

    doc_id = str(uuid.uuid4())
    file_dir = settings.UPLOAD_DIR / doc_id
    file_dir.mkdir(parents=True, exist_ok=True)
    file_path = file_dir / file.filename
    file_path.write_bytes(contents)

    title = Path(file.filename).stem.replace("_", " ").replace("-", " ").title()
    uploaded_at = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": doc_id,
        "user_id": user["id"],
        "title": title,
        "file_name": file.filename,
        "file_path": str(file_path),
        "uploaded_at": uploaded_at,
        "status": "processing",
        "pages": 0,
        "concept_count": None,
        "bloom_level": None,
        "analysis": None,
        "full_text": None,
    }

    db = get_db()
    await db["documents"].insert_one(doc)

    background_tasks.add_task(_process_document, doc_id, str(file_path))

    return DocumentOut(
        id=doc_id,
        title=title,
        file_name=file.filename,
        uploaded_at=uploaded_at,
        status="processing",
        pages=0,
    )


@router.get("/", response_model=DocumentListResponse)
async def list_documents(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db["documents"].find({"user_id": user["id"]}, {"_id": 0, "full_text": 0})
    user_docs = [
        DocumentOut(
            id=d["id"],
            title=d["title"],
            file_name=d["file_name"],
            uploaded_at=d["uploaded_at"],
            status=d["status"],
            pages=d["pages"],
            summary=d.get("analysis", {}).get("summary", {}).get("brief") if d.get("analysis") else None,
            concept_count=d.get("concept_count"),
            bloom_level=d.get("bloom_level"),
        )
        async for d in cursor
    ]
    return DocumentListResponse(documents=user_docs)


@router.get("/{doc_id}", response_model=DocumentOut)
async def get_document(doc_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db["documents"].find_one(
        {"id": doc_id, "user_id": user["id"]}, {"_id": 0, "full_text": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentOut(
        id=doc["id"],
        title=doc["title"],
        file_name=doc["file_name"],
        uploaded_at=doc["uploaded_at"],
        status=doc["status"],
        pages=doc["pages"],
        summary=doc.get("analysis", {}).get("summary", {}).get("brief") if doc.get("analysis") else None,
        concept_count=doc.get("concept_count"),
        bloom_level=doc.get("bloom_level"),
    )


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db["documents"].find_one({"id": doc_id, "user_id": user["id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove file from disk
    file_dir = settings.UPLOAD_DIR / doc_id
    if file_dir.exists():
        shutil.rmtree(file_dir)

    await db["documents"].delete_one({"id": doc_id})
    return {"message": "Document deleted"}


@router.post("/{doc_id}/reanalyze", response_model=DocumentOut)
async def reanalyze_document(
    doc_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    """Re-trigger analysis on an existing document."""
    db = get_db()
    doc = await db["documents"].find_one({"id": doc_id, "user_id": user["id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = doc.get("file_path")
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=400, detail="Original file no longer available. Please re-upload.")

    await db["documents"].update_one(
        {"id": doc_id},
        {"$set": {"status": "processing", "analysis": None, "bloom_level": None, "concept_count": None}},
    )

    background_tasks.add_task(_process_document, doc_id, file_path)

    return DocumentOut(
        id=doc["id"],
        title=doc["title"],
        file_name=doc["file_name"],
        uploaded_at=doc["uploaded_at"],
        status="processing",
        pages=doc.get("pages", 0),
    )
