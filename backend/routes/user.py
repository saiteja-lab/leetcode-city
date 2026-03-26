from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.leetcode_api import LeetCodeAPIError, fetch_user_stats
from utils.city_generator import generate_city_model


router = APIRouter()


class UserCityRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)


@router.post("/user-city")
def get_user_city(payload: UserCityRequest) -> dict:
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")

    try:
        stats = fetch_user_stats(username)
    except LeetCodeAPIError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch data from LeetCode right now.",
        ) from exc

    city = generate_city_model(
        easy=stats["easy"],
        medium=stats["medium"],
        hard=stats["hard"],
    )

    return {
        "username": username,
        "easy": stats["easy"],
        "medium": stats["medium"],
        "hard": stats["hard"],
        "city": city,
    }
