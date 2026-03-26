from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from services.dev_auth_store import (
    fetch_community_cities,
    get_user_for_token,
    upsert_city_for_user,
)


router = APIRouter()


class CityShape(BaseModel):
    houses: int
    buildings: int
    skyscrapers: int
    level: str


class SaveCityRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    easy: int
    medium: int
    hard: int
    city: CityShape


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


@router.get("/community/cities")
def get_cities(authorization: str | None = Header(default=None)) -> list[dict]:
    _get_current_user(authorization)
    return fetch_community_cities()


@router.post("/community/cities")
def save_city(
    payload: SaveCityRequest,
    authorization: str | None = Header(default=None),
) -> dict:
    user = _get_current_user(authorization)
    try:
        return upsert_city_for_user(user, payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
