"""
backend/app/services/api_interface.py
Unified service layer interface consumed by FastAPI routers.

Preferable updates:-
  1.Asynchronous Support (async/await):
  When switching to an async Neo4j driver or handling concurrent database requests in FastAPI,
  you will need to update these functions to async def and await database operations

  2.Filtering & Pagination:
  If the graph grows to thousands of nodes,
  you will need to upgrade these functions to accept query parameters
 (e.g., community_id, min_risk_score, limit, offset) to avoid returning massive payloads to the frontend visualizer
"""

from __future__ import annotations

from app.schemas import EntityDetailResponse, GraphResponse
from app.services.graph_loader import load_graph
from app.services.schema_mapper import build_entity_detail, build_graph_response


def get_full_analysis() -> GraphResponse:
    """One call, returns everything the frontend graph visualizer needs.
    Cache this in the API layer (recompute on an interval) rather than running per-request.
    """
    G = load_graph()
    return build_graph_response(G)


def get_entity_detail(entity_id: str) -> EntityDetailResponse | None:
    """Single-entity lookup for GET /api/entity/{entity_id} endpoint."""
    G = load_graph()
    return build_entity_detail(G, entity_id)


if __name__ == "__main__":
    result = get_full_analysis()
    print(result.model_dump_json(indent=2))
    print("\n--- Example entity detail (Rahul) ---")
    detail = get_entity_detail("Rahul")
    if detail:
        print(detail.model_dump_json(indent=2))
