import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from the backend directory
_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(_backend_dir / ".env")


class Settings:
    ENV: str = os.getenv("ENV", "development")

    # OpenRouter (Primary)
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Ollama (Fallback)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "phi3")

    # Groq (Alternative)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # LLM Priority
    LLM_PRIORITY: list[str] = os.getenv("LLM_PRIORITY", "openrouter,groq,ollama").split(",")

    # Upload
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", "./uploads"))
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))

    # CORS
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

    # MongoDB
    MONGODB_URL: str = os.getenv("MONGODB_URI", os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "document_analyzer")

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRY_HOURS: int = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

    def __init__(self):
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
