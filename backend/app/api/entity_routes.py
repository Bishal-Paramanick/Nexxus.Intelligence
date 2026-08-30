from app.database.graph_queries import fetch_entity_detail, fetch_entity_evidence
from app.schemas import EntityDetailResponse, EvidenceItem
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/api/entity", tags=["Entity Intelligence"])


@router.get("/{id}", response_model=EntityDetailResponse)
def get_entity_detail(id: str):
    entity = fetch_entity_detail(id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity with ID '{id}' was not found in Neo4j graph.",
        )
    return entity


@router.get(
    "/{id}/evidence", response_model=list[EvidenceItem], tags=["Legal Evidence"]
)
def get_entity_evidence(id: str):
    return fetch_entity_evidence(id)
