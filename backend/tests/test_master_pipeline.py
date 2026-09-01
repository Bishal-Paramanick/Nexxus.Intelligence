"""
backend/tests/test_master_pipeline.py
Granular end-to-end integration and API verification suite testing:
Abhidha's NLP extraction payload -> NetworkX Loader -> Risk & Analytics Engine -> Agent Tools -> LangGraph -> REST Endpoints
"""

from __future__ import annotations

import json
from typing import Any, cast
from unittest.mock import patch

import pytest
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
    IngestionResponse,
)
from app.services.analytics import (
    compute_centrality,
    detect_circular_transactions,
    detect_communities,
)
from app.services.json_loader import load_from_json
from app.services.risk_engine import compute_risk_breakdown
from app.services.schema_mapper import build_entity_detail, build_graph_response
from fastapi.testclient import TestClient

client = TestClient(app)

# ---------------------------------------------------------------------------
# FIXTURE: Realistic Extracted Data matching Abhidha's extract.py format
# ---------------------------------------------------------------------------
MOCK_EXTRACTION_PAYLOAD: dict[str, Any] = {
    "source_doc": "FIR_101",
    "entities": [
        {
            "id": "P001",
            "name": "Rahul Sharma",
            "type": "Person",
            "source_doc": "FIR_101",
        },
        {
            "id": "P002",
            "name": "Suresh Verma",
            "type": "Person",
            "source_doc": "FIR_101",
        },
        {"id": "P003", "name": "Amit Patel", "type": "Person", "source_doc": "FIR_102"},
        {
            "id": "PH001",
            "number": "9876543210",
            "type": "Phone",
            "source_doc": "CDR_01",
        },
        {
            "id": "PH002",
            "number": "9123456780",
            "type": "Phone",
            "source_doc": "CDR_01",
        },
        {
            "id": "VEH001",
            "registration_number": "WB01AB1234",
            "vehicle_type": "Hyundai Creta",
            "type": "Vehicle",
            "source_doc": "FIR_101",
        },
        {
            "id": "LOC001",
            "name": "Park Street",
            "type": "Location",
            "source_doc": "FIR_101",
        },
        {
            "id": "ORG001",
            "name": "Chatterjee Textiles",
            "type": "Organization",
            "source_doc": "FIR_102",
        },
        {
            "id": "ACC001",
            "account_number": "123456789012",
            "type": "Account",
            "source_doc": "BANK_01",
        },
        {
            "id": "ACC002",
            "account_number": "987654321098",
            "type": "Account",
            "source_doc": "BANK_01",
        },
        {
            "id": "ACC003",
            "account_number": "555566667777",
            "type": "Account",
            "source_doc": "BANK_01",
        },
    ],
    "relationships": [
        {
            "source": "PH001",
            "target": "PH002",
            "type": "CALLED",
            "confidence": 0.95,
            "source_doc": "CDR_01",
            "timestamp": "2026-08-20T10:30:00Z",
            "duration": 180,
            "evidence": "Call record: 9876543210 -> 9123456780, 180s",
        },
        {
            "source": "P001",
            "target": "LOC001",
            "type": "PRESENT_AT",
            "confidence": 0.85,
            "source_doc": "FIR_101",
            "timestamp": "2026-08-20T12:00:00Z",
            "evidence": "Rahul Sharma was seen near Park Street.",
        },
        {
            "source": "P002",
            "target": "VEH001",
            "type": "OWNS_VEHICLE",
            "confidence": 0.90,
            "source_doc": "FIR_101",
            "evidence": "Suresh Verma owns vehicle bearing registration WB01AB1234.",
        },
        {
            "source": "ACC001",
            "target": "ACC002",
            "type": "TRANSACTED_WITH",
            "confidence": 0.95,
            "source_doc": "BANK_01",
            "timestamp": "2026-08-21T10:00:00Z",
            "amount": 500000.0,
            "evidence": "Bank transfer: ACC001 -> ACC002, Rs.500000",
        },
        {
            "source": "ACC002",
            "target": "ACC003",
            "type": "TRANSACTED_WITH",
            "confidence": 0.95,
            "source_doc": "BANK_01",
            "timestamp": "2026-08-21T12:00:00Z",
            "amount": 490000.0,
            "evidence": "Bank transfer: ACC002 -> ACC003, Rs.490000",
        },
        {
            "source": "ACC003",
            "target": "ACC001",
            "type": "TRANSACTED_WITH",
            "confidence": 0.95,
            "source_doc": "BANK_01",
            "timestamp": "2026-08-21T14:00:00Z",
            "amount": 485000.0,
            "evidence": "Bank transfer: ACC003 -> ACC001, Rs.485000",
        },
    ],
}

