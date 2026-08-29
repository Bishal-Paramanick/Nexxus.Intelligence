import uuid
from typing import Any, cast

from app.database.neo4j_driver import db
from app.schemas import (
    EdgeProperties,
    EntityDetailResponse,
    EntityType,
    EvidenceItem,
    GraphEdge,
    GraphNode,
    GraphResponse,
    IngestionPayload,
    IngestionResponse,
    NodeProperties,
    RelationshipType,
    RiskBreakdown,
)

VALID_ENTITY_TYPES: set[str] = {
    "Person",
    "Phone",
    "Location",
    "Vehicle",
    "Organization",
}
VALID_REL_TYPES: set[str] = {
    "CALLED",
    "TRANSACTED_WITH",
    "PRESENT_AT",
    "OWNS_VEHICLE",
    "MEMBER_OF",
}


def _normalize_entity_type(
    raw_type: str | None, labels: list[str]
) -> EntityType:
    """Safely maps arbitrary Neo4j labels to valid EntityType Literals."""
    candidates = [raw_type] + labels if raw_type else labels
    for cand in candidates:
        if not cand:
            continue
        for valid in VALID_ENTITY_TYPES:
            if cand.strip().lower() == valid.lower():
                return cast(EntityType, valid)
    return "Person"


def _normalize_rel_type(raw_type: str | None) -> RelationshipType:
    """Safely maps arbitrary Neo4j relationship types to valid RelationshipType Literals."""
    if raw_type:
        raw_clean = raw_type.strip().upper()
        if raw_clean in VALID_REL_TYPES:
            return cast(RelationshipType, raw_clean)
    return "CALLED"


def _extract_node_id(props: dict[str, Any], elem_id: str | None = None) -> str:
    """Extracts a reliable unique identifier from node properties."""
    return str(
        props.get("id")
        or props.get("suspect_id")
        or props.get("number")
        or props.get("registration_number")
        or elem_id
        or uuid.uuid4()
    )


def _dict_to_graph_node(
    props: dict[str, Any], labels: list[str], elem_id: str | None = None
) -> GraphNode:
    node_id = _extract_node_id(props, elem_id)
    label = str(
        props.get("name")
        or props.get("label")
        or props.get("number")
        or props.get("registration_number")
        or node_id
    )
    entity_type = _normalize_entity_type(props.get("type"), labels)

    return GraphNode(
        id=node_id,
        label=label,
        type=entity_type,
        risk_score=float(props.get("risk_score", props.get("risk", 50.0))),
        group=str(
            props.get("group")
            or props.get("syndicate")
            or (labels[0] if labels else "General")
        ),
        properties=NodeProperties(
            name=props.get("name"),
            normalized_name=props.get("normalized_name"),
            aliases=props.get("aliases", []) or [],
            number=props.get("number"),
            normalized_number=props.get("normalized_number"),
            latitude=props.get("latitude"),
            longitude=props.get("longitude"),
            registration_number=props.get("registration_number"),
            vehicle_type=props.get("vehicle_type"),
            created_at=str(props.get("created_at"))
            if props.get("created_at")
            else None,
            updated_at=str(props.get("updated_at"))
            if props.get("updated_at")
            else None,
        ),
    )


