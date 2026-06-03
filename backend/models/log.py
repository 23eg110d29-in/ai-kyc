from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class AuditLog(BaseModel):
    id: Optional[str] = Field(alias="_id")
    action: str
    user_id: Optional[str]
    details: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
