"""
backend/app/services/schema_mapper.py
Converts internal NetworkX MultiDiGraph representations + risk_engine output
into validated Pydantic model instances matching app.schemas.
"""

from __future__ import annotations

import warnings
from typing import Any, cast

from app.schemas import (
    EdgeProperties,
    EntityDetailResponse,
    EntityType,
    GraphEdge,
    GraphNode,
    GraphResponse,
    NodeProperties,
    RelationshipType,
    RiskBreakdown,
)
from app.services.analytics import detect_communities
from app.services.constants import (
    ENTITY_TYPES,
    OFFICIAL_EDGE_TYPES,
    normalize_entity_type,
)
from app.services.explanation import get_entity_evidence, get_explanation_path
from app.services.risk_engine import compute_risk_breakdown


def _build_node_properties(node_id: str, data: dict[str, Any]) -> NodeProperties:
    """Dynamically builds a NodeProperties model from graph attributes."""
    entity_type = normalize_entity_type(data.get("type", ""))
    display_name = (
        data.get("name")
        or data.get("number")
        or data.get("registration_number")
        or data.get("account_number")
        or node_id
    )

    payload: dict[str, Any] = dict(data)

    # Apply entity-specific fallbacks if not explicitly present
    if entity_type == "Phone":
        payload["number"] = payload.get("number") or display_name
    elif entity_type == "Vehicle":
        payload["registration_number"] = (
            payload.get("registration_number") or display_name
        )
    elif entity_type == "Account":
        payload["account_number"] = payload.get("account_number") or display_name
    elif entity_type == "Location":
        payload["name"] = payload.get("name") or display_name
    else:
        payload["name"] = payload.get("name") or display_name

    return NodeProperties.model_validate(payload)


def build_graph_response(G) -> GraphResponse:
    """Full graph for the /api/graph endpoint."""
    risk = compute_risk_breakdown(G)
    communities = detect_communities(G)

    nodes: list[GraphNode] = []
    for node_id, data in G.nodes(data=True):
        raw_entity_type = normalize_entity_type(data.get("type", ""))

        if raw_entity_type not in ENTITY_TYPES:
            warnings.warn(
                f"Node '{node_id}' has unrecognized type '{data.get('type')}' "
                f"(likely a stub from a dangling reference) -- skipping from GraphResponse."
            )
            continue

        entity_type = cast(EntityType, raw_entity_type)
        display_label = (
            data.get("name")
            or data.get("number")
            or data.get("registration_number")
            or data.get("account_number")
            or node_id
        )

        nodes.append(
            GraphNode(
                id=node_id,
                label=str(display_label),
                type=entity_type,
                risk_score=risk.get(node_id, {}).get("overall_risk_score", 0.0),
                group=str(communities.get(node_id)) if node_id in communities else None,
                properties=_build_node_properties(node_id, data),
            )
        )

    valid_node_ids = {n.id for n in nodes}

    edges: list[GraphEdge] = []
    seen = set()
    skipped_dangling = 0
    for idx, (u, v, data) in enumerate(G.edges(data=True)):
        if u not in valid_node_ids or v not in valid_node_ids:
            skipped_dangling += 1
            continue

        raw_edge_type = data.get("edge_type")
        if raw_edge_type not in OFFICIAL_EDGE_TYPES:
            continue

        edge_type = cast(RelationshipType, raw_edge_type)
        doc = data.get("source_doc") or data.get("doc_id")

        collapse_key = (u, v, edge_type)
        if collapse_key in seen:
            continue
        seen.add(collapse_key)

        edges.append(
            GraphEdge(
                id=f"e{idx}",
                source=u,
                target=v,
                type=edge_type,
                confidence=data.get("confidence", 1.0),
                doc_id=doc,
                properties=EdgeProperties(
                    timestamp=data.get("timestamp"),
                    duration=data.get("duration_sec") or data.get("duration"),
                    amount=data.get("amount"),
                    transaction_id=data.get("transaction_id"),
                    role=data.get("role"),
                    confidence=data.get("confidence", 1.0),
                    source_doc=doc,
                    evidence=data.get("evidence"),
                ),
            )
        )

    if skipped_dangling:
        warnings.warn(
            f"Skipped {skipped_dangling} edge(s) pointing at entities missing "
            f"from the entities list."
        )

    return GraphResponse(nodes=nodes, edges=edges)


def build_entity_detail(G, entity_id: str) -> EntityDetailResponse | None:
    """Single-entity deep dive for GET /api/entity/{entity_id}."""
    if entity_id not in G.nodes:
        return None

    data = G.nodes[entity_id]
    risk = compute_risk_breakdown(G).get(entity_id)
    if risk is None:
        return None

    raw_entity_type = normalize_entity_type(data.get("type", ""))
    if raw_entity_type not in ENTITY_TYPES:
        return None

    entity_type = cast(EntityType, raw_entity_type)
    evidence = get_entity_evidence(G, entity_id)
    explanation = get_explanation_path(G, entity_id)

    display_name = (
        data.get("name")
        or data.get("number")
        or data.get("registration_number")
        or data.get("account_number")
        or entity_id
    )

    return EntityDetailResponse(
        id=entity_id,
        name=str(display_name),
        type=entity_type,
        overall_risk_score=risk["overall_risk_score"],
        risk_breakdown=RiskBreakdown(**risk["risk_breakdown"]),
        aliases=data.get("aliases", []),
        tags=risk["tags"],
        direct_connections_count=risk["direct_connections_count"],
        metadata={
            "case_ids": data.get("case_ids", []),
            "percentile_rank": risk["percentile_rank"],
            "recency_multiplier": risk["recency_multiplier"],
            "watchlist_reason": risk["watchlist_reason"],
            "bridge_score": risk["bridge_score"],
            "evidence": [e.model_dump() for e in evidence],
            "explanation_path": explanation,
        },
    )
