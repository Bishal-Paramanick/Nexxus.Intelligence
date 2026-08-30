"""
backend/app/services/analytics.py
Core graph analytics algorithms: centrality, Louvain community detection, anomaly detection.

compute_centrality(G) & detect_communities(G):
Person 2 (Neo4j Data Engineer): Must ensure valid node IDs and that relationship directions accurately represent the underlying interactions.

detect_circular_transactions(G):
Person 1 (Extraction) & Person 2 (Neo4j):
Exact edge type naming matching "TRANSACTED_WITH".
Proper numerical types for amount (float or int, not unparsed strings like "₹50,000").
Valid ISO-8601 formatted string timestamps (timestamp) on transaction edges.

detect_call_bursts(G)
Person 1 (Extraction) & Person 2 (Neo4j):
Exact edge type naming matching "CALLED".
Valid ISO-8601 timestamps (timestamp) for date partitioning.

detect_cross_case_entities(G)
Person 1 (Extraction):
Reliable extraction of case associations into a list on nodes (case_ids: list[str]),
or consistent FIR_* document naming so helper utilities can derive them.
"""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime
from typing import Any

import networkx as nx

# ---------------------------------------------------------------------------
# Centrality
# ---------------------------------------------------------------------------


def compute_centrality(G: nx.MultiDiGraph) -> dict[str, dict[str, float]]:
    """Returns normalized per-node centrality scores."""
    simple = _collapse_to_weighted_digraph(G)

    degree = nx.degree_centrality(simple)
    betweenness = nx.betweenness_centrality(simple, weight="weight")
    try:
        pagerank = nx.pagerank(simple, weight="weight")
    except nx.PowerIterationFailedConvergence:
        pagerank = {n: 0.0 for n in simple.nodes()}

    result = {}
    for node in simple.nodes():
        result[node] = {
            "degree_centrality": round(degree.get(node, 0.0), 4),
            "betweenness_centrality": round(betweenness.get(node, 0.0), 4),
            "pagerank": round(pagerank.get(node, 0.0), 4),
        }
    return result


def _collapse_to_weighted_digraph(G: nx.MultiDiGraph) -> nx.DiGraph:
    simple = nx.DiGraph()
    simple.add_nodes_from(G.nodes(data=True))
    for u, v, _ in G.edges(data=True):
        if simple.has_edge(u, v):
            simple[u][v]["weight"] += 1
        else:
            simple.add_edge(u, v, weight=1)
    return simple


def compute_bridge_score(centrality: dict[str, dict[str, float]]) -> dict[str, float]:
    """Computes betweenness centrality per unit of degree to find hidden low-profile coordinators."""
    scores = {}
    for node, c in centrality.items():
        degree = max(c["degree_centrality"], 0.05)
        scores[node] = round(c["betweenness_centrality"] / degree, 4)
    return scores


# ---------------------------------------------------------------------------
# Community Detection
# ---------------------------------------------------------------------------


def detect_communities(G: nx.MultiDiGraph) -> dict[str, int]:
    """Returns {node: community_id} using Louvain community detection."""
    undirected = nx.Graph()
    undirected.add_nodes_from(G.nodes())
    for u, v in G.edges():
        if undirected.has_edge(u, v):
            undirected[u][v]["weight"] += 1
        else:
            undirected.add_edge(u, v, weight=1)

    communities = nx.algorithms.community.louvain_communities(
        undirected, weight="weight", seed=42
    )

    node_to_community = {}
    for idx, community in enumerate(communities):
        for node in community:
            node_to_community[node] = idx
    return node_to_community


# ---------------------------------------------------------------------------
# Anomaly Detection
# ---------------------------------------------------------------------------

SIGNIFICANCE_AMOUNT_CONSISTENCY = 0.85
SIGNIFICANCE_WINDOW_HOURS = 72


def _parse_ts_safe(ts: str | None) -> datetime | None:
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return None


def _amount_consistency(amounts: list[float]) -> float:
    if len(amounts) < 2:
        return 0.0
    lo, hi = min(amounts), max(amounts)
    if hi == 0:
        return 0.0
    return round(lo / hi, 3)


def _time_span_hours(timestamps: list[datetime]) -> float | None:
    if len(timestamps) < 2:
        return None
    return round((max(timestamps) - min(timestamps)).total_seconds() / 3600, 1)


def detect_circular_transactions(
    G: nx.MultiDiGraph, max_cycle_len: int = 4
) -> list[dict[str, Any]]:
    """Detects and scores circular fund loops (TRANSACTED_WITH)."""
    txn_graph = nx.DiGraph()
    edge_lookup = {}
    for u, v, data in G.edges(data=True):
        if data.get("edge_type") == "TRANSACTED_WITH":
            txn_graph.add_edge(u, v)
            edge_lookup[(u, v)] = data

    results = []
    for cycle in nx.simple_cycles(txn_graph, length_bound=max_cycle_len):
        if len(cycle) < 2:
            continue

        amounts, timestamps = [], []
        for i in range(len(cycle)):
            u, v = cycle[i], cycle[(i + 1) % len(cycle)]
            edge = edge_lookup.get((u, v), {})
            if edge.get("amount") is not None:
                amounts.append(edge["amount"])
            ts = _parse_ts_safe(edge.get("timestamp"))
            if ts:
                timestamps.append(ts)

        amount_consistency = _amount_consistency(amounts)
        time_span_hours = _time_span_hours(timestamps)

        significant = (
            len(cycle) >= 3
            and amount_consistency >= SIGNIFICANCE_AMOUNT_CONSISTENCY
            and time_span_hours is not None
            and time_span_hours <= SIGNIFICANCE_WINDOW_HOURS
        )

        results.append(
            {
                "path": cycle,
                "significant": significant,
                "amount_consistency": amount_consistency,
                "time_span_hours": time_span_hours,
            }
        )

    return results


def detect_call_bursts(
    G: nx.MultiDiGraph, threshold_per_day: int = 10
) -> list[dict[str, Any]]:
    """Flags pairs with more than threshold_per_day calls on a single date."""
    calls_by_pair_day = defaultdict(int)

    for u, v, data in G.edges(data=True):
        if data.get("edge_type") != "CALLED":
            continue
        ts = data.get("timestamp")
        if not ts:
            continue
        ts = ts.replace("Z", "+00:00")
        day = datetime.fromisoformat(ts).date().isoformat()
        calls_by_pair_day[(u, v, day)] += 1

    flagged = []
    for (u, v, day), count in calls_by_pair_day.items():
        if count > threshold_per_day:
            flagged.append({"source": u, "target": v, "date": day, "call_count": count})
    return flagged


def detect_cross_case_entities(G: nx.MultiDiGraph) -> dict[str, int]:
    """Returns {node: num_distinct_cases} for entities appearing across multiple cases."""
    result = {}
    for node, data in G.nodes(data=True):
        case_ids = data.get("case_ids", [])
        if len(case_ids) >= 2:
            result[node] = len(case_ids)
    return result


if __name__ == "__main__":
    from app.services.graph_loader import load_graph

    G = load_graph()
    print("\n=== Centrality ===")
    print(json.dumps(compute_centrality(G), indent=2))
    print("\n=== Communities ===")
    print(json.dumps(detect_communities(G), indent=2))
