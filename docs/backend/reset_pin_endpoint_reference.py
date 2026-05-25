"""
Reference implementation for POST /v2.2/common/reset_pin
Deploy this on the MenuMitra API server (FastAPI-style). Adapt to your ORM and OTP store.

Flow: send_reset_pin_otp -> verify_reset_pin_otp -> reset_pin (this endpoint)
"""

from datetime import datetime, timezone
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import bcrypt

router = APIRouter(prefix="/common", tags=["auth"])


class ResetPinRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=10)
    otp: str = Field(..., min_length=4, max_length=6)
    pin: str = Field(..., min_length=4, max_length=6)
    app_type: str
    device_id: str | None = None
    device_model: str | None = None
    version: str | None = None
    user_agent_name: str | None = None


def hash_pin(raw_pin: str) -> str:
    return bcrypt.hashpw(raw_pin.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode(
        "utf-8"
    )


@router.post("/reset_pin")
async def reset_pin(body: ResetPinRequest, db=...):
    # --- STEP 1: Validate user ---
    user = await db.users.find_one(
        {"mobile": body.mobile, "app_type": body.app_type, "is_active": True}
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # --- STEP 2: Validate OTP (must match verified, unused, not expired) ---
    otp_row = await db.reset_pin_otps.find_one(
        {
            "mobile": body.mobile,
            "app_type": body.app_type,
            "otp": body.otp.strip(),
            "verified": True,
            "used": False,
        }
    )
    if not otp_row:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    expires_at = otp_row.get("expires_at")
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    # --- STEP 3: Validate PIN ---
    if not re.fullmatch(r"\d{4}", body.pin):
        raise HTTPException(status_code=400, detail="PIN must be 4 digits.")

    # --- STEP 4–5: Hash and update ---
    pin_hash = hash_pin(body.pin)
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "pin_hash": pin_hash,
                "failed_attempts": 0,
                "locked_until": None,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    # --- STEP 6: Invalidate OTP ---
    await db.reset_pin_otps.update_one(
        {"_id": otp_row["_id"]},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}},
    )

    # --- STEP 7: Success ---
    return {"detail": "PIN updated successfully."}
