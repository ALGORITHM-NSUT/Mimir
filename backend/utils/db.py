from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Create MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client["mimir_db"]
