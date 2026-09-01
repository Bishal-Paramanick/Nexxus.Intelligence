from fastapi import APIRouter, HTTPException, status

from app.schemas import EntityDetailResponse, EvidenceItem
from app.services.api_interface import get_entity_detail
from app.services.explanation import get_entity_evidence
from app.services.graph_loader import load_graph

router = APIRouter(prefix="/api/entity", tags=["Entity Intelligence"])


@router.get("/{id}", response_model=EntityDetailResponse)
def get_entity_detail_route(id: str) -> EntityDetailResponse:
    """Retrieves full profile, risk score factors, and analytical metadata for a suspect."""
    entity = get_entity_detail(id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity with ID '{id}' was not found in the graph.",
        )
    return entity


@router.get(
    "/{id}/evidence", response_model=list[EvidenceItem], tags=["Legal Evidence"]
)
def get_entity_evidence_route(id: str) -> list[EvidenceItem]:
    """Retrieves court-admissible Section 65B FIR excerpts and citations for the Evidence Drawer."""
    G = load_graph()
    return get_entity_evidence(G, id)
