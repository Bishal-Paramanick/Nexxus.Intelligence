"""
backend/app/agents/graph_agent.py
LangGraph multi-agent state machine for orchestrating investigative graph queries,
tool execution, and Section 65B-compliant legal evidence synthesis.
"""

from __future__ import annotations

import json
import re
from typing import Any

from langgraph.graph import END, StateGraph

from app.agents.state import AgentState
from app.agents.tools import (
    get_evidence_trail_tool,
    get_risk_breakdown_tool,
    get_subgraph_tool,
    lookup_suspect_tool,
)
from app.schemas import AgentQueryResponse, EvidenceItem, GraphResponse
from app.services.graph_loader import load_graph


def query_agent_node(state: AgentState) -> dict[str, Any]:
    query = state.get("query", "").strip()
    query_lower = query.lower()

    # Load graph to detect named entities or node IDs in prompt
    G = load_graph()
    target_entity = None

    # Pass 1: Match ID or full case-insensitive name
    for node, data in G.nodes(data=True):
        node_str = str(node).lower()
        name_str = str(data.get("name", "")).lower()

        if re.search(rf"\b{re.escape(node_str)}\b", query_lower):
            target_entity = str(node)
            break
        if name_str and re.search(rf"\b{re.escape(name_str)}\b", query_lower):
            target_entity = str(node)
            break

    # Pass 2: Match individual name tokens (e.g., 'Rahul' -> 'Rahul Sharma')
    if not target_entity:
        for node, data in G.nodes(data=True):
            name_str = str(data.get("name", "")).strip().lower()
            if name_str:
                tokens = [t for t in name_str.split() if len(t) > 2]
                if any(
                    re.search(rf"\b{re.escape(tok)}\b", query_lower) for tok in tokens
                ):
                    target_entity = str(node)
                    break

    # Fallback heuristic: pick token resembling an ID (e.g., P001, PH001)
    if not target_entity:
        id_match = re.search(r"\b([A-Za-z]{1,3}\d{3,4})\b", query)
        if id_match:
            target_entity = id_match.group(1)

    # Rule-based intent classification
    if any(
        k in query_lower
        for k in ["evidence", "fir", "proof", "legal", "trail", "court", "admissible"]
    ):
        intent = "get_evidence"
    elif any(
        k in query_lower
        for k in [
            "risk",
            "breakdown",
            "score",
            "centrality",
            "kingpin",
            "mule",
            "burst",
        ]
    ):
        intent = "get_risk"
    elif any(
        k in query_lower
        for k in ["subgraph", "network", "neighbors", "connections", "cluster", "ego"]
    ):
        intent = "get_subgraph"
    else:
        intent = "lookup_profile"

    return {
        "target_entity": target_entity,
        "intent": intent,
        "raw_results": {},
        "highlighted_nodes": [],
        "evidence": [],
        "subgraph": None,
        "final_answer": "",
    }


def tool_execution_node(state: AgentState) -> dict[str, Any]:
    target = state.get("target_entity")
    intent = state.get("intent")

    if not target:
        return {
            "raw_results": {
                "error": "No recognizable suspect name or entity ID identified in the query."
            },
            "highlighted_nodes": [],
            "evidence": [],
            "subgraph": None,
        }

    raw_results = {}
    highlighted_nodes = [target]
    evidence_items: list[EvidenceItem] = []
    subgraph: GraphResponse | None = None

    if intent == "get_evidence":
        res_str = get_evidence_trail_tool.invoke({"entity_id": target})
        res_data = json.loads(res_str)
        raw_results = res_data

        for ev in res_data.get("evidence_items", []):
            try:
                evidence_items.append(EvidenceItem(**ev))
            except Exception:  # noqa: BLE001, S110
                pass

        explanation_paths = res_data.get("explanation_paths", {})
        if explanation_paths.get("path"):
            highlighted_nodes = list(
                dict.fromkeys(highlighted_nodes + explanation_paths["path"])
            )

    elif intent == "get_risk":
        res_str = get_risk_breakdown_tool.invoke({"entity_id": target})
        raw_results = json.loads(res_str)

    elif intent == "get_subgraph":
        res_str = get_subgraph_tool.invoke({"entity_id": target, "depth": 2})
        res_data = json.loads(res_str)
        raw_results = res_data
        try:
            subgraph = GraphResponse(**res_data)
            highlighted_nodes = [n.id for n in subgraph.nodes]
        except Exception:  # noqa: BLE001, S110
            pass

    else:
        res_str = lookup_suspect_tool.invoke({"name_or_id": target})
        raw_results = json.loads(res_str)

    return {
        "raw_results": raw_results,
        "highlighted_nodes": highlighted_nodes,
        "evidence": evidence_items,
        "subgraph": subgraph,
    }


