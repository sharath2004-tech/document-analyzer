# Document Analyzer — Backend

FastAPI backend for the AI-powered educational document analysis platform. Connects to MongoDB Atlas and supports multiple free LLM providers with automatic fallback and rate-limit handling.

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI app, lifespan, CORS, DB init
│   ├── config.py            # Environment configuration
│   ├── database.py          # MongoDB Atlas via Motor (async)
│   ├── models.py            # Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py          # JWT signup / login / me
│   │   ├── documents.py     # Upload, list, get, delete, reanalyze
│   │   └── analysis.py      # Summary, concepts, Bloom, insights, Q&A, quiz
│   ├── services/
│   │   ├── llm_service.py   # Fallback chain + semaphore + 429 retries
│   │   ├── pdf_service.py   # PDF/DOCX/TXT extraction and chunking
│   │   └── analysis_service.py  # Parallel analysis orchestration
│   └── utils/
│       └── prompts.py       # All LLM prompt templates
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## LLM Provider Chain

Tries providers in order defined by `LLM_PRIORITY`. A global semaphore serializes calls to avoid free-tier rate limits. 429 responses are retried with exponential backoff.

| Priority | Provider | Model | Notes |
|---|---|---|---|
| 1 | OpenRouter | `meta-llama/llama-3.1-8b-instruct:free` | Free, no credit card |
| 2 | Groq | `llama-3.1-8b-instant` | Free tier, very fast |
| 3 | Ollama | `llama3.1:latest` | Self-hosted / ngrok tunnel |

## Quick Start

### 1. Install dependencies

```bash
py -3 -m pip install -r requirements.txt
```

### 2. Configure environment

```env
ENV=development

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=document_analyzer

OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:latest
LLM_PRIORITY=openrouter,groq,ollama

UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50

JWT_SECRET=change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24

CORS_ORIGINS=http://localhost:5173,http://localhost:8080
```

### 3. Run

```bash
# PowerShell (Windows)
$env:PYTHONPATH = "path\to\backend"; py -3 -m uvicorn app.main:app --reload --port 8000

# Linux/Mac
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

API: `http://localhost:8000`  
Docs: `http://localhost:8000/docs`

## Docker

```bash
docker compose up -d
```

## Deployment (Railway)

1. Connect repo on [railway.app](https://railway.app)
2. Set **Root Directory** to `backend/`
3. Railway auto-detects the `Dockerfile`
4. Add all env vars (use a strong `JWT_SECRET`)
5. Set `CORS_ORIGINS=https://your-frontend.vercel.app`

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/documents/upload` | Upload PDF/DOCX/TXT |
| GET | `/api/documents/` | List documents |
| GET | `/api/documents/{id}` | Get document |
| DELETE | `/api/documents/{id}` | Delete document |
| POST | `/api/documents/{id}/reanalyze` | Re-trigger analysis |
| GET | `/api/documents/{id}/analysis/` | Full analysis |
| GET | `/api/documents/{id}/analysis/summary` | Summaries |
| GET | `/api/documents/{id}/analysis/concepts` | Concepts |
| GET | `/api/documents/{id}/analysis/bloom` | Bloom taxonomy |
| GET | `/api/documents/{id}/analysis/insights` | Insights |
| POST | `/api/documents/{id}/analysis/qa` | Ask a question |
| POST | `/api/documents/{id}/analysis/quiz` | Generate quiz |
| GET | `/api/health` | Health check |
| GET | `/api/health/llm` | LLM provider status |

## Analysis Pipeline

1. **Text Extraction** — PyMuPDF (PDF), plaintext fallback
2. **Chunking** — Paragraph-aware with overlap (~8000 chars for analysis)
3. **Parallel LLM Calls** — `asyncio.gather` across summary, concepts, Bloom, insights
4. **Bloom Taxonomy** — 6-level cognitive mapping with percentages
5. **Concept Extraction** — Named concepts with descriptions and relationships
6. **Summary** — Brief, Detailed, and Exam Notes
7. **Insights** — Strengths, weaknesses, recommendations
8. **Storage** — Analysis results + full text saved to MongoDB Atlas
