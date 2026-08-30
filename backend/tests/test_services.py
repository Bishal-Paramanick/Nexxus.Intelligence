"""
backend/tests/test_services.py
Automated end-to-end verification script for all Person 4 backend services.
"""

from __future__ import annotations

import networkx as nx
from app.schemas import EvidenceItem, RiskBreakdown
from app.services.analytics import (
    compute_bridge_score,
    compute_centrality,
    detect_call_bursts,
    detect_circular_transactions,
    detect_communities,
    detect_cross_case_entities,
)
from app.services.case_utils import derive_case_ids
from app.services.explanation import get_entity_evidence, get_explanation_path
from app.services.json_loader import load_from_json
from app.services.risk_engine import compute_risk_breakdown
from app.services.watchlist import check_watchlist


def build_synthetic_graph() -> nx.MultiDiGraph:
    """Builds a realistic investigative graph to exercise all service algorithms."""
    G = nx.MultiDiGraph()

    # Nodes
    G.add_node("P001", name="Suresh", type="Person", source_doc="FIR_101/2026")
    G.add_node("P002", name="Ramesh", type="Person", source_doc="FIR_102/2026")
    G.add_node("P003", name="Vikas", type="Person", source_doc="FIR_101/2026")
    G.add_node("P004", name="Amit", type="Person", source_doc="FIR_103/2026")
    G.add_node("PH001", name="+919876543210", type="Phone")

    # 1. Circular Transaction Loop: P001 -> P002 -> P003 -> P001
    base_ts = "2026-08-20T10:00:00Z"
    G.add_edge(
        "P001",
        "P002",
        key="e1",
        edge_type="TRANSACTED_WITH",
        amount=50000.0,
        timestamp="2026-08-20T10:00:00Z",
        source_doc="FIN_STMT_01",
        evidence="Wire transfer of Rs 50,000 to Ramesh account",
    )
    G.add_edge(
        "P002",
        "P003",
        key="e2",
        edge_type="TRANSACTED_WITH",
        amount=49500.0,
        timestamp="2026-08-20T14:00:00Z",
        source_doc="FIN_STMT_02",
        evidence="Interbank transfer of Rs 49,500 to Vikas",
    )
    G.add_edge(
        "P003",
        "P001",
        key="e3",
        edge_type="TRANSACTED_WITH",
        amount=49000.0,
        timestamp="2026-08-20T18:00:00Z",
        source_doc="FIN_STMT_03",
        evidence="Cash deposit return of Rs 49,000 back to Suresh",
    )

    # 2. Call Burst: P001 -> P004 (12 calls on same day)
    for i in range(12):
        G.add_edge(
            "P001",
            "P004",
            key=f"call_{i}",
            edge_type="CALLED",
            timestamp="2026-08-21T09:00:00Z",
            source_doc="CDR_AUG_01",
            evidence=f"Call record #{i + 1} duration 120s",
        )

    # 3. Cross-case reference on edge
    G.add_edge(
        "P001",
        "P003",
        key="e4",
        edge_type="ASSOCIATED_WITH",
        source_doc="FIR_102/2026",
        evidence="Jointly accused in FIR 102",
    )

    return G


