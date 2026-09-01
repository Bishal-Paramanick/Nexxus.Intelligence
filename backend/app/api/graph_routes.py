from fastapi import APIRouter

from app.schemas import GraphResponse
from app.services.api_interface import get_full_analysis

router = APIRouter(prefix="/api/graph", tags=["Graph Canvas"])


@router.get("", response_model=GraphResponse)
def get_graph(limit: int = 150) -> GraphResponse:
    """Delivers graph nodes, edges, risk levels, and cluster IDs for Cytoscape.js canvas."""
    return get_full_analysis()
