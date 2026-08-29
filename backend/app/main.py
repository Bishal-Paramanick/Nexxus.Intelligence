from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.database.graph_queries import (
    batch_ingest_payload,
    fetch_entity_detail,
    fetch_entity_evidence,
    fetch_full_graph,
)
from app.database.neo4j_driver import db
from app.schemas import (
    AgentQueryRequest,
    AgentQueryResponse,
    EntityDetailResponse,
    EvidenceItem,
    GraphResponse,
    IngestionPayload,
    IngestionResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify Neo4j connectivity at startup
    if not db.verify_connectivity():
        print("[Warning] Neo4j instance is not reachable at startup.")
    else:
        print("[Startup] Connected to Neo4j database successfully.")
    yield
    # Gracefully close connection pool on shutdown
    db.close()
    print("[Shutdown] Neo4j connection pool closed.")


app = FastAPI(
    title="Crime Network Graph Intelligence API",
    description="Backend services for crime pattern detection, evidence auditing, and graph visualization.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 1. Graph Canvas Endpoint (Live Neo4j) ---
@app.get("/api/graph", response_model=GraphResponse, tags=["Graph Canvas"])
def get_graph(limit: int = 150):
    return fetch_full_graph(limit=limit)


# --- 2. Entity Intelligence Detail Endpoint (Live Neo4j) ---
@app.get(
    "/api/entity/{id}",
    response_model=EntityDetailResponse,
    tags=["Entity Intelligence"],
)
def get_entity_detail(id: str):
    entity = fetch_entity_detail(id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity with ID '{id}' was not found in Neo4j graph.",
        )
    return entity


# --- 3. Legal Evidence Audit Drawer Endpoint (Live Neo4j) ---
@app.get(
    "/api/entity/{id}/evidence",
    response_model=list[EvidenceItem],
    tags=["Legal Evidence"],
)
def get_entity_evidence(id: str):
    return fetch_entity_evidence(id)


# --- 4. Ingestion Endpoint (Live Neo4j Batch Ingest) ---
@app.post(
    "/api/ingest",
    response_model=IngestionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Ingestion"],
)
def ingest_data(payload: IngestionPayload):
    return batch_ingest_payload(payload)


# --- 5. Agent Natural Language Query Endpoint ---
@app.post(
    "/api/agent/query",
    response_model=AgentQueryResponse,
    tags=["Agent Copilot"],
)
def query_agent(request: AgentQueryRequest):
    cypher_query = """
    MATCH (s:Person)-[r:TRANSACTED_WITH]->(b)
    RETURN s.name AS suspect, type(r) AS rel, coalesce(b.name, b.id) AS target
    LIMIT 5
    """
    records = db.query(cypher_query)

    return AgentQueryResponse(
        query=request.query,
        cypher_generated=cypher_query.strip(),
        answer=f"Found {len(records)} financial transactions linking key suspects across the network.",
        highlighted_nodes=["P001", "P003", "ORG001"],
        subgraph=fetch_full_graph(limit=10),
        evidence=fetch_entity_evidence("P001"),
    )