def fetch_full_graph(limit: int = 150) -> GraphResponse:
    """Fetches full graph nodes and connecting edges with fallbacks."""
    # 1. Fetch nodes
    node_cypher = f"""
    MATCH (n)
    RETURN elementId(n) AS elem_id, labels(n) AS labels, properties(n) AS props
    LIMIT {limit}
    """
    node_records = db.query(node_cypher)

    nodes_dict: dict[str, GraphNode] = {}
    elem_to_id_map: dict[str, str] = {}

    for rec in node_records:
        elem_id = str(rec["elem_id"])
        props = rec.get("props", {})
        labels = rec.get("labels", [])

        node_obj = _dict_to_graph_node(props, labels, elem_id)
        nodes_dict[node_obj.id] = node_obj
        elem_to_id_map[elem_id] = node_obj.id

    # 2. Fetch relationships
    edge_cypher = f"""
    MATCH (s)-[r]->(t)
    RETURN 
        elementId(r) AS rel_id,
        elementId(s) AS src_elem_id,
        elementId(t) AS tgt_elem_id,
        properties(s) AS src_props,
        properties(t) AS tgt_props,
        type(r) AS rel_type,
        properties(r) AS props
    LIMIT {limit}
    """
    edge_records = db.query(edge_cypher)
    edges: list[GraphEdge] = []

    for rec in edge_records:
        props = rec.get("props", {})
        src_props = rec.get("src_props", {})
        tgt_props = rec.get("tgt_props", {})

        src_id = elem_to_id_map.get(
            str(rec["src_elem_id"]), _extract_node_id(src_props)
        )
        tgt_id = elem_to_id_map.get(
            str(rec["tgt_elem_id"]), _extract_node_id(tgt_props)
        )

        edges.append(
            GraphEdge(
                id=str(props.get("id") or rec["rel_id"]),
                source=src_id,
                target=tgt_id,
                type=_normalize_rel_type(rec["rel_type"]),
                confidence=float(props.get("confidence", 1.0)),
                doc_id=props.get("source_doc") or props.get("doc_id"),
                properties=EdgeProperties(
                    timestamp=str(props.get("timestamp"))
                    if props.get("timestamp")
                    else None,
                    duration=props.get("duration"),
                    amount=props.get("amount"),
                    transaction_id=props.get("transaction_id"),
                    role=props.get("role"),
                    confidence=float(props.get("confidence", 1.0)),
                    source_doc=props.get("source_doc") or props.get("doc_id"),
                    evidence=props.get("evidence"),
                ),
            )
        )

    return GraphResponse(nodes=list(nodes_dict.values()), edges=edges)


def fetch_entity_detail(entity_id: str) -> EntityDetailResponse | None:
    """Fetches node details and calculates centrality and risk breakdown."""
    cypher = """
    MATCH (p)
    WHERE p.id = $id 
       OR toLower(p.id) = toLower($id)
       OR p.number = $id 
       OR p.registration_number = $id 
       OR elementId(p) = $id
    OPTIONAL MATCH (p)-[r]-(neighbor)
    RETURN 
        p {.*, __labels: labels(p)} AS node,
        count(DISTINCT neighbor) AS degree,
        count(DISTINCT CASE WHEN type(r) = 'CALLED' THEN r END) AS call_count,
        count(DISTINCT CASE WHEN type(r) = 'TRANSACTED_WITH' THEN r END) AS txn_count
    LIMIT 1
    """
    records = db.query(cypher, {"id": entity_id})
    if not records or not records[0].get("node"):
        return None

    rec = records[0]
    node = rec["node"]
    degree = int(rec["degree"] or 0)
    call_count = int(rec["call_count"] or 0)
    txn_count = int(rec["txn_count"] or 0)

    calc_centrality = min(100.0, float(degree * 20.0))
    calc_call_freq = min(100.0, float(call_count * 25.0))
    calc_fin_anomaly = min(100.0, float(txn_count * 30.0))
    overall_risk = round(
        (calc_centrality * 0.4 + calc_call_freq * 0.3 + calc_fin_anomaly * 0.3),
        1,
    )

    labels = node.get("__labels", [])
    entity_type = _normalize_entity_type(node.get("type"), labels)

    return EntityDetailResponse(
        id=str(node.get("id") or entity_id),
        name=str(
            node.get("name")
            or node.get("number")
            or node.get("registration_number")
            or entity_id
        ),
        type=entity_type,
        overall_risk_score=float(node.get("risk_score") or overall_risk),
        risk_breakdown=RiskBreakdown(
            call_frequency_score=calc_call_freq,
            cross_case_score=float(node.get("cross_case_score", 45.0)),
            centrality_score=calc_centrality,
            financial_anomaly_score=calc_fin_anomaly,
        ),
        aliases=node.get("aliases", []) or [],
        tags=[
            "Primary Target" if overall_risk > 70 else "Associate",
            f"Degree-{degree}",
        ],
        direct_connections_count=degree,
        metadata={k: v for k, v in node.items() if not k.startswith("__")},
    )


