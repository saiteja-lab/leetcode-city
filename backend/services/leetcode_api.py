from __future__ import annotations

from typing import Any

import requests


LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"
QUERY = """
query userProfileCalendar($username: String!) {
  matchedUser(username: $username) {
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
""".strip()


class LeetCodeAPIError(Exception):
    """Raised when LeetCode data cannot be retrieved for a user."""


def fetch_user_stats(username: str) -> dict[str, int]:
    response = requests.post(
        LEETCODE_GRAPHQL_URL,
        json={
            "query": QUERY,
            "variables": {"username": username},
        },
        timeout=15,
        headers={
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
            "User-Agent": "LeetCode-City-Generator/1.0",
        },
    )
    response.raise_for_status()

    payload: dict[str, Any] = response.json()
    matched_user = payload.get("data", {}).get("matchedUser")
    if not matched_user:
        raise LeetCodeAPIError("LeetCode user not found.")

    submissions = matched_user.get("submitStats", {}).get("acSubmissionNum", [])
    counts = {
        entry.get("difficulty"): entry.get("count", 0)
        for entry in submissions
        if isinstance(entry, dict)
    }

    return {
        "easy": int(counts.get("Easy", 0)),
        "medium": int(counts.get("Medium", 0)),
        "hard": int(counts.get("Hard", 0)),
    }
