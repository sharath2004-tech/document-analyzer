"""PDF text extraction and preprocessing service."""

import fitz  # PyMuPDF
from pathlib import Path


def extract_text_from_pdf(file_path: str | Path) -> dict:
    """Extract text and metadata from a PDF file.

    Returns dict with 'pages', 'full_text', 'page_texts', and 'metadata'.
    """
    doc = fitz.open(str(file_path))
    page_texts: list[dict] = []
    full_text_parts: list[str] = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        page_texts.append({
            "page_number": page_num + 1,
            "text": text.strip(),
        })
        full_text_parts.append(text.strip())

    full_text = "\n\n".join(full_text_parts)

    metadata = doc.metadata or {}
    total_pages = len(doc)
    doc.close()

    return {
        "pages": total_pages,
        "full_text": full_text,
        "page_texts": page_texts,
        "metadata": {
            "title": metadata.get("title", ""),
            "author": metadata.get("author", ""),
            "subject": metadata.get("subject", ""),
        },
    }


def chunk_text(full_text: str, chunk_size: int = 2000, overlap: int = 200) -> list[dict]:
    """Split text into overlapping chunks for LLM processing.

    Uses paragraph boundaries when possible for semantic coherence.
    """
    paragraphs = full_text.split("\n\n")
    chunks: list[dict] = []
    current_chunk = ""
    chunk_index = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) + 2 > chunk_size and current_chunk:
            chunks.append({
                "index": chunk_index,
                "text": current_chunk.strip(),
                "char_count": len(current_chunk.strip()),
            })
            # Keep overlap from end of previous chunk
            words = current_chunk.split()
            overlap_words = words[-overlap // 5:] if len(words) > overlap // 5 else words
            current_chunk = " ".join(overlap_words) + "\n\n" + para
            chunk_index += 1
        else:
            current_chunk = current_chunk + "\n\n" + para if current_chunk else para

    if current_chunk.strip():
        chunks.append({
            "index": chunk_index,
            "text": current_chunk.strip(),
            "char_count": len(current_chunk.strip()),
        })

    return chunks
