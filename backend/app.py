import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.local_auth import router as local_auth_router
from routes.local_community import router as local_community_router
from routes.local_profile import router as local_profile_router
from routes.user import router as user_router
from services.dev_auth_store import initialize_database


app = FastAPI(title="LeetCode City Generator API", version="1.0.0")

app_environment = os.getenv("APP_ENV", "development").strip().lower()

if app_environment == "production":
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "").strip()
    allowed_origins = [frontend_origin] if frontend_origin else []
else:
    initialize_database()
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api")
app.include_router(local_auth_router, prefix="/api")
app.include_router(local_community_router, prefix="/api")
app.include_router(local_profile_router, prefix="/api")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