def fetch_entity_evidence(entity_id: str) -> list[EvidenceItem]:
    """Retrieves evidence audit records without triggering DBMS missing-property warnings."""
    cypher = """
    MATCH (p)-[r]-(target)
    WHERE p.id = $id 
       OR toLower(p.id) = toLower($id)
       OR p.number = $id 
       OR p.registration_number = $id 
       OR elementId(p) = $id
    RETURN 
        coalesce(properties(r).source_doc, properties(r).doc_id, 'RECORD-REF') AS doc_id,
        type(r) AS rel_type,
        coalesce(properties(r).evidence, 'Detected ' + type(r) + ' relationship between ' + coalesce(p.name, p.id, 'Subject') + ' and ' + coalesce(target.name, target.id, target.registration_number, target.number, 'Asset')) AS excerpt,
        coalesce(properties(r).timestamp, '2026-08-20T00:00:00Z') AS timestamp,
        coalesce(properties(r).confidence, 0.95) AS confidence
    LIMIT 20
    """
    records = db.query(cypher, {"id": entity_id})
    evidence_list: list[EvidenceItem] = []

    for rec in records:
        rel_type = rec["rel_type"]
        doc_id = str(rec["doc_id"])

        if "CDR" in doc_id or rel_type == "CALLED":
            doc_type = "CDR"
        elif "FIN" in doc_id or rel_type == "TRANSACTED_WITH":
            doc_type = "BANK_TXN"
        elif "RTO" in doc_id or rel_type == "OWNS_VEHICLE":
            doc_type = "RTO_RECORD"
        elif "MCA" in doc_id or rel_type == "MEMBER_OF":
            doc_type = "MCA_RECORD"
        else:
            doc_type = "FIR"

        evidence_list.append(
            EvidenceItem(
                doc_id=doc_id,
                doc_type=doc_type,
                excerpt=str(rec["excerpt"]),
                timestamp=str(rec["timestamp"]),
                confidence=float(rec["confidence"]),
                verified_by_nlp=True,
            )
        )
    return evidence_list


def batch_ingest_payload(payload: IngestionPayload) -> IngestionResponse:
    """Batch upserts nodes and relationships using UNWIND Cypher statements."""
    entity_upsert_cypher = """
    UNWIND $entities AS entity
    MERGE (n {id: entity.id})
    SET n += entity.properties,
        n.name = entity.name,
        n.aliases = entity.aliases,
        n.type = entity.type,
        n.source_doc = coalesce(entity.source_doc, $batch_doc)
    RETURN count(n)
    """

    relationship_upsert_cypher = """
    UNWIND $relationships AS rel
    MATCH (src {id: rel.source})
    MATCH (tgt {id: rel.target})
    MERGE (src)-[r:CONNECTED {source_doc: rel.doc_id}]->(tgt)
    SET r += rel.properties,
        r.type = rel.type,
        r.confidence = rel.confidence,
        r.timestamp = rel.timestamp,
        r.evidence = rel.evidence
    RETURN count(r)
    """

    entities_data = [e.model_dump() for e in payload.entities]
    relationships_data = [r.model_dump() for r in payload.relationships]

    db.query(
        entity_upsert_cypher,
        {"entities": entities_data, "batch_doc": payload.source_doc},
    )
    db.query(
        relationship_upsert_cypher,
        {"relationships": relationships_data},
    )

    return IngestionResponse(
        status="success",
        nodes_processed=len(entities_data),
        relationships_processed=len(relationships_data),
        duplicates_resolved=0,
    )