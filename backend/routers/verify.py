from datetime import datetime
import re

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from bson import ObjectId
from ..core.security import get_current_user
from ..core.database import get_db
from ..core.audit import log_action

router = APIRouter()

MIN_OCR_TEXT_LENGTH = 20

DOCUMENT_KEYWORDS = {
    "AADHAAR": ["aadhaar", "unique identification", "government of india"],
    "PAN": ["permanent account", "income tax", "pan"],
    "PASSPORT": ["passport", "republic of india", "nationality"],
    "DRIVING_LICENSE": ["driving", "licence", "license", "transport"],
}

def get_fraud_flags(document_type: str, extracted_text: str) -> list[str]:
    text = (extracted_text or "").strip()
    text_lower = text.lower()
    flags = []

    if len(text) < MIN_OCR_TEXT_LENGTH:
        flags.append("UNREADABLE_OR_BLANK_DOCUMENT")

    expected_keywords = DOCUMENT_KEYWORDS.get(document_type.upper(), [])
    if expected_keywords and not any(keyword in text_lower for keyword in expected_keywords):
        flags.append("DOCUMENT_TYPE_MISMATCH")

    if document_type.upper() == "AADHAAR" and text and not re.search(r"\b\d{4}\s?\d{4}\s?\d{4}\b", text):
        flags.append("AADHAAR_NUMBER_NOT_FOUND")

    if document_type.upper() == "PAN" and text and not re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text.upper()):
        flags.append("PAN_NUMBER_NOT_FOUND")

    return flags

async def finalize_suspicious_document(db, doc, status: str, reason: str, flags: list[str], audit_action: str):
    payload = {
        "reason": reason,
        "fraud_flags": flags,
    }

    await db.documents.update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "status": status,
            "extracted_data": payload,
            "confidence": 0,
            "updated_at": datetime.utcnow(),
        }}
    )

    await db.verificationReports.insert_one({
        "document_id": str(doc["_id"]),
        "decision": status,
        "confidence_score": 0,
        "agent_outputs": payload,
        "created_at": datetime.utcnow(),
    })

    await log_action(
        db,
        audit_action,
        reason,
        user_id=str(doc["user_id"]),
        resource_type="document",
        resource_id=str(doc["_id"]),
    )

async def mock_verification_pipeline(document_id: str, db):
    """Real background task for AI processing"""
    from backend.ai.ocr import OCR_AVAILABLE, extract_text
    from backend.ai.langgraph_agents import run_kyc_pipeline
    from backend.ai.rag import add_document_to_rag

    # 1. Update status
    await db.documents.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {"status": "EXTRACTING"}}
    )
    
    doc = await db.documents.find_one({"_id": ObjectId(document_id)})
    if not doc:
        return
        
    try:
        if not OCR_AVAILABLE:
            await finalize_suspicious_document(
                db,
                doc,
                "MANUAL_REVIEW",
                "OCR engine is not available in this environment. Manual verification is required before approval.",
                ["OCR_UNAVAILABLE"],
                "VERIFICATION_MANUAL_REVIEW",
            )
            return

        # Extract text via OCR
        content_type = "image/jpeg"
        if doc["file_path"].endswith(".pdf"):
            content_type = "application/pdf"
        elif doc["file_path"].endswith(".png"):
            content_type = "image/png"
            
        extracted_text = extract_text(doc["file_path"], content_type)

        fraud_flags = get_fraud_flags(doc["document_type"], extracted_text)
        if fraud_flags:
            await finalize_suspicious_document(
                db,
                doc,
                "REJECTED",
                "Fake, unreadable, or mismatched document detected.",
                fraud_flags,
                "FAKE_DOCUMENT_DETECTED",
            )
            return
        
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
                "confidence": result.get("confidence", 0),
                "updated_at": datetime.utcnow(),
            }}
        )
        
        # Create verification report
        report = {
            "document_id": str(doc["_id"]),
            "decision": status_update,
            "confidence_score": result.get("confidence", 0),
            "agent_outputs": result,
            "created_at": datetime.utcnow()
        }
        await db.verificationReports.insert_one(report)
        await log_action(
            db,
            "VERIFICATION_COMPLETED",
            f"Document verification completed with status {status_update}.",
            user_id=str(doc["user_id"]),
            resource_type="document",
            resource_id=str(doc["_id"]),
        )
        
    except Exception as e:
        print(f"Error in pipeline: {e}")
        await db.documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {
                "status": "MANUAL_REVIEW",
                "extracted_data": {
                    "reason": "Verification pipeline error. Manual review required.",
                    "fraud_flags": ["PIPELINE_ERROR"],
                },
                "confidence": 0,
                "updated_at": datetime.utcnow(),
            }}
        )
        await log_action(
            db,
            "VERIFICATION_FAILED",
            "Document verification failed and was moved to manual review.",
            user_id=str(doc["user_id"]),
            resource_type="document",
            resource_id=str(doc["_id"]),
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
        
    await log_action(
        db,
        "VERIFICATION_STARTED",
        f"Verification started for {doc['document_type']} document.",
        user_id=str(current_user["_id"]),
        resource_type="document",
        resource_id=document_id,
    )

    # Trigger background pipeline
    background_tasks.add_task(mock_verification_pipeline, document_id, db)
    
    return {"message": "Verification started"}
