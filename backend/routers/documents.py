from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
from datetime import datetime
import os
import shutil
from bson import ObjectId
from ..models.document import DocumentResponse
from ..core.security import get_current_user
from ..core.database import get_db

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=DocumentResponse)
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PNG, JPG, JPEG, and PDF are allowed.")
    
    # Save file locally
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{current_user['_id']}_{datetime.utcnow().timestamp()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    doc_dict = {
        "user_id": str(current_user["_id"]),
        "document_type": document_type,
        "file_path": file_path,
        "status": "PENDING",
        "extracted_data": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.documents.insert_one(doc_dict)
    
    created_doc = await db.documents.find_one({"_id": result.inserted_id})
    created_doc["id"] = str(created_doc["_id"])
    return created_doc

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.documents.find({"user_id": str(current_user["_id"])})
    docs = await cursor.to_list(length=100)
    for doc in docs:
        doc["id"] = str(doc["_id"])
    return docs

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    try:
        doc = await db.documents.find_one({"_id": ObjectId(document_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid Document ID format")
        
    if not doc or doc["user_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc["id"] = str(doc["_id"])
    return doc
