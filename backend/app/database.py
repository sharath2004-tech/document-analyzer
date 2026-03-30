"""MongoDB Atlas connection via Motor (async)."""

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URL)
    return _client


def get_db():
    return get_client()[settings.MONGODB_DB_NAME]


async def close_db():
    global _client
    if _client is not None:
        _client.close()
        _client = None