# Pre-load shared test graph fixture
TEST_GRAPH = load_from_json(MOCK_EXTRACTION_PAYLOAD)


@pytest.fixture(autouse=True)
def patch_graph_loader():
    """Patches all graph loaders across services to return the unified test fixture."""
    with (
        patch("app.services.graph_loader.load_graph", return_value=TEST_GRAPH),
        patch("app.agents.tools.load_graph", return_value=TEST_GRAPH),
        patch("app.agents.graph_agent.load_graph", return_value=TEST_GRAPH),
        patch("app.services.api_interface.load_graph", return_value=TEST_GRAPH),
        patch("app.api.entity_routes.load_graph", return_value=TEST_GRAPH),
    ):
        yield


# ============================================================================
# STAGE 1: INGESTION & EXTRACTION PARSING TESTS
# ============================================================================


class TestMasterIngestion:
    def test_node_and_edge_count(self):
        assert TEST_GRAPH.number_of_nodes() == 11
        assert TEST_GRAPH.number_of_edges() == 6

    def test_account_entity_parsing(self):
        assert TEST_GRAPH.nodes["ACC001"]["type"] == "Account"
        assert TEST_GRAPH.nodes["ACC001"]["account_number"] == "123456789012"

    def test_source_doc_normalization(self):
        for _, _, data in TEST_GRAPH.edges(data=True):
            assert data.get("source_doc") is not None
            assert data.get("doc_id") is not None


# ============================================================================
# STAGE 2: ANALYTICS & RISK SCORING TESTS
# ============================================================================


class TestMasterAnalytics:
    def test_centrality_and_communities(self):
        centrality = compute_centrality(TEST_GRAPH)
        assert "P001" in centrality
        assert "ACC001" in centrality

        communities = detect_communities(TEST_GRAPH)
        assert len(communities) > 0

    def test_circular_transaction_detection(self):
        cycles = detect_circular_transactions(TEST_GRAPH)
        assert len(cycles) >= 1
        assert "ACC001" in cycles[0]["path"]
        assert cycles[0]["significant"] is True

    def test_risk_breakdown_scoring(self):
        risk_results = compute_risk_breakdown(TEST_GRAPH)
        assert len(risk_results) == 11
        acc_risk = risk_results["ACC001"]
        assert acc_risk["overall_risk_score"] > 0.0
        assert acc_risk["risk_breakdown"]["financial_anomaly_score"] > 50.0


# ============================================================================
# STAGE 3: SCHEMA MAPPER & PROVENANCE TESTS
# ============================================================================


class TestMasterSchemaMapper:
    def test_build_graph_response(self):
        graph_resp = build_graph_response(TEST_GRAPH)
        assert isinstance(graph_resp, GraphResponse)
        assert len(graph_resp.nodes) == 11
        assert len(graph_resp.edges) == 6

    def test_vehicle_and_entity_details(self):
        graph_resp = build_graph_response(TEST_GRAPH)
        veh_node = next(n for n in graph_resp.nodes if n.id == "VEH001")
        assert veh_node.type == "Vehicle"
        assert veh_node.properties.registration_number == "WB01AB1234"

        entity_detail = build_entity_detail(TEST_GRAPH, "P001")
        assert isinstance(entity_detail, EntityDetailResponse)
        assert entity_detail.id == "P001"
        assert "FIR_101" in entity_detail.metadata["case_ids"]

    def test_evidence_item_schema(self):
        """Direct test for EvidenceItem schema instantiation and validation."""
        item = EvidenceItem(
            doc_id="FIR_101",
            doc_type="FIR",
            excerpt="Rahul Sharma was seen near Park Street.",
            timestamp="2026-08-20T12:00:00Z",
            confidence=0.85,
            verified_by_nlp=True,
        )
        assert item.doc_id == "FIR_101"
        assert item.doc_type == "FIR"
        assert item.confidence == 0.85
        assert item.verified_by_nlp is True


# ============================================================================
# STAGE 4: AGENT TOOLS EXECUTION TESTS
# ============================================================================


