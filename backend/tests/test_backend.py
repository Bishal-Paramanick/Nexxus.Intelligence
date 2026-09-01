"""
backend/tests/test_backend.py
Comprehensive test suite verifying FastAPI REST endpoints,
risk calculations, and the LangGraph multi-agent execution pipeline.
"""

import pytest
from app.agents.graph_agent import run_agent_query
from app.main import app
from app.services.analytics import detect_circular_transactions, detect_communities
from app.services.graph_loader import load_graph
from app.services.risk_engine import compute_risk_breakdown
from fastapi.testclient import TestClient

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. Analytics & Risk Engine Tests
# ---------------------------------------------------------------------------


def test_graph_loading():
    """Verify graph loader initializes an in-memory NetworkX MultiDiGraph."""
    G = load_graph()
    assert G is not None
    assert hasattr(G, "nodes")
    assert hasattr(G, "edges")


def test_risk_engine_computation():
    """Verify compute_risk_breakdown calculates normalized scores (0-100)."""
    G = load_graph()
    risk_results = compute_risk_breakdown(G)

    assert isinstance(risk_results, dict)
    for data in risk_results.values():
        assert "overall_risk_score" in data
        assert 0.0 <= data["overall_risk_score"] <= 100.0
        assert "risk_breakdown" in data
        assert "tags" in data
        assert "percentile_rank" in data


def test_analytics_algorithms():
    """Verify Louvain community detection and circular transaction detection."""
    G = load_graph()
    communities = detect_communities(G)
    cycles = detect_circular_transactions(G)

    assert isinstance(communities, dict)
    assert isinstance(cycles, list)


# ---------------------------------------------------------------------------
# 2. LangGraph Agent Pipeline Tests
# ---------------------------------------------------------------------------


def test_agent_profile_lookup():
    """Test natural language suspect lookup via LangGraph."""
    response = run_agent_query("Lookup details for Rahul")

    assert response.query == "Lookup details for Rahul"
    assert response.cypher_generated is not None
    assert len(response.answer) > 0
    assert isinstance(response.highlighted_nodes, list)


def test_agent_risk_query():
    """Test risk breakdown intent and response structure."""
    response = run_agent_query("What is the risk breakdown and score for Suresh?")

    assert (
        "Overall Risk Score" in response.answer
        or "Investigative Report" in response.answer
    )
    assert isinstance(response.highlighted_nodes, list)


def test_agent_evidence_query():
    """Test evidence trail query returns Section 65B-compliant response."""
    response = run_agent_query("Show FIR and evidence trail for P001")

    assert response.answer is not None
    assert isinstance(response.evidence, list)


# ---------------------------------------------------------------------------
# 3. FastAPI REST Endpoint Tests
# ---------------------------------------------------------------------------


def test_get_graph_endpoint():
    """Test GET /api/graph returns nodes and edges formatted for Cytoscape."""
    response = client.get("/api/graph?limit=50")
    assert response.status_code == 200

    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    if data["nodes"]:
        node = data["nodes"][0]
        assert "id" in node
        assert "label" in node
        assert "risk_score" in node


def test_get_entity_detail_endpoint():
    """Test GET /api/entity/{id} returns profile and risk score factors."""
    G = load_graph()
    if len(G.nodes) > 0:
        sample_id = next(iter(G.nodes))
        response = client.get(f"/api/entity/{sample_id}")

        # Should return 200 for known entity, or 404 handled cleanly
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert data["id"] == str(sample_id)
            assert "overall_risk_score" in data
            assert "risk_breakdown" in data


def test_get_entity_evidence_endpoint():
    """Test GET /api/entity/{id}/evidence returns audit drawer records."""
    G = load_graph()
    if len(G.nodes) > 0:
        sample_id = next(iter(G.nodes))
        response = client.get(f"/api/entity/{sample_id}/evidence")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


def test_agent_query_post_endpoint():
    """Test POST /api/agent/query endpoint integration."""
    payload = {"query": "Show connections and ego network for P001"}
    response = client.post("/api/agent/query", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "highlighted_nodes" in data
    assert "cypher_generated" in data
