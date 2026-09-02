"""
watchlist.py
Known-offender lookup. Loads from a configurable JSON file instead of a
hardcoded dict, so it's swappable for a real DB/API lookup later without
changing check_watchlist()'s interface.
"""

import json
import os
from pathlib import Path

_DEFAULT_WATCHLIST_PATH = Path(__file__).resolve().parent.parent / "sample_data" / "watchlist.json"
WATCHLIST_PATH = os.environ.get("WATCHLIST_PATH", str(_DEFAULT_WATCHLIST_PATH))
WATCHLIST_BOOST = 15  # flat points added to overall_risk_score on a match


def _load_watchlist(path: str = WATCHLIST_PATH) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}  # no watchlist configured -- not an error, just no boost applied


KNOWN_OFFENDERS = _load_watchlist()


def check_watchlist(entity_id: str, name: str | None = None, offenders: dict | None = None) -> str | None:
    """Returns the watchlist reason string if this entity matches, else None.
    Pass `offenders` to check against a specific dict instead of the
    module-level default (useful for tests or a future DB-backed swap)."""
    lookup = offenders if offenders is not None else KNOWN_OFFENDERS
    if entity_id in lookup:
        return lookup[entity_id]
    if name and name in lookup:
        return lookup[name]
    return None
if __name__ == "__main__":
    print(f"Loaded {len(KNOWN_OFFENDERS)} entries from {WATCHLIST_PATH}")
    print(json.dumps(KNOWN_OFFENDERS, indent=2))