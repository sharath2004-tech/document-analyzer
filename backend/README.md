# Document Analyzer - Backend

LLM-powered educational document analysis backend built with FastAPI.

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py             # Environment configuration
│   ├── models.py             # Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py           # JWT authentication
│   │   ├── documents.py      # Document upload & management
│   │   └── analysis.py       # Analysis endpoints (summary, Q&A, Bloom's, etc.)
│   ├── services/
│   │   ├── llm_service.py    # LLM integration with fallback chain
│   │   ├── pdf_service.py    # PDF text extraction & chunking
│   │   └── analysis_service.py # Document analysis orchestrator
│   └── utils/
│       └── prompts.py        # Prompt templates for all analysis tasks
├── Dockerfile
├── docker-compose.yml        # Backend + Ollama
├── requirements.txt
└── .env.example
```

## LLM Provider Chain

The system tries providers in order (configurable via `LLM_PRIORITY`):

1. **OpenRouter** (primary) - `meta-llama/llama-3.1-8b-instruct:free` - completely free
2. **Groq** (alternative) - `llama-3.1-8b-instant` - free tier, extremely fast
3. **Ollama** (fallback) - `phi3` - self-hosted in Docker, no API key needed

## Quick Start (Local Development)

### 1. Set up the backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your API keys
```

### 2. Get API Keys (free)

- **OpenRouter**: https://openrouter.ai/keys (free, no credit card)
- **Groq** (optional): https://console.groq.com/keys (free tier)

### 3. Run the backend

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Run the frontend

```bash
cd ..  # back to project root
bun install
bun run dev
```

Visit `http://localhost:5173` - frontend connects to backend at `http://localhost:8000`.

## Docker Deployment (with Ollama fallback)

```bash
cd backend

# Copy and edit environment
copy .env.example .env

# Start everything (backend + Ollama)
docker compose up -d

# Ollama will auto-pull phi3 model on first start
```

## Free Cloud Deployment

### Option A: Render.com (Recommended)

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
4. Add environment variables from `.env.example`

### Option B: Railway.app

1. Connect GitHub repo
2. Set root directory to `backend`
3. Railway auto-detects Python and deploys

### Option C: Docker (any VPS)

```bash
docker compose up -d
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/documents/upload` | Upload PDF/DOCX/TXT |
| GET | `/api/documents/` | List user's documents |
| GET | `/api/documents/{id}` | Get document details |
| DELETE | `/api/documents/{id}` | Delete document |
| GET | `/api/documents/{id}/analysis/` | Get full analysis |
| GET | `/api/documents/{id}/analysis/summary` | Get summaries |
| GET | `/api/documents/{id}/analysis/concepts` | Get extracted concepts |
| GET | `/api/documents/{id}/analysis/bloom` | Get Bloom's taxonomy |
| GET | `/api/documents/{id}/analysis/insights` | Get learning insights |
| POST | `/api/documents/{id}/analysis/qa` | Ask a question |
| POST | `/api/documents/{id}/analysis/quiz` | Generate quiz |
| GET | `/api/health` | Health check |
| GET | `/api/health/llm` | Check LLM providers |

## Analysis Pipeline

Matches the system described in the presentation:

1. **Input PDF** → Raw document ingestion
2. **Text Extraction** → PyMuPDF for text extraction
3. **Semantic Chunking** → Paragraph-aware chunking with overlap
4. **Multi-LLM Processing** → OpenRouter → Groq → Ollama fallback
5. **Bloom's Taxonomy Mapping** → Concept classification by cognitive level
6. **Summary Generation** → Brief, detailed, and exam notes
7. **Concept Extraction** → Named concepts with relationships
8. **Insight Generation** → Strengths, weaknesses, recommendations
9. **Q&A** → Context-aware question answering
10. **Quiz Generation** → MCQ, fill-blank, true/false with Bloom's alignment
