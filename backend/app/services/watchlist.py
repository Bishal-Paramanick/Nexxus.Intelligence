"""
backend/app/services/watchlist.py
Dynamic "known offenders" watchlist lookup service.

Person 1 (NLP Extraction / Entity Resolution):
Normalized Names: Ensure extracted suspect names are cleaned and stripped of honorifics/noise (e.g. "Suresh Kumar" vs "Mr. Suresh") so exact or case-insensitive string matching works reliably.

Person 2 (Neo4j / Data Engineer):
Watchlist Flagging in Graph: Ask if they want known offenders tagged directly as a node label in Neo4j (e.g. :Watchlisted or property is_watchlisted: true), or if they prefer this Python lookup service to remain the single source of truth.

Person 5 (Frontend / UI Canvas Lead):
Display Badge & Tagging: Confirm that watchlist_reason is rendered inside the suspect detail drawer alongside the "Watchlisted" tag badge.

"""

from __future__ import annotations

import json
import os
from pathlib import Path

# Configurable flat point boost added to overall_risk_score
WATCHLIST_BOOST: float = float(os.getenv("WATCHLIST_BOOST", "15.0"))

DEFAULT_WATCHLIST_PATH = (
    Path(__file__).resolve().parent.parent.parent / "sample_data" / "watchlist.json"
)
WATCHLIST_FILE_PATH = os.getenv("WATCHLIST_FILE_PATH", str(DEFAULT_WATCHLIST_PATH))

# In-memory cache fallback
_FALLBACK_OFFENDERS: dict[str, str] = {
    "suresh": "Prior conviction: extortion (2022)",
    "amit": "Named in a prior FIR for financial fraud (2024, case closed - insufficient evidence)",
}


def _load_watchlist() -> dict[str, str]:
    """Loads watchlist mapping dynamically from JSON file, fallback to default."""
    if os.path.exists(WATCHLIST_FILE_PATH):
        try:
            with open(WATCHLIST_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {str(k).strip().lower(): str(v) for k, v in data.items()}
        except Exception:  # noqa: BLE001, S110
            pass
    return _FALLBACK_OFFENDERS


_WATCHLIST_CACHE = _load_watchlist()


def check_watchlist(entity_id: str, name: str | None = None) -> str | None:
    """Returns the watchlist reason string if this entity matches, else None."""
    clean_id = str(entity_id).strip().lower()
    if clean_id in _WATCHLIST_CACHE:
        return _WATCHLIST_CACHE[clean_id]

    if name:
        clean_name = str(name).strip().lower()
        if clean_name in _WATCHLIST_CACHE:
            return _WATCHLIST_CACHE[clean_name]

    return None
