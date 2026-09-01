"""
backend/app/services/json_loader.py
Parses Abhidha's NLP extraction JSON output into a NetworkX MultiDiGraph
and derives case linkages.
"""

from __future__ import annotations

import json
import warnings
from typing import Any

import networkx as nx

from app.services.case_utils import derive_case_ids
from app.services.constants import normalize_entity_type


def load_from_json(data: dict[str, Any]) -> nx.MultiDiGraph:
    """Constructs a MultiDiGraph from an ingestion dictionary (IngestionPayload)."""
    entities = data.get("entities", [])
    relationships = data.get("relationships", [])

    G = nx.MultiDiGraph()
    known_ids: set[str] = set()

    for e in entities:
        node_id = str(
            e.get("id")
            or e.get("name")
            or e.get("number")
            or e.get("registration_number")
            or e.get("account_number")
        )
        if not node_id:
            continue

        attrs: dict[str, Any] = {k: v for k, v in e.items() if k != "id"}

        # Unpack nested properties dict if present
        if "properties" in attrs and isinstance(attrs["properties"], dict):
            nested_props = attrs.pop("properties")
            for prop_k, prop_v in nested_props.items():
                if prop_k not in attrs:
                    attrs[prop_k] = prop_v

        # Normalize entity type
        if "type" in attrs:
            attrs["type"] = normalize_entity_type(attrs["type"])

        # Normalize name property across type variants
        if "name" not in attrs:
            attrs["name"] = (
                attrs.get("number")
                or attrs.get("registration_number")
                or attrs.get("account_number")
                or node_id
            )

        G.add_node(node_id, **attrs)
        known_ids.add(node_id)

    for idx, r in enumerate(relationships):
        src = str(r.get("source"))
        tgt = str(r.get("target"))
        rel_type = str(r.get("type", "ASSOCIATED_WITH"))
        doc_ref = str(r.get("source_doc") or r.get("doc_id") or "")

        # Safety check for dangling references
        for node_id in (src, tgt):
            if node_id not in known_ids:
                warnings.warn(
                    f"Relationship #{idx} references unknown entity '{node_id}' "
                    f"-- creating a stub node."
                )
                G.add_node(node_id, type="UNKNOWN", name=node_id)
                known_ids.add(node_id)

        edge_attrs: dict[str, Any] = {
            k: v for k, v in r.items() if k not in ("source", "target", "type")
        }

        # Unpack nested relationship properties if present
        if "properties" in edge_attrs and isinstance(edge_attrs["properties"], dict):
            nested_edge_props = edge_attrs.pop("properties")
            for prop_k, prop_v in nested_edge_props.items():
                if prop_k not in edge_attrs:
                    edge_attrs[prop_k] = prop_v

        edge_attrs["edge_type"] = rel_type
        edge_attrs["source_doc"] = doc_ref
        edge_attrs["doc_id"] = doc_ref
        edge_key = r.get("id") or f"rel{idx}"
        G.add_edge(src, tgt, key=edge_key, **edge_attrs)

    # Derive multi-case associations across nodes and edges
    derive_case_ids(G)
    return G


def load_from_json_file(path: str) -> nx.MultiDiGraph:
    """Reads JSON from file path and parses graph."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return load_from_json(data)
