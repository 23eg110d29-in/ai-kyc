from motor.motor_asyncio import AsyncIOMotorClient
from backend.core.config import settings


class Database:
    client: AsyncIOMotorClient = None
    db = None


db_manager = Database()


async def connect_to_mongo():
    try:
        # Initialize client with a short timeout to check connection status
        client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        # Verify connection by running a ping command
        await client.admin.command('ping')
        db_manager.client = client
        db_manager.db = client[settings.DATABASE_NAME]
        print("Successfully connected to real MongoDB database.")
    except Exception as e:
        print(f"Real MongoDB connection failed ({e}). Falling back to In-Memory Mock MongoDB Database.")
        from mongomock_motor import AsyncMongoMockClient
        db_manager.client = AsyncMongoMockClient()
        db_manager.db = db_manager.client[settings.DATABASE_NAME]

async def close_mongo_connection():
    if db_manager.client:
        try:
            db_manager.client.close()
        except Exception:
            pass

def get_db():
    return db_manager.db

