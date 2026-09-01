from __future__ import annotations

from typing import Any, TypedDict

from app.schemas import EvidenceItem, GraphResponse


class AgentState(TypedDict):
    query: str
    target_entity: str | None
    intent: str | None
    raw_results: dict[str, Any]
    highlighted_nodes: list[str]
    evidence: list[EvidenceItem]
    subgraph: GraphResponse | None
    final_answer: str