def run_all_tests():
    print("==================================================")
    print("🚀 STARTING SERVICE LAYER INTEGRATION TESTS")
    print("==================================================\n")

    # 1. Test case_utils.py
    print("[1/6] Testing case_utils.derive_case_ids...")
    G = build_synthetic_graph()
    derive_case_ids(G)
    suresh_cases = G.nodes["P001"].get("case_ids", [])
    assert len(suresh_cases) >= 2, f"Expected multi-case linkage, got: {suresh_cases}"
    print(f"  ✓ P001 linked to cases: {suresh_cases}")

    # 2. Test analytics.py
    print("\n[2/6] Testing analytics.py graph algorithms...")
    centrality = compute_centrality(G)
    assert "P001" in centrality
    print(f"  ✓ Centrality computed for {len(centrality)} nodes")

    bridge = compute_bridge_score(centrality)
    assert "P001" in bridge
    print("  ✓ Bridge scores computed")

    communities = detect_communities(G)
    assert len(communities) == len(G.nodes)
    print(f"  ✓ Louvain communities detected: {set(communities.values())}")

    cycles = detect_circular_transactions(G)
    assert len(cycles) > 0, "Failed to detect circular transactions"
    significant_cycles = [c for c in cycles if c["significant"]]
    print(
        f"  ✓ Detected {len(cycles)} cycle(s), {len(significant_cycles)} significant fund loop(s)"
    )

    bursts = detect_call_bursts(G, threshold_per_day=10)
    assert len(bursts) > 0, "Failed to detect call burst"
    print(
        f"  ✓ Call burst detected: {bursts[0]['call_count']} calls on {bursts[0]['date']}"
    )

    cross_cases = detect_cross_case_entities(G)
    assert "P001" in cross_cases
    print(f"  ✓ Cross-case entity detected: P001 in {cross_cases['P001']} cases")

    # 3. Test watchlist.py
    print("\n[3/6] Testing watchlist.py lookups...")
    reason = check_watchlist("P001", "Suresh")
    assert reason is not None, "Watchlist failed to match Suresh"
    print(f"  ✓ Watchlist match found: '{reason}'")

    # 4. Test explanation.py
    print("\n[4/6] Testing explanation.py Section 65B evidence and path extraction...")
    evidence = get_entity_evidence(G, "P001")
    assert len(evidence) > 0, "No evidence items generated"
    assert isinstance(evidence[0], EvidenceItem)
    print(
        f"  ✓ Generated {len(evidence)} verified EvidenceItems (Sample doc_type: {evidence[0].doc_type})"
    )

    path_data = get_explanation_path(G, "P001")
    assert path_data["pattern"] == "circular_transaction"
    print(f"  ✓ Highlight path generated: {' -> '.join(path_data['path'])}")

    # 5. Test json_loader.py
    print("\n[5/6] Testing json_loader.py with nested and flat properties...")
    sample_payload = {
        "entities": [
            {
                "id": "T01",
                "name": "Target Alpha",
                "type": "Person",
                "properties": {"aliases": ["Alpha"], "number": "+911111111111"},
            },
            {"id": "T02", "name": "Target Beta", "type": "Person"},
        ],
        "relationships": [
            {
                "source": "T01",
                "target": "T02",
                "type": "CALLED",
                "source_doc": "FIR_200/2026",
                "evidence": "Observed contact",
            }
        ],
    }
    loaded_g = load_from_json(sample_payload)
    assert "T01" in loaded_g and "T02" in loaded_g
    assert loaded_g.nodes["T01"]["number"] == "+911111111111"
    print("  ✓ Ingested IngestionPayload and unpacked nested properties successfully")

    # 6. Test risk_engine.py
    print("\n[6/6] Testing risk_engine.py scoring and schema breakdown...")
    breakdown_results = compute_risk_breakdown(G)
    assert "P001" in breakdown_results
    p001_res = breakdown_results["P001"]

    assert "overall_risk_score" in p001_res
    assert "tags" in p001_res
    assert "percentile_rank" in p001_res

    # Schema validation test
    RiskBreakdown(**p001_res["risk_breakdown"])

    print(f"  ✓ Suresh (P001) Overall Risk Score: {p001_res['overall_risk_score']}/100")
    print(f"  ✓ Suresh (P001) Tags: {p001_res['tags']}")
    print(f"  ✓ Suresh (P001) Percentile Rank: {p001_res['percentile_rank']}%")

    print("\n==================================================")
    print("🎉 ALL 6 SERVICE MODULES PASSED VALIDATION!")
    print("==================================================")


if __name__ == "__main__":
    run_all_tests()
