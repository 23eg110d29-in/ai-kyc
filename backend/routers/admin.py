from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from ..core.security import get_current_user, role_required
from ..core.database import get_db

router = APIRouter()

@router.get("/stats", dependencies=[Depends(role_required(["admin"]))])
async def get_dashboard_stats(db = Depends(get_db)):
    total_users = await db.users.count_documents({})
    total_docs = await db.documents.count_documents({})
    
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await db.documents.aggregate(pipeline).to_list(None)
    
    # Format stats
    stats = {
        "total_users": total_users,
        "total_documents": total_docs,
        "status_distribution": {item["_id"]: item["count"] for item in status_counts}
    }
    
    return stats

@router.get("/users", dependencies=[Depends(role_required(["admin"]))])
async def get_users(db = Depends(get_db)):
    cursor = db.users.find({})
    users = await cursor.to_list(length=100)
    
    # mask password hash
    for user in users:
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("hashed_password", None)
        
    return users
