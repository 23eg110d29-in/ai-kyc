from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from bson import ObjectId
from ..core.security import get_current_user
from ..core.database import get_db
from backend.ai.ocr import extract_text
from backend.ai.langgraph_agents import run_kyc_pipeline
from backend.ai.rag import add_document_to_rag

router = APIRouter()

async def mock_verification_pipeline(document_id: str, db):
    """Real background task for AI processing"""
    # 1. Update status
    await db.documents.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {"status": "EXTRACTING"}}
    )
    
    doc = await db.documents.find_one({"_id": ObjectId(document_id)})
    if not doc:
        return
        
    try:
        # Extract text via OCR
        content_type = "image/jpeg"
        if doc["file_path"].endswith(".pdf"):
            content_type = "application/pdf"
        elif doc["file_path"].endswith(".png"):
            content_type = "image/png"
            
        extracted_text = extract_text(doc["file_path"], content_type)
        
        # Add to RAG for future lookup
        add_document_to_rag(str(doc["_id"]), extracted_text, {"type": doc["document_type"]})
        
        await db.documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"status": "VALIDATING"}}
        )
        
        # Get user
        user = await db.users.find_one({"_id": ObjectId(doc["user_id"])})
        user_data = {"username": user.get("full_name") or user.get("username"), "email": user["email"]}
        
        # Run LangGraph pipeline
        documents = [{"type": doc["document_type"], "text": extracted_text}]
        result = run_kyc_pipeline(user_data, documents)
        
        # Update db with result
        status_update = "APPROVED" if result.get("verification_status") == "approved" else "REJECTED"
        
        await db.documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {
                "status": status_update, 
                "extracted_data": result.get("extracted_entities", {}),
                "confidence": result.get("confidence", 0)
            }}
        )
        
        # Create verification report
        report = {
            "document_id": str(doc["_id"]),
            "decision": status_update,
            "confidence_score": result.get("confidence", 0),
            "agent_outputs": result,
            "created_at": __import__("datetime").datetime.utcnow()
        }
        await db.verificationReports.insert_one(report)
        
    except Exception as e:
        print(f"Error in pipeline: {e}")
        await db.documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"status": "MANUAL_REVIEW"}}
        )

@router.post("/{document_id}")
async def trigger_verification(
    document_id: str, 
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user), 
    db = Depends(get_db)
):
    try:
        doc = await db.documents.find_one({"_id": ObjectId(document_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid Document ID format")
        
    if not doc or doc["user_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc["status"] != "PENDING":
        raise HTTPException(status_code=400, detail="Document is already being processed or finished.")
        
    # Trigger background pipeline
    background_tasks.add_task(mock_verification_pipeline, document_id, db)
    
    return {"message": "Verification started"}
