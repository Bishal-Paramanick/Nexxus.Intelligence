"""
entity_resolution.py
Flags pairs of Person nodes that might be the same real individual,
based on shared behavior (common call contacts, shared locations,
shared transaction targets) plus rough name similarity.

This is a SUGGESTION engine only -- it never merges nodes. Confidence
scores and the signals behind them go into EntityDetailResponse.metadata
(via schema_mapper.py) for a human investigator to review and confirm.

Two-stage approach for performance: first a cheap name-similarity pass
narrows the graph down to a small shortlist of candidate pairs, then
the expensive behavior-overlap comparison only runs on that shortlist
-- not on every possible pair in the graph.
"""

from difflib import SequenceMatcher
from itertools import combinations

MIN_ACTIVITY_THRESHOLD = 3   # a node needs at least this many edges
                              # before its overlap score is considered
                              # reliable -- too little data makes any
                              # overlap number meaningless
NAME_SHORTLIST_THRESHOLD = 0.6  # name similarity floor to even consider a pair
CONFIDENCE_WEIGHTS = {
    "name_similarity": 0.15,
    "common_callers": 0.30,
    "shared_locations": 0.25,
    "shared_transaction_targets": 0.30,
}


def _name_similarity(name_a: str, name_b: str) -> float:
    """0.0-1.0 rough string similarity, case-insensitive. Just a cheap
    filter -- not meant to be authoritative on its own (see module docstring:
    names can be deliberately different or coincidentally identical)."""
    if not name_a or not name_b:
        return 0.0
    return SequenceMatcher(None, name_a.lower(), name_b.lower()).ratio()


def _person_nodes(G):
    return [n for n, data in G.nodes(data=True) if data.get("type") == "Person"]


def _shortlist_candidate_pairs(G) -> list[tuple[str, str, float]]:
    """Returns [(node_a, node_b, name_similarity), ...] for Person pairs
    whose names are similar enough to be worth a full behavior check.
    Avoids comparing every pair in the graph (O(n^2) on the FULL
    behavior check would be too slow on a large graph)."""
    people = _person_nodes(G)
    shortlist = []
    for a, b in combinations(people, 2):
        name_a = G.nodes[a].get("name", a)
        name_b = G.nodes[b].get("name", b)
        sim = _name_similarity(name_a, name_b)
        if sim >= NAME_SHORTLIST_THRESHOLD:
            shortlist.append((a, b, sim))
    return shortlist


def _neighbor_set(G, node) -> set:
    """All distinct nodes connected to `node`, either direction."""
    return set(G.predecessors(node)) | set(G.successors(node))


def _neighbors_by_edge_type(G, node, edge_type: str) -> set:
    """Distinct neighbors connected to `node` via a specific edge_type,
    either direction."""
    neighbors = set()
    for _, v, data in G.edges(node, data=True):
        if data.get("edge_type") == edge_type:
            neighbors.add(v)
    for u, _, data in G.in_edges(node, data=True):
        if data.get("edge_type") == edge_type:
            neighbors.add(u)
    return neighbors


def _jaccard(set_a: set, set_b: set) -> float:
    """Standard overlap measure: |intersection| / |union|. 1.0 = identical
    neighbor sets, 0.0 = no overlap at all."""
    union = set_a | set_b
    if not union:
        return 0.0
    return round(len(set_a & set_b) / len(union), 3)


def _behavior_overlap_score(G, node_a: str, node_b: str) -> dict:
    """Returns individual overlap signals -- kept separate (not just one
    number) so the investigator can see WHICH behavior overlapped, not
    just a black-box score."""
    callers_a = _neighbors_by_edge_type(G, node_a, "CALLED")
    callers_b = _neighbors_by_edge_type(G, node_b, "CALLED")

    locations_a = _neighbors_by_edge_type(G, node_a, "PRESENT_AT")
    locations_b = _neighbors_by_edge_type(G, node_b, "PRESENT_AT")

    txn_targets_a = _neighbors_by_edge_type(G, node_a, "TRANSACTED_WITH")
    txn_targets_b = _neighbors_by_edge_type(G, node_b, "TRANSACTED_WITH")

    return {
        "common_callers": _jaccard(callers_a, callers_b),
        "shared_locations": _jaccard(locations_a, locations_b),
        "shared_transaction_targets": _jaccard(txn_targets_a, txn_targets_b),
    }


def _has_enough_activity(G, node) -> bool:
    return len(_neighbor_set(G, node)) >= MIN_ACTIVITY_THRESHOLD


def compute_duplicate_confidence(G, node_a: str, node_b: str, name_similarity: float) -> dict | None:
    """Combines name similarity + behavior overlap into one weighted
    confidence score. Returns None if either node doesn't have enough
    activity to make the comparison reliable."""
    if not (_has_enough_activity(G, node_a) and _has_enough_activity(G, node_b)):
        return None

    signals = _behavior_overlap_score(G, node_a, node_b)
    signals["name_similarity"] = round(name_similarity, 3)

    confidence = sum(CONFIDENCE_WEIGHTS[k] * v for k, v in signals.items())
    confidence = round(min(confidence, 1.0), 3)

    return {"confidence": confidence, "signals": signals}


def detect_possible_duplicates(G) -> list[dict]:
    """Full pipeline: shortlist by name, score by behavior. Returns a
    list of {"entity_a", "entity_b", "confidence", "signals"} dicts --
    a SUGGESTION list for human review, not an automatic merge."""
    results = []
    for node_a, node_b, name_sim in _shortlist_candidate_pairs(G):
        scored = compute_duplicate_confidence(G, node_a, node_b, name_sim)
        if scored is None:
            continue
        results.append({
            "entity_a": node_a,
            "entity_b": node_b,
            "confidence": scored["confidence"],
            "signals": scored["signals"],
        })
    return sorted(results, key=lambda r: r["confidence"], reverse=True)


if __name__ == "__main__":
    from ..data_sources.graph_loader import load_graph
    import json

    G = load_graph()
    print(json.dumps(detect_possible_duplicates(G), indent=2))