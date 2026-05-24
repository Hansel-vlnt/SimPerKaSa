from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGODB_URL)
db = client["simperkasa"]

async def get_db():
    yield db

