from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class ReportBase(BaseModel):
    user_id: str
    document_ids: list[str]
    status: str # approved, rejected, manual_review
    confidence_score: float
    analysis_details: Dict[str, Any]

class ReportCreate(ReportBase):
    pass

class ReportInDB(ReportBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReportResponse(ReportBase):
    id: str = Field(alias="_id")
    created_at: datetime
