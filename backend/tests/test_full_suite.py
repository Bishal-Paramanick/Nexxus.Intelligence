"""
backend/tests/test_full_suite.py
End-to-end integration and unit test suite covering Phases 1, 2, and 3.
"""

from __future__ import annotations

import json
from typing import cast

from app.agents.graph_agent import (
    query_agent_node,
    run_agent_query,
    synthesis_node,
    tool_execution_node,
)
from app.agents.state import AgentState
from app.agents.tools import (
    get_evidence_trail_tool,
    get_risk_breakdown_tool,
    get_subgraph_tool,
    lookup_suspect_tool,
)
from app.main import app
from app.schemas import (
    AgentQueryResponse,
    EntityDetailResponse,
    EvidenceItem,
    GraphResponse,
    RiskBreakdown,
)
from app.services.analytics import (
    compute_bridge_score,
    compute_centrality,
    detect_call_bursts,
    detect_circular_transactions,
    detect_communities,
    detect_cross_case_entities,
)
from app.services.graph_loader import load_graph
from app.services.risk_engine import compute_risk_breakdown
from app.services.schema_mapper import build_entity_detail, build_graph_response
from fastapi.testclient import TestClient

client = TestClient(app)


# ============================================================================
# PHASE 1 TESTS: SCHEMAS, ANALYTICS & RISK ENGINE FOUNDATION
# ============================================================================


class TestPhase1Foundation:
    def test_schema_validations(self):
        """Validate strict Pydantic model instantiations."""
        rb = RiskBreakdown(
            degree_centrality=50.0,
            pagerank_score=40.0,
            betweenness_centrality=80.0,
            centrality_score=65.0,
            call_frequency_score=90.0,
            cross_case_score=75.0,
            financial_anomaly_score=100.0,
        )
        assert rb.financial_anomaly_score == 100.0

        ev = EvidenceItem(
            doc_id="FIR_102",
            doc_type="FIR",
            excerpt="Suspect observed near location",
            timestamp="2026-08-20T14:32:00Z",
            confidence=0.95,
        )
        assert ev.confidence == 0.95

    def test_analytics_algorithms_isolated(self):
        """Verify graph algorithms compute expected structures without errors."""
        G = load_graph()

        centrality = compute_centrality(G)
        assert isinstance(centrality, dict)

        bridges = compute_bridge_score(centrality)
        assert isinstance(bridges, dict)

        communities = detect_communities(G)
        assert isinstance(communities, dict)

        cycles = detect_circular_transactions(G)
        assert isinstance(cycles, list)

        bursts = detect_call_bursts(G)
        assert isinstance(bursts, list)

        cross_cases = detect_cross_case_entities(G)
        assert isinstance(cross_cases, dict)

    def test_risk_engine_scoring_and_tags(self):
        """Verify risk breakdown calculates 0-100 scores and assigns role tags."""
        G = load_graph()
        risk_results = compute_risk_breakdown(G)

        assert len(risk_results) > 0
        for data in risk_results.values():
            assert "overall_risk_score" in data
            assert 0.0 <= data["overall_risk_score"] <= 100.0
            assert "risk_breakdown" in data
            assert "tags" in data
            assert isinstance(data["tags"], list)
            assert "direct_connections_count" in data
            assert "percentile_rank" in data

    def test_schema_mapper_builds_models(self):
        """Verify schema_mapper outputs valid Pydantic responses."""
        G = load_graph()
        graph_response = build_graph_response(G)
        assert isinstance(graph_response, GraphResponse)
        assert len(graph_response.nodes) > 0

        if len(G.nodes) > 0:
            sample_id = next(iter(G.nodes))
            detail = build_entity_detail(G, sample_id)
            if detail is not None:
                assert isinstance(detail, EntityDetailResponse)
                assert detail.id == sample_id


# ============================================================================
# PHASE 2 TESTS: LANGCHAIN AGENT TOOLS
# ============================================================================


class TestPhase2Tools:
    def test_lookup_suspect_tool_success_and_fail(self):
        """Test lookup_suspect_tool on known vs missing entities."""
        G = load_graph()
        if len(G.nodes) > 0:
            sample_id = next(iter(G.nodes))
            res_str = lookup_suspect_tool.invoke({"name_or_id": str(sample_id)})
            data = json.loads(res_str)
            assert "id" in data
            assert data["id"] == str(sample_id)

        # Missing entity test
        fail_str = lookup_suspect_tool.invoke({"name_or_id": "NON_EXISTENT_ID_999"})
        fail_data = json.loads(fail_str)
        assert "error" in fail_data

    def test_get_subgraph_tool(self):
        """Test ego-network extraction up to 2 hops."""
        G = load_graph()
        if len(G.nodes) > 0:
            sample_id = next(iter(G.nodes))
            res_str = get_subgraph_tool.invoke(
                {"entity_id": str(sample_id), "depth": 2}
            )
            data = json.loads(res_str)
            assert "nodes" in data
            assert "edges" in data

    def test_get_evidence_trail_tool(self):
        """Test Section 65B court evidence retrieval tool."""
        G = load_graph()
        if len(G.nodes) > 0:
            sample_id = next(iter(G.nodes))
            res_str = get_evidence_trail_tool.invoke({"entity_id": str(sample_id)})
            data = json.loads(res_str)
            assert "admissibility_standard" in data
            assert "evidence_items" in data
            assert "explanation_paths" in data

    def test_get_risk_breakdown_tool(self):
        """Test risk breakdown metrics tool."""
        G = load_graph()
        if len(G.nodes) > 0:
            sample_id = next(iter(G.nodes))
            res_str = get_risk_breakdown_tool.invoke({"entity_id": str(sample_id)})
            data = json.loads(res_str)
            assert "overall_risk_score" in data
            assert "risk_breakdown" in data


