"""
backend/app/services/explanation.py
Builds the "why was this flagged" evidence trail per entity: the actual
source documents/excerpts behind a risk signal, and (for circular
transactions) the exact path of entities involved.

infer_doc_type(source_doc) & get_entity_evidence(G, entity_id)
Person 1 (NLP Extraction):
Document Naming Convention: Confirm the exact naming prefixes used for extracted documents (e.g., will bank statements start with FIN_, BANK_, or STATEMENT_? Will MCA records start with MCA_ or CORP_?).
Provenance Guarantee: Ensure every extracted edge has both a valid source_doc ID and a non-empty evidence text span.

get_explanation_path(G, entity_id)
Person 4 (Agentic AI Lead / LangGraph):
Path Schema: Confirm what format the LLM agent expects for highlighted_nodes and explanation reasoning.
Multi-Pattern Explanations: Clarify if get_explanation_path should also return paths for other flagged behaviors (e.g., call burst chains or bridge node paths) beyond circular transactions.
"""

from __future__ import annotations

import re
from typing import Any

from app.schemas import EvidenceItem
from app.services.analytics import detect_circular_transactions

# Regex mapping aligned with schemas.py EvidenceItem.doc_type:
# FIR, CDR, BANK_TXN, RTO_RECORD, MCA_RECORD, OTHER
_DOC_TYPE_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"^FIR", re.IGNORECASE), "FIR"),
    (re.compile(r"^CDR", re.IGNORECASE), "CDR"),
    (re.compile(r"^(FIN|BANK|TXN|STMT)", re.IGNORECASE), "BANK_TXN"),
    (re.compile(r"^(MCA|CORP|ROC)", re.IGNORECASE), "MCA_RECORD"),
    (re.compile(r"^(RTO|VEH|DL|RC)", re.IGNORECASE), "RTO_RECORD"),
]


def _infer_doc_type(source_doc: str | None) -> str:
    """Infers official EvidenceItem.doc_type based on prefix conventions."""
    if not source_doc:
        return "OTHER"

    for pattern, doc_type in _DOC_TYPE_PATTERNS:
        if pattern.search(source_doc.strip()):
            return doc_type
    return "OTHER"


def get_entity_evidence(G, entity_id: str) -> list[EvidenceItem]:
    """Extracts all source-document evidence for edges touching this entity.

    Guarantees Section 65B court-ready traceability with deduplication.
    """
    if entity_id not in G.nodes:
        return []

    items: list[EvidenceItem] = []
    seen: set[tuple[str, str]] = set()

    # Ingest incoming and outgoing edges for comprehensive provenance
    edges = list(G.edges(entity_id, data=True)) + list(G.in_edges(entity_id, data=True))
    for _, _, data in edges:
        doc_id = data.get("source_doc") or data.get("doc_id")
        excerpt = data.get("evidence")

        # Skip edges without provenance evidence
        if not doc_id or not excerpt:
            continue

        key = (str(doc_id), str(excerpt))
        if key in seen:
            continue
        seen.add(key)

        items.append(
            EvidenceItem(
                doc_id=str(doc_id),
                doc_type=_infer_doc_type(str(doc_id)),
                excerpt=str(excerpt),
                timestamp=str(data.get("timestamp") or ""),
                confidence=float(data.get("confidence", 1.0)),
                verified_by_nlp=bool(data.get("verified_by_nlp", True)),
            )
        )
    return items


def get_explanation_path(G, entity_id: str) -> dict[str, Any]:
    """Returns the exact cycle or anomaly subgraph path for visual highlighting.

    Formats data directly for AgentQueryResponse.highlighted_nodes and frontend canvas.
    """
    cycles = detect_circular_transactions(G)
    matching = [c for c in cycles if entity_id in c.get("path", [])]
    if not matching:
        return {"pattern": None, "path": []}

    significant = [c for c in matching if c.get("significant")]
    best = significant[0] if significant else matching[0]

    return {
        "pattern": "circular_transaction",
        "path": best["path"],
        "significant": best.get("significant", False),
        "amount_consistency": best.get("amount_consistency", 0.0),
        "time_span_hours": best.get("time_span_hours"),
    }
