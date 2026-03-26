from __future__ import annotations


def _get_city_level(houses: int, buildings: int, skyscrapers: int) -> str:
    score = houses + (buildings * 2) + (skyscrapers * 3)
    if score >= 90:
        return "Advanced"
    if score >= 35:
        return "Intermediate"
    return "Beginner"


def generate_city_model(easy: int, medium: int, hard: int) -> dict[str, int | str]:
    houses = max(easy // 10, 1 if easy > 0 else 0)
    buildings = max(medium // 5, 1 if medium > 0 else 0)
    skyscrapers = max(hard // 2, 1 if hard > 0 else 0)

    return {
        "houses": houses,
        "buildings": buildings,
        "skyscrapers": skyscrapers,
        "level": _get_city_level(houses, buildings, skyscrapers),
    }
