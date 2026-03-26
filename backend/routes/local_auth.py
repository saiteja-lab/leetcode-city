from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from services.dev_auth_store import (
    authenticate_user,
    create_user,
    delete_session,
    get_user_for_token,
)


router = APIRouter()


class AuthRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6, max_length=128)


def _extract_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization is required.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    return token


@router.post("/auth/signup")
def signup(payload: AuthRequest) -> dict:
    if "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    try:
        return create_user(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/auth/signin")
def signin(payload: AuthRequest) -> dict:
    if "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    try:
        return authenticate_user(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/auth/session")
def get_session(authorization: str | None = Header(default=None)) -> dict:
    token = _extract_token(authorization)
    user = get_user_for_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session not found.")

    return {
        "session": {
            "access_token": token,
            "user": user,
        }
    }


@router.post("/auth/signout")
def signout(authorization: str | None = Header(default=None)) -> dict[str, str]:
    token = _extract_token(authorization)
    delete_session(token)
    return {"status": "ok"}
