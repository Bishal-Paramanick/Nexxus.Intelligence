from fastapi import APIRouter, status

from app.database.graph_queries import batch_ingest_payload
from app.schemas import IngestionPayload, IngestionResponse

# Must define and export 'router'
router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])


@router.post("", response_model=IngestionResponse, status_code=status.HTTP_200_OK)
def ingest_data(payload: IngestionPayload):
    return batch_ingest_payload(payload)
