"""
backend/app/services/neo4j_loader.py
Loads nodes and relationships from a live Neo4j database into a networkx.MultiDiGraph.

Person 1(NLP Extraction & Ingestion Pipeline):
Payload & Batch Structure:"Will every extracted document batch follow the IngestionPayload structure with top-level entities: [...] and relationships: [...] arrays?"
Entity IDs & Properties: "Is every extracted entity assigned a unique, stable string ID (e.g., P001, PH001, LOC001), and is the main display title stored in name?
                         Are entity-specific attributes (like number, registration_number, latitude/longitude, vehicle_type) placed directly at the top level or nested inside a properties: {...} dictionary?
Relationship Integrity & Dangling Edges:"Are the source and target of every relationship guaranteed to match an entity id in the same batch to prevent dangling/orphan edges?"
Legal Evidence & Provenance (Section 65B):"Does every relationship contain a non-empty evidence excerpt text and a valid document identifier in source_doc (or doc_id)?"
Data Types & Casing:"Are financial amounts extracted as clean numeric values (float/int like 50000.0, not '₹50,000') and timestamps in UTC ISO-8601 (YYYY-MM-DDTHH:MM:SSZ)?"
                     Are case/FIR numbers explicitly attached as a case_ids: [...] array on Person entities, or should we derive them from source_doc prefixes like FIR_*?"

2.Person 2(Neo4j / Graph Database Engineer):
Database Connection & Instance Details:"What are the exact credentials for your instance: URI (e.g., bolt://localhost:7687 or neo4j+s://...), username, password, and database name (default neo4j or custom)?"
Node Labels & Property Names:"Are your primary node labels matching PascalCase (Person, Phone, Location, Vehicle, Organization)?"
                              Are entity business IDs saved in the id property so we don't have to rely on internal element_id?"
Relationship Types & Schema:"Are relationship types written in UPPER_SNAKE_CASE matching CALLED, TRANSACTED_WITH, PRESENT_AT, OWNS_VEHICLE, and MEMBER_OF?"
                            "What exact property keys are saved on Neo4j edges: is call duration duration or duration_sec, is document ID source_doc or doc_id, and are timestamp, amount, and evidence stored as direct properties?"
Graph Integrity:"Are edge directions consistent (e.g., caller $\rightarrow$ receiver, sender $\rightarrow$ receiver) so graph centrality algorithms compute correctly?"

3.Person 5 (Frontend / UI Canvas Lead):
Graph Canvas Edge Aggregation:"When two entities have multiple parallel edges (e.g., 20 calls or 5 bank transactions), does the canvas UI expect a single collapsed edge per relationship type, or does it render multi-graph parallel links?"
Node Detail & Risk Visuals:"Does the entity detail drawer expect all metadata fields (case_ids, percentile_rank, bridge_score, watchlist_reason, explanation_path, evidence) inside the metadata dictionary of EntityDetailResponse?"
Visual Anomaly Highlighting:"For highlighted paths (like circular money laundering loops), do you expect the node IDs in an ordered array path: ['P001', 'P002', 'P003'] to highlight the cycle on the canvas?"
"""

from __future__ import annotations

import os

import networkx as nx
from neo4j import GraphDatabase

from app.services.case_utils import derive_case_ids
from app.services.constants import normalize_entity_type

NEO4J_URI = os.getenv("NEO4J_URI") or os.getenv("NEO4J_URL", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")


def _get_driver():
    return GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


def load_from_neo4j() -> nx.MultiDiGraph:
    """Queries all nodes and relationships from Neo4j, formats properties,
    and returns an in-memory networkx.MultiDiGraph.
    """
    G = nx.MultiDiGraph()
    driver = _get_driver()

    query = """
    MATCH (n)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN n, labels(n) AS node_labels, r, type(r) AS rel_type, m, labels(m) AS target_labels
    """

    try:
        with driver.session(database=NEO4J_DATABASE) as session:
            result = session.run(query)

            for record in result:
                node = record["n"]
                if node is not None:
                    node_id = str(node.get("id") or node.element_id)
                    node_props = dict(node)
                    labels = record["node_labels"] or []
                    raw_type = labels[0] if labels else "UNKNOWN"
                    node_props["type"] = normalize_entity_type(raw_type)

                    if "name" not in node_props:
                        node_props["name"] = node_props.get("label") or node_id

                    if node_id not in G:
                        G.add_node(node_id, **node_props)

                # Process relationship if present
                rel = record["r"]
                target_node = record["m"]
                if rel is not None and target_node is not None:
                    target_id = str(target_node.get("id") or target_node.element_id)
                    target_props = dict(target_node)
                    target_labels = record["target_labels"] or []
                    raw_target_type = target_labels[0] if target_labels else "UNKNOWN"
                    target_props["type"] = normalize_entity_type(raw_target_type)

                    if "name" not in target_props:
                        target_props["name"] = target_props.get("label") or target_id

                    if target_id not in G:
                        G.add_node(target_id, **target_props)

                    rel_props = dict(rel)
                    rel_props["edge_type"] = record["rel_type"]
                    rel_id = (
                        rel.element_id if hasattr(rel, "element_id") else str(rel.id)
                    )

                    G.add_edge(node_id, target_id, key=rel_id, **rel_props)
    finally:
        driver.close()

    # Derive cross-case identifiers from attached source_docs / FIRs
    derive_case_ids(G)

    return G


if __name__ == "__main__":
    print(f"Connecting to Neo4j at {NEO4J_URI} (DB: {NEO4J_DATABASE})...")
    try:
        graph = load_from_neo4j()
        print(
            f"Loaded {graph.number_of_nodes()} nodes and {graph.number_of_edges()} edges from Neo4j."
        )
    except Exception as exc:  # noqa: BLE001
        print(f"Failed to connect or load from Neo4j: {exc}")
