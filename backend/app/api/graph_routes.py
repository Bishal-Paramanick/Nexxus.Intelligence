from app.database.graph_queries import fetch_full_graph
from app.schemas import GraphResponse
from fastapi import APIRouter

router = APIRouter(prefix="/api/graph", tags=["Graph Canvas"])


@router.get("", response_model=GraphResponse)
def get_graph(limit: int = 150):
    return fetch_full_graph(limit=limit)