# ============================================================================
# PHASE 3 TESTS: LANGGRAPH MULTI-AGENT STATE MACHINE
# ============================================================================


class TestPhase3LangGraphAgent:
    def test_query_agent_node_classification(self):
        """Test intent classification logic in the Query Agent Node."""
        # Evidence intent
        state1 = cast(
            AgentState,
            {
                "query": "Show FIR evidence and proof for P001",
                "target_entity": None,
                "intent": None,
                "raw_results": {},
                "highlighted_nodes": [],
                "evidence": [],
                "subgraph": None,
                "final_answer": "",
            },
        )
        res1 = query_agent_node(state1)
        assert res1["intent"] == "get_evidence"
        assert res1["target_entity"] == "P001"

        # Risk intent
        state2 = cast(
            AgentState,
            {
                "query": "What is the risk score and breakdown for P002?",
                "target_entity": None,
                "intent": None,
                "raw_results": {},
                "highlighted_nodes": [],
                "evidence": [],
                "subgraph": None,
                "final_answer": "",
            },
        )
        res2 = query_agent_node(state2)
        assert res2["intent"] == "get_risk"
        assert res2["target_entity"] == "P002"

        # Subgraph intent
        state3 = cast(
            AgentState,
            {
                "query": "Show connections and local network for P003",
                "target_entity": None,
                "intent": None,
                "raw_results": {},
                "highlighted_nodes": [],
                "evidence": [],
                "subgraph": None,
                "final_answer": "",
            },
        )
        res3 = query_agent_node(state3)
        assert res3["intent"] == "get_subgraph"
        assert res3["target_entity"] == "P003"

    def test_tool_execution_node(self):
        """Test dynamic tool selection and execution node."""
        G = load_graph()
        if len(G.nodes) > 0:
            sample_id = next(iter(G.nodes))
            state = cast(
                AgentState,
                {
                    "query": "What is the risk score?",
                    "target_entity": str(sample_id),
                    "intent": "get_risk",
                    "raw_results": {},
                    "highlighted_nodes": [],
                    "evidence": [],
                    "subgraph": None,
                    "final_answer": "",
                },
            )
            res = tool_execution_node(state)
            assert "overall_risk_score" in res["raw_results"]
            assert len(res["highlighted_nodes"]) > 0

    def test_synthesis_node(self):
        """Test natural language synthesis node."""
        state = cast(
            AgentState,
            {
                "query": "Check risk score",
                "target_entity": "P001",
                "intent": "get_risk",
                "raw_results": {
                    "overall_risk_score": 88.5,
                    "percentile_rank": 95.0,
                    "tags": ["Kingpin", "Bridge Node"],
                    "risk_breakdown": {
                        "financial_anomaly_score": 100.0,
                        "cross_case_score": 80.0,
                        "call_frequency_score": 75.0,
                        "betweenness_centrality": 90.0,
                    },
                },
                "highlighted_nodes": [],
                "evidence": [],
                "subgraph": None,
                "final_answer": "",
            },
        )
        res = synthesis_node(state)
        assert "final_answer" in res
        assert "88.5/100" in res["final_answer"]
        assert "Kingpin" in res["final_answer"]

    def test_end_to_end_agent_queries(self):
        """Test the full compiled LangGraph workflow via run_agent_query."""
        queries = [
            "Lookup details for suspect Rahul",
            "What is the risk breakdown for Suresh?",
            "Show legal evidence and FIR records for P001",
            "Give me the local neighborhood network for P001",
            "Unknown suspect query with no entity",
        ]

        for q in queries:
            response = run_agent_query(q)
            assert isinstance(response, AgentQueryResponse)
            assert response.query == q
            assert response.cypher_generated is not None
            assert len(response.answer) > 0


# ============================================================================
# API ENDPOINT INTEGRATION TESTS (FASTAPI ROUTERS)
# ============================================================================


class TestApiEndpoints:
    def test_get_graph_route(self):
        response = client.get("/api/graph")
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data

    def test_get_entity_detail_route(self):
        G = load_graph()
        if len(G.nodes) > 0:
            sample_id = next(iter(G.nodes))
            response = client.get(f"/api/entity/{sample_id}")
            assert response.status_code in [200, 404]

    def test_get_entity_evidence_route(self):
        G = load_graph()
        if len(G.nodes) > 0:
            sample_id = next(iter(G.nodes))
            response = client.get(f"/api/entity/{sample_id}/evidence")
            assert response.status_code == 200
            assert isinstance(response.json(), list)

    def test_post_agent_query_route(self):
        payload = {"query": "Show FIR evidence and proof for P001"}
        response = client.post("/api/agent/query", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "cypher_generated" in data
        assert "highlighted_nodes" in data
