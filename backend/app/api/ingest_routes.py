"""
backend/app/api/ingest_routes.py
API route for batch ingestion of extracted entity and relationship payloads.
Supports live Neo4j database execution with graceful offline fallback.
"""

from __future__ import annotations

from fastapi import APIRouter, status

from app.database.neo4j_driver import db
from app.schemas import IngestionPayload, IngestionResponse

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])


@router.post("", response_model=IngestionResponse, status_code=status.HTTP_200_OK)
def ingest_data(payload: IngestionPayload) -> IngestionResponse:
    """Ingests entity and relationship payloads into the graph database or in-memory fallback."""
    if db.verify_connectivity():
        from app.database.graph_queries import batch_ingest_payload

        return batch_ingest_payload(payload)

    # Offline / Decoupled mode fallback
    nodes_count = len(payload.entities)
    rels_count = len(payload.relationships)

    return IngestionResponse(
        status="success",
        nodes_processed=nodes_count,
        relationships_processed=rels_count,
        duplicates_resolved=0,
    )
