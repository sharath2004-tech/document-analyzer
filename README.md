# Document Analyzer

An AI-powered educational document analysis platform. Upload PDFs and get instant summaries, concept extraction, Bloom's Taxonomy mapping, learning insights, Q&A, and quiz generation — all powered by free LLMs.

## Tech Stack

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui + @tailwindcss/typography
- React Router, React Markdown (remark-gfm)

**Backend**
- FastAPI (Python 3.12+)
- MongoDB Atlas (Motor async driver)
- PyMuPDF for PDF text extraction
- JWT authentication

**LLM Providers (free tier, auto-fallback)**
1. OpenRouter → `meta-llama/llama-3.1-8b-instruct:free`
2. Groq → `llama-3.1-8b-instant`
3. Ollama (self-hosted) → `llama3.1:latest`

## Project Structure

```
├── src/                    # React frontend
│   ├── pages/              # Landing, Dashboard, Upload, Analyze
│   ├── components/         # Layout + shadcn/ui components
│   ├── contexts/           # AuthContext (JWT)
│   └── lib/api.ts          # Typed API client
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py     # MongoDB Atlas (Motor)
│   │   ├── models.py
│   │   ├── routers/        # auth, documents, analysis
│   │   ├── services/       # llm, pdf, analysis
│   │   └── utils/prompts.py
│   ├── Dockerfile
│   └── requirements.txt
```

## Local Development

### Prerequisites
- Node.js 18+ / npm
- Python 3.12+
- MongoDB Atlas free M0 cluster (or local MongoDB)

### 1. Clone & configure

```sh
git clone https://github.com/sharath2004-tech/document-analyzer.git
cd document-analyzer
```

### 2. Backend setup

```sh
cd backend

# Install dependencies
py -3 -m pip install -r requirements.txt

# Create and fill in .env (see Environment Variables section)
copy .env.example .env
```

### 3. Start the backend

```sh
# PowerShell (Windows)
$env:PYTHONPATH = "e:\path\to\document-analyzer\backend"
py -3 -m uvicorn app.main:app --reload --port 8000

# Linux/Mac
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

API: `http://localhost:8000`  
Swagger: `http://localhost:8000/docs`

### 4. Frontend setup

```sh
# From the project root
npm install
npm run dev
```

Frontend: `http://localhost:8080`

## Environment Variables

Create `backend/.env`:

```env
ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=document_analyzer

# LLM Providers (all free)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:latest
LLM_PRIORITY=openrouter,groq,ollama

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50

# Auth
JWT_SECRET=your-strong-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
```

Get free API keys:
- **OpenRouter**: https://openrouter.ai/keys (no credit card needed)
- **Groq**: https://console.groq.com/keys
- **MongoDB Atlas**: https://cloud.mongodb.com (free M0 cluster)

## Deployment

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Framework: Vite, Build command: `npm run build`, Output: `dist`
3. Add env var: `VITE_API_URL=https://your-backend.up.railway.app`

### Backend → Railway

1. Connect repo on [railway.app](https://railway.app)
2. Set **Root Directory** to `backend/`
3. Railway auto-detects the `Dockerfile`
4. Add all env vars from above (use a strong `JWT_SECRET`)
5. Set `CORS_ORIGINS=https://your-app.vercel.app`

## Features

| Feature | Description |
|---|---|
| Document Upload | PDF, DOCX, TXT up to 50 MB |
| Smart Summaries | Brief, Detailed, and Exam Notes formats |
| Concept Extraction | Key concepts with definitions and Bloom's level tagging |
| Bloom's Taxonomy | Distribution pyramid + sample questions per level |
| Learning Insights | Strengths, weaknesses, and recommendations |
| Q&A | Ask anything about the document (context-aware) |
| Quiz Generation | MCQ, fill-in-the-blank, true/false |
| Re-analyze | Retrigger analysis on existing documents |
| Persistent Storage | All data saved to MongoDB Atlas |
