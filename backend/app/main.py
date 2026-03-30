"""FastAPI main application."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, documents, analysis
from app.services.llm_service import check_provider_health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Document Analyzer API")
    logger.info(f"LLM priority: {settings.LLM_PRIORITY}")
    logger.info(f"Upload directory: {settings.UPLOAD_DIR}")
    yield
    logger.info("Shutting down Document Analyzer API")


app = FastAPI(
    title="Document Analyzer API",
    description="LLM-powered educational document analysis backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(analysis.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "environment": settings.ENV}


@app.get("/api/health/llm")
async def llm_health():
    """Check which LLM providers are available."""
    providers = await check_provider_health()
    any_available = any(providers.values())
    return {
        "status": "ok" if any_available else "degraded",
        "providers": providers,
        "priority": settings.LLM_PRIORITY,
    }