class TestMasterAgentTools:
    def test_lookup_suspect_tool(self):
        profile_json = json.loads(lookup_suspect_tool.invoke({"name_or_id": "P001"}))
        assert "error" not in profile_json
        assert profile_json["id"] == "P001"

    def test_get_subgraph_tool(self):
        subgraph_json = json.loads(
            get_subgraph_tool.invoke({"entity_id": "P001", "depth": 1})
        )
        assert "nodes" in subgraph_json
        assert "edges" in subgraph_json

    def test_get_evidence_trail_tool(self):
        evidence_json = json.loads(
            get_evidence_trail_tool.invoke({"entity_id": "ACC001"})
        )
        assert evidence_json["admissibility_standard"] == "Section 65B / BSA Admissible"
        assert len(evidence_json["evidence_items"]) > 0

    def test_get_risk_breakdown_tool(self):
        risk_tool_json = json.loads(
            get_risk_breakdown_tool.invoke({"entity_id": "P001"})
        )
        assert "overall_risk_score" in risk_tool_json
        assert "risk_breakdown" in risk_tool_json


# ============================================================================
# STAGE 5: LANGGRAPH AGENT WORKFLOW & SYNTHESIS TESTS
# ============================================================================


class TestMasterLangGraphAgent:
    def test_query_agent_node_classification(self):
        """Direct test of query_agent_node intent and target entity parsing."""
        state = cast(
            AgentState,
            {
                "query": "Show legal evidence and FIR trail for Rahul",
                "target_entity": None,
                "intent": None,
                "raw_results": {},
                "highlighted_nodes": [],
                "evidence": [],
                "subgraph": None,
                "final_answer": "",
            },
        )
        res = query_agent_node(state)
        assert res["intent"] == "get_evidence"
        assert res["target_entity"] == "P001"

    def test_tool_execution_node(self):
        """Direct test of tool_execution_node tool dispatching."""
        state = cast(
            AgentState,
            {
                "query": "What is the risk score for P001?",
                "target_entity": "P001",
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
        assert "P001" in res["highlighted_nodes"]

    def test_synthesis_node(self):
        """Direct test of synthesis_node natural language report formatting."""
        state = cast(
            AgentState,
            {
                "query": "What is the risk score for P001?",
                "target_entity": "P001",
                "intent": "get_risk",
                "raw_results": {
                    "overall_risk_score": 82.5,
                    "percentile_rank": 90.0,
                    "tags": ["Kingpin"],
                    "risk_breakdown": {
                        "financial_anomaly_score": 60.0,
                        "cross_case_score": 70.0,
                        "call_frequency_score": 40.0,
                        "betweenness_centrality": 85.0,
                    },
                },
                "highlighted_nodes": ["P001"],
                "evidence": [],
                "subgraph": None,
                "final_answer": "",
            },
        )
        res = synthesis_node(state)
        assert "final_answer" in res
        assert "82.5/100" in res["final_answer"]
        assert "Kingpin" in res["final_answer"]

    def test_evidence_investigative_query(self):
        ev_response = run_agent_query("Show legal evidence and FIR trail for Rahul")
        assert isinstance(ev_response, AgentQueryResponse)
        assert ev_response.query is not None
        assert (
            "Investigative Report" in ev_response.answer
            or "Evidence Records" in ev_response.answer
        )

    def test_risk_investigative_query(self):
        risk_response = run_agent_query(
            "What is the risk score and breakdown for P001?"
        )
        assert isinstance(risk_response, AgentQueryResponse)
        assert (
            "Overall Risk Score" in risk_response.answer
            or "Sub-Score Breakdown" in risk_response.answer
        )


# ============================================================================
# STAGE 6: REST ENDPOINT INTEGRATION TESTS (FASTAPI)
# ============================================================================


class TestMasterRestEndpoints:
    def test_get_graph_route(self):
        res = client.get("/api/graph")
        assert res.status_code == 200
        assert len(res.json()["nodes"]) == 11

    def test_get_entity_detail_route(self):
        res = client.get("/api/entity/P001")
        assert res.status_code == 200
        assert res.json()["id"] == "P001"

    def test_get_entity_evidence_route(self):
        res = client.get("/api/entity/P001/evidence")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_post_agent_query_route(self):
        res = client.post("/api/agent/query", json={"query": "Lookup suspect Rahul"})
        assert res.status_code == 200
        body = res.json()
        assert "answer" in body
        assert "highlighted_nodes" in body

    def test_post_ingest_route(self):
        res = client.post("/api/ingest", json=MOCK_EXTRACTION_PAYLOAD)
        assert res.status_code == 200
        ingest_model = IngestionResponse.model_validate(res.json())
        assert ingest_model.status == "success"
        assert ingest_model.nodes_processed >= 11
        assert ingest_model.relationships_processed >= 6
