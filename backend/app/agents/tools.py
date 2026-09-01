"""
backend/app/agents/tools.py
LangChain tool definitions bridging graph algorithms, analytics, and legal evidence
to the natural language investigation agent.
"""

from __future__ import annotations

import json

import networkx as nx
from langchain_core.tools import tool

from app.services.explanation import get_entity_evidence, get_explanation_path
from app.services.graph_loader import load_graph
from app.services.risk_engine import compute_risk_breakdown
from app.services.schema_mapper import build_entity_detail, build_graph_response


def _resolve_entity_id(G: nx.MultiDiGraph, name_or_id: str) -> str | None:
    """Helper to match an entity by explicit ID or case-insensitive name attribute."""
    query_clean = name_or_id.strip().lower()
    if name_or_id in G:
        return name_or_id
    for node_id, data in G.nodes(data=True):
        if str(node_id).lower() == query_clean:
            return node_id
        node_name = str(data.get("name", "")).strip().lower()
        if node_name and node_name == query_clean:
            return node_id
    return None


@tool
def lookup_suspect_tool(name_or_id: str) -> str:
    """Lookup suspect profile details, metadata, tags, and connection count by ID or name."""
    G = load_graph()
    target_id = _resolve_entity_id(G, name_or_id)

    if not target_id:
        return json.dumps(
            {"error": f"Suspect or entity '{name_or_id}' was not found in the graph."}
        )

    entity_detail = build_entity_detail(G, target_id)
    if not entity_detail:
        return json.dumps(
            {"error": f"Could not build profile details for entity ID '{target_id}'."}
        )

    return entity_detail.model_dump_json(indent=2)


@tool
def get_subgraph_tool(entity_id: str, depth: int = 2) -> str:
    """Extract the local ego-network around entity_id up to the specified hop depth (default: 2)."""
    G = load_graph()
    target_id = _resolve_entity_id(G, entity_id)

    if not target_id:
        return json.dumps({"error": f"Entity '{entity_id}' not found in the graph."})

    # Undirected shortest path length ensures all connected neighborhood hops are captured
    undirected_view = G.to_undirected(as_view=True)
    node_distances = nx.single_source_shortest_path_length(
        undirected_view, source=target_id, cutoff=depth
    )
    subgraph_nodes = list(node_distances.keys())

    sub_G = G.subgraph(subgraph_nodes).copy()
    graph_payload = build_graph_response(sub_G)

    return graph_payload.model_dump_json(indent=2)


@tool
def get_evidence_trail_tool(entity_id: str) -> str:
    """Retrieve Section 65B court-admissible source document citations, timestamps, and circular transaction paths."""
    G = load_graph()
    target_id = _resolve_entity_id(G, entity_id)

    if not target_id:
        return json.dumps({"error": f"Entity '{entity_id}' not found in the graph."})

    evidence_items = get_entity_evidence(G, target_id)
    explanation_paths = get_explanation_path(G, target_id)

    response = {
        "entity_id": str(target_id),
        "admissibility_standard": "Section 65B / BSA Admissible",
        "evidence_count": len(evidence_items),
        "evidence_items": [item.model_dump() for item in evidence_items],
        "explanation_paths": explanation_paths,
    }
    return json.dumps(response, indent=2, default=str)


@tool
def get_risk_breakdown_tool(entity_id: str) -> str:
    """Extract granular risk sub-scores, centrality metrics, recency multiplier, percentile rank, and assigned tags."""
    G = load_graph()
    target_id = _resolve_entity_id(G, entity_id)

    if not target_id:
        return json.dumps({"error": f"Entity '{entity_id}' not found in the graph."})

    risk_results = compute_risk_breakdown(G)
    entity_metrics = risk_results.get(target_id, {})

    if not entity_metrics:
        return json.dumps(
            {"error": f"No risk metrics computed for entity '{target_id}'."}
        )

    breakdown = entity_metrics.get("risk_breakdown", {})

    response = {
        "entity_id": str(target_id),
        "overall_risk_score": entity_metrics.get("overall_risk_score", 0.0),
        "percentile_rank": entity_metrics.get("percentile_rank", 0.0),
        "recency_multiplier": entity_metrics.get("recency_multiplier", 1.0),
        "tags": entity_metrics.get("tags", []),
        "watchlist_reason": entity_metrics.get("watchlist_reason"),
        "bridge_score": entity_metrics.get("bridge_score", 0.0),
        "direct_connections_count": entity_metrics.get("direct_connections_count", 0),
        "risk_breakdown": {
            "degree_centrality": breakdown.get("degree_centrality", 0.0),
            "betweenness_centrality": breakdown.get("betweenness_centrality", 0.0),
            "pagerank_score": breakdown.get("pagerank_score", 0.0),
            "centrality_score": breakdown.get("centrality_score", 0.0),
            "call_frequency_score": breakdown.get("call_frequency_score", 0.0),
            "cross_case_score": breakdown.get("cross_case_score", 0.0),
            "financial_anomaly_score": breakdown.get("financial_anomaly_score", 0.0),
        },
    }
    return json.dumps(response, indent=2, default=str)


ALL_AGENT_TOOLS = [
    lookup_suspect_tool,
    get_subgraph_tool,
    get_evidence_trail_tool,
    get_risk_breakdown_tool,
]
