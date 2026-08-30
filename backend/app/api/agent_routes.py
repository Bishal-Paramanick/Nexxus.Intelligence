from app.database.graph_queries import fetch_entity_evidence, fetch_full_graph
from app.database.neo4j_driver import db
from app.schemas import AgentQueryRequest, AgentQueryResponse
from fastapi import APIRouter

router = APIRouter(prefix="/api/agent", tags=["Agent Copilot"])


@router.post("/query", response_model=AgentQueryResponse)
def query_agent(request: AgentQueryRequest):
    # This placeholder logic can later be replaced with run_agent_query() from LangGraph
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
