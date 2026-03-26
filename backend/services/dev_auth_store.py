from __future__ import annotations

import hashlib
import hmac
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


DATABASE_PATH = Path(__file__).resolve().parent.parent / "development.sqlite3"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def _get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    try:
        yield connection
    finally:
        connection.close()


def initialize_database() -> None:
    with _get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS city_buildings (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                email TEXT NOT NULL,
                leetcode_username TEXT NOT NULL,
                easy INTEGER NOT NULL DEFAULT 0,
                medium INTEGER NOT NULL DEFAULT 0,
                hard INTEGER NOT NULL DEFAULT 0,
                houses INTEGER NOT NULL DEFAULT 0,
                buildings INTEGER NOT NULL DEFAULT 0,
                skyscrapers INTEGER NOT NULL DEFAULT 0,
                city_level TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE (user_id, leetcode_username)
            );

            CREATE TABLE IF NOT EXISTS user_profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                avatar_data_url TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """
        )
        connection.commit()


def _hash_password(password: str, salt_hex: str | None = None) -> tuple[str, str]:
    salt = bytes.fromhex(salt_hex) if salt_hex else secrets.token_bytes(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        200_000,
    )
    return salt.hex(), password_hash.hex()


def _serialize_user(row: sqlite3.Row) -> dict[str, str]:
    return {
        "id": row["id"],
        "email": row["email"],
        "created_at": row["created_at"],
    }


def _create_session(connection: sqlite3.Connection, user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    connection.execute(
        """
        INSERT INTO sessions (token, user_id, created_at)
        VALUES (?, ?, ?)
        """,
        (token, user_id, _utc_now()),
    )
    return token


def create_user(email: str, password: str) -> dict:
    normalized_email = email.strip().lower()
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")

    salt_hex, password_hash = _hash_password(password)
    user_id = str(uuid4())
    created_at = _utc_now()

    with _get_connection() as connection:
        existing_user = connection.execute(
            "SELECT id FROM users WHERE email = ?",
            (normalized_email,),
        ).fetchone()
        if existing_user:
            raise ValueError("An account with that email already exists.")

        connection.execute(
            """
            INSERT INTO users (id, email, password_salt, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, normalized_email, salt_hex, password_hash, created_at),
        )
        token = _create_session(connection, user_id)
        connection.commit()

    return {
        "session": {
            "access_token": token,
            "user": {
                "id": user_id,
                "email": normalized_email,
                "created_at": created_at,
            },
        }
    }


def authenticate_user(email: str, password: str) -> dict:
    normalized_email = email.strip().lower()

    with _get_connection() as connection:
        user = connection.execute(
            """
            SELECT id, email, password_salt, password_hash, created_at
            FROM users
            WHERE email = ?
            """,
            (normalized_email,),
        ).fetchone()

        if not user:
            raise ValueError("Invalid email or password.")

        _, computed_hash = _hash_password(password, user["password_salt"])
        if not hmac.compare_digest(computed_hash, user["password_hash"]):
            raise ValueError("Invalid email or password.")

        token = _create_session(connection, user["id"])
        connection.commit()

    return {
        "session": {
            "access_token": token,
            "user": _serialize_user(user),
        }
    }


def get_user_for_token(token: str) -> dict[str, str] | None:
    with _get_connection() as connection:
        row = connection.execute(
            """
            SELECT users.id, users.email
                 , users.created_at
            FROM sessions
            INNER JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ?
            """,
            (token,),
        ).fetchone()

    if not row:
        return None

    return _serialize_user(row)


def delete_session(token: str) -> None:
    with _get_connection() as connection:
        connection.execute(
            "DELETE FROM sessions WHERE token = ?",
            (token,),
        )
        connection.commit()


def fetch_user_profile(user_id: str) -> dict | None:
    with _get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM user_profiles
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()

    return dict(row) if row else None


def upsert_user_profile(user_id: str, avatar_data_url: str | None) -> dict:
    timestamp = _utc_now()

    with _get_connection() as connection:
        existing_profile = connection.execute(
            """
            SELECT id, created_at
            FROM user_profiles
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()

        if existing_profile:
            profile_id = existing_profile["id"]
            connection.execute(
                """
                UPDATE user_profiles
                SET avatar_data_url = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (avatar_data_url, timestamp, profile_id),
            )
        else:
            profile_id = str(uuid4())
            connection.execute(
                """
                INSERT INTO user_profiles (
                    id,
                    user_id,
                    avatar_data_url,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (profile_id, user_id, avatar_data_url, timestamp, timestamp),
            )

        connection.commit()

        row = connection.execute(
            """
            SELECT *
            FROM user_profiles
            WHERE id = ?
            """,
            (profile_id,),
        ).fetchone()

    return dict(row)


def fetch_community_cities() -> list[dict]:
    with _get_connection() as connection:
        rows = connection.execute(
            """
            SELECT *
            FROM city_buildings
            ORDER BY updated_at DESC
            """
        ).fetchall()

    return [dict(row) for row in rows]


def upsert_city_for_user(user: dict[str, str], payload: dict) -> dict:
    timestamp = _utc_now()
    normalized_username = payload["username"].strip()

    with _get_connection() as connection:
        existing_username = connection.execute(
            """
            SELECT id, user_id, email, created_at
            FROM city_buildings
            WHERE lower(leetcode_username) = lower(?)
            """,
            (normalized_username,),
        ).fetchone()

        if existing_username:
            city_id = existing_username["id"]
            connection.execute(
                """
                UPDATE city_buildings
                SET easy = ?,
                    medium = ?,
                    hard = ?,
                    houses = ?,
                    buildings = ?,
                    skyscrapers = ?,
                    city_level = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (
                    payload["easy"],
                    payload["medium"],
                    payload["hard"],
                    payload["city"]["houses"],
                    payload["city"]["buildings"],
                    payload["city"]["skyscrapers"],
                    payload["city"]["level"],
                    timestamp,
                    city_id,
                ),
            )
        else:
            city_id = str(uuid4())
            connection.execute(
                """
                INSERT INTO city_buildings (
                    id,
                    user_id,
                    email,
                    leetcode_username,
                    easy,
                    medium,
                    hard,
                    houses,
                    buildings,
                    skyscrapers,
                    city_level,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    city_id,
                    user["id"],
                    user["email"],
                    normalized_username,
                    payload["easy"],
                    payload["medium"],
                    payload["hard"],
                    payload["city"]["houses"],
                    payload["city"]["buildings"],
                    payload["city"]["skyscrapers"],
                    payload["city"]["level"],
                    timestamp,
                    timestamp,
                ),
            )
        connection.commit()

        row = connection.execute(
            "SELECT * FROM city_buildings WHERE id = ?",
            (city_id,),
        ).fetchone()

    return dict(row)
