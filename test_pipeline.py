import asyncio
import os
from bson import ObjectId
from backend.core.database import db_manager, connect_to_mongo
from backend.routers.verify import mock_verification_pipeline

async def test_pipeline():
    await connect_to_mongo()
    db = db_manager.db
    
    # Create mock user
    user_id = await db.users.insert_one({
        "username": "test",
        "email": "test@example.com",
        "full_name": "Test User"
    })
    
    # Create a mock file
    os.makedirs("uploads", exist_ok=True)
    with open("uploads/test.jpg", "w") as f:
        f.write("mock")
        
    # Create mock document
    doc_id = await db.documents.insert_one({
        "user_id": str(user_id.inserted_id),
        "document_type": "AADHAAR",
        "file_path": "uploads/test.jpg",
        "status": "PENDING"
    })
    
    print("Document ID:", doc_id.inserted_id)
    
    # Run pipeline directly
    try:
        await mock_verification_pipeline(str(doc_id.inserted_id), db)
    except Exception as e:
        print("EXCEPTION BUBBLED UP:", e)
        
    # Check status
    doc = await db.documents.find_one({"_id": doc_id.inserted_id})
    print("Final Status:", doc["status"])
    if doc["status"] == "MANUAL_REVIEW":
        print("Pipeline caught an exception internally!")

if __name__ == "__main__":
    asyncio.run(test_pipeline())
