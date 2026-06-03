from mongomock_motor import AsyncMongoMockClient
from backend.core.config import settings

class Database:
    client: AsyncMongoMockClient = None
    db = None

db_manager = Database()

async def connect_to_mongo():
    db_manager.client = AsyncMongoMockClient()
    db_manager.db = db_manager.client[settings.DATABASE_NAME]

async def close_mongo_connection():
    if db_manager.client:
        # mongomock doesn't strictly need closing, but we can clear it or ignore
        pass

def get_db():
    return db_manager.db
