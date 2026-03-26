from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from services.dev_auth_store import (
    fetch_user_profile,
    get_user_for_token,
    upsert_user_profile,
)


router = APIRouter()


class ProfileUpdateRequest(BaseModel):
    avatar_data_url: str | None = Field(default=None, max_length=1_500_000)


def _get_current_user(authorization: str | None) -> dict[str, str]:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization is required.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    user = get_user_for_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session not found.")

    return user


@router.get("/profile")
def get_profile(authorization: str | None = Header(default=None)) -> dict:
    user = _get_current_user(authorization)
    profile = fetch_user_profile(user["id"])
    return {
        "user": user,
        "profile": profile,
    }


@router.put("/profile")
def update_profile(
    payload: ProfileUpdateRequest,
    authorization: str | None = Header(default=None),
) -> dict:
    user = _get_current_user(authorization)
    profile = upsert_user_profile(user["id"], payload.avatar_data_url)
    return {
        "user": user,
        "profile": profile,
    }
