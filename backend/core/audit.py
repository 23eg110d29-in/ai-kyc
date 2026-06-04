from datetime import datetime
from typing import Optional


async def log_action(
    db,
    action: str,
    details: str,
    user_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
):
    if db is None:
        return

    log_doc = {
        "action": action,
        "user_id": str(user_id) if user_id else None,
        "details": details,
        "resource_type": resource_type,
        "resource_id": str(resource_id) if resource_id else None,
        "timestamp": datetime.utcnow(),
    }

    try:
        await db.audit_logs.insert_one(log_doc)
    except Exception as exc:
        print(f"Audit log write failed: {exc}")