def synthesis_node(state: AgentState) -> dict[str, Any]:
    query = state.get("query", "")
    target = state.get("target_entity")
    intent = state.get("intent")
    raw = state.get("raw_results", {})

    if "error" in raw:
        return {"final_answer": f"Investigation Notice: {raw['error']}"}

    summary_lines = [
        f"Investigative Report for Target Entity: [{target}]",
        f'Query Reference: "{query}"',
        "-" * 60,
    ]

    if intent == "get_evidence":
        count = len(raw.get("evidence_items", []))
        admissibility = raw.get("admissibility_standard", "Section 65B")
        summary_lines.append(
            f"• Evidence Records Found: {count} verified entries ({admissibility})."
        )

        path_info = raw.get("explanation_paths", {})
        if path_info.get("detected"):
            summary_lines.append(
                f"• Anomaly Pattern Detected: {path_info.get('pattern')} across path [{' -> '.join(path_info.get('path', []))}]."
            )

        for idx, ev in enumerate(raw.get("evidence_items", []), 1):
            doc = ev.get("doc_id", "N/A")
            excerpt = ev.get("excerpt", "No text recorded")
            ts = ev.get("timestamp", "N/A")
            summary_lines.append(
                f'  [{idx}] Doc Ref: {doc} | Timestamp: {ts}\n      Excerpt: "{excerpt}"'
            )

    elif intent == "get_risk":
        score = raw.get("overall_risk_score", 0.0)
        percentile = raw.get("percentile_rank", 0.0)
        tags = raw.get("tags", [])
        rb = raw.get("risk_breakdown", {})
        summary_lines.append(
            f"• Overall Risk Score: {score}/100 (Percentile Rank: {percentile}%)."
        )
        summary_lines.append(
            f"• Assigned Behavioral Tags: {', '.join(tags) if tags else 'None'}."
        )
        summary_lines.append("• Sub-Score Breakdown:")
        summary_lines.append(
            f"    - Financial Anomaly Score: {rb.get('financial_anomaly_score', 0.0)}/100"
        )
        summary_lines.append(
            f"    - Cross-Case Linkage Score: {rb.get('cross_case_score', 0.0)}/100"
        )
        summary_lines.append(
            f"    - Call Frequency Spike Score: {rb.get('call_frequency_score', 0.0)}/100"
        )
        summary_lines.append(
            f"    - Betweenness Centrality Score: {rb.get('betweenness_centrality', 0.0)}/100"
        )

    elif intent == "get_subgraph":
        nodes_cnt = len(raw.get("nodes", []))
        edges_cnt = len(raw.get("edges", []))
        summary_lines.append("• Extracted 2-hop neighborhood ego-subgraph.")
        summary_lines.append(
            f"• Network Density: {nodes_cnt} connected nodes, {edges_cnt} interaction edges."
        )

    else:
        name = raw.get("name", "N/A")
        ent_type = raw.get("type", "N/A")
        score = raw.get("overall_risk_score", raw.get("risk_score", 0.0))
        tags = raw.get("tags", [])
        connections = raw.get(
            "direct_connections_count", raw.get("connections_count", 0)
        )

        summary_lines.append(f"• Identity: {name} (Type: {ent_type})")
        summary_lines.append(
            f"• Threat Assessment: {score}/100 Risk Score | Direct Ties: {connections}"
        )
        summary_lines.append(
            f"• Identified Roles: {', '.join(tags) if tags else 'Standard Node'}"
        )

    return {"final_answer": "\n".join(summary_lines)}


def _build_investigation_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("query_agent", query_agent_node)
    workflow.add_node("tool_execution", tool_execution_node)
    workflow.add_node("synthesis", synthesis_node)

    workflow.set_entry_point("query_agent")
    workflow.add_edge("query_agent", "tool_execution")
    workflow.add_edge("tool_execution", "synthesis")
    workflow.add_edge("synthesis", END)

    return workflow.compile()


_INVESTIGATION_APP = _build_investigation_graph()


def run_agent_query(user_query: str) -> AgentQueryResponse:
    """Primary entrypoint for FastAPI route to execute agent investigation."""
    initial_state: AgentState = {
        "query": user_query,
        "target_entity": None,
        "intent": None,
        "raw_results": {},
        "highlighted_nodes": [],
        "evidence": [],
        "subgraph": None,
        "final_answer": "",
    }

    final_state = _INVESTIGATION_APP.invoke(initial_state)

    target = final_state.get("target_entity") or "Entity"
    synthetic_cypher = f"MATCH (n {{id: '{target}'}})-[r]-(m) RETURN n, r, m"

    return AgentQueryResponse(
        query=user_query,
        cypher_generated=synthetic_cypher,
        answer=final_state.get("final_answer", "No analysis generated."),
        highlighted_nodes=final_state.get("highlighted_nodes", []),
        subgraph=final_state.get("subgraph"),
        evidence=final_state.get("evidence", []),
    )
