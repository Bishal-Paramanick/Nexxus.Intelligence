from fastapi import APIRouter

from app.agents.graph_agent import run_agent_query
from app.schemas import AgentQueryRequest, AgentQueryResponse

router = APIRouter(prefix="/api/agent", tags=["Agent Copilot"])


@router.post("/query", response_model=AgentQueryResponse)
def query_agent(request: AgentQueryRequest) -> AgentQueryResponse:
    """Executes the LangGraph multi-agent pipeline and returns synthesized findings,
    highlighted nodes for Cytoscape, subgraphs, and FIR evidence items."""
    return run_agent_query(request.query)
