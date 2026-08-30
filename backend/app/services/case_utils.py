"""
backend/app/services/case_utils.py
Shared logic for deriving case_ids on nodes, used by every loader
(json_loader.py, neo4j_loader.py) so this assumption lives in one place.

Person 1 (NLP Extraction) & Person 2 (Neo4j Data Engineer):
Case ID / Source Doc Formats: Confirm what naming conventions their pipeline uses for case documents (e.g., FIR_102, CASE_2026_01, CR_88).
Explicit case_ids field: Confirm if they ever pass an explicit case_ids: ["FIR_101", "FIR_102"] array directly inside the entity properties.
"""

from __future__ import annotations

import re
from collections import defaultdict

# Matches "FIR_102", "CASE_001", "CR_88", "CASE001-FIR-3", etc.
CASE_PATTERN = re.compile(r"(fir|case|crime|cr_no)", re.IGNORECASE)


def derive_case_ids(G) -> None:
    """Mutates G in place: derives case_ids on nodes from case-pattern
    source_doc/doc_id references on entity records and any touching edges,
    preserving pre-existing explicit case_ids.
    """
    case_refs: defaultdict[str, set[str]] = defaultdict(set)

    # 1. Collect from edges (both source_doc and doc_id)
    for u, v, data in G.edges(data=True):
        doc = str(data.get("source_doc") or data.get("doc_id") or "")
        if doc and CASE_PATTERN.search(doc):
            case_refs[u].add(doc)
            case_refs[v].add(doc)

    # 2. Collect from node-level provenance
    for node_id, node_data in G.nodes(data=True):
        doc = str(node_data.get("source_doc") or node_data.get("doc_id") or "")
        if doc and CASE_PATTERN.search(doc):
            case_refs[node_id].add(doc)

    # 3. Populate case_ids (merging pre-existing case_ids if present)
    for node_id, node_data in G.nodes(data=True):
        existing_cases = node_data.get("case_ids", [])
        if isinstance(existing_cases, list):
            case_refs[node_id].update(existing_cases)

        # Apply to Person and Organization (or any entity type)
        if node_data.get("type") in {"Person", "Organization"}:
            node_data["case_ids"] = sorted(case_refs.get(node_id, set()))
