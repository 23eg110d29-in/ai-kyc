from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class DocumentBase(BaseModel):
    document_type: str # e.g., AADHAAR, PAN, PASSPORT
    status: str = "PENDING" # PENDING, EXTRACTING, VALIDATING, FRAUD_CHECK, COMPLIANCE_CHECK, REPORT_GENERATED, APPROVED, REJECTED, MANUAL_REVIEW

class DocumentCreate(DocumentBase):
    pass

class DocumentInDB(DocumentBase):
    id: str = Field(alias="_id")
    user_id: str
    file_path: str
    extracted_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

class DocumentResponse(DocumentBase):
    id: str
    user_id: str
    file_path: str
    extracted_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

class VerificationReportBase(BaseModel):
    decision: str # APPROVED, REJECTED, MANUAL_REVIEW
    confidence_score: float

class VerificationReportInDB(VerificationReportBase):
    id: str = Field(alias="_id")
    document_id: str
    agent_outputs: Dict[str, Any] # stores output from each LangGraph agent
    created_at: datetime

class VerificationReportResponse(VerificationReportBase):
    id: str
    document_id: str
    agent_outputs: Dict[str, Any]
    created_at: datetime

class AuditLog(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    timestamp: datetime
    ip_address: Optional[str] = None
