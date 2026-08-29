from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

# =============================================================================
# 1. GRAPH PRIMITIVES & VISUAL CANVAS SCHEMAS
# =============================================================================

EntityType = Literal["Person", "Phone", "Location", "Vehicle", "Organization"]
RelationshipType = Literal[
    "CALLED", "TRANSACTED_WITH", "PRESENT_AT", "OWNS_VEHICLE", "MEMBER_OF"
]


class NodeProperties(BaseModel):
    name: str | None = None
    normalized_name: str | None = None
    aliases: list[str] = Field(default_factory=list)
    number: str | None = None
    normalized_number: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    registration_number: str | None = None
    vehicle_type: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class GraphNode(BaseModel):
    id: str = Field(..., description="Stable unique ID (e.g., P001, PH001, LOC001)")
    label: str = Field(..., description="Display title for canvas rendering")
    type: EntityType = Field(
        ..., description="Neo4j label: Person, Phone, Location, Vehicle, Organization"
    )
    risk_score: float = Field(
        default=0.0, ge=0.0, le=100.0, description="Risk score between 0 and 100"
    )
    group: str | None = Field(
        default=None, description="Community cluster / gang group identifier"
    )
    properties: NodeProperties = Field(default_factory=NodeProperties)


class EdgeProperties(BaseModel):
    timestamp: str | None = None
    duration: int | None = Field(default=None, description="Call duration in seconds")
    amount: float | None = Field(
        default=None, description="Hawala / transaction amount in INR"
    )
    transaction_id: str | None = None
    role: str | None = Field(default=None, description="Corporate role for MEMBER_OF")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source_doc: str | None = Field(
        default=None, description="Document provenance ID (e.g., FIR_102, CDR_AUG_01)"
    )
    evidence: str | None = Field(
        default=None, description="Original text span from source document"
    )


class GraphEdge(BaseModel):
    id: str | None = None
    source: str = Field(..., description="Origin node ID")
    target: str = Field(..., description="Target node ID")
    type: RelationshipType = Field(
        ..., description="Relationship verb: CALLED, TRANSACTED_WITH, etc."
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Extraction confidence score"
    )
    doc_id: str | None = Field(
        default=None,
        description="Primary source document reference (alias for source_doc)",
    )
    properties: EdgeProperties = Field(default_factory=EdgeProperties)


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


# =============================================================================
# 2. ENTITY INTELLIGENCE & RISK SCORING SCHEMAS
# =============================================================================


class RiskBreakdown(BaseModel):
    call_frequency_score: float = Field(default=0.0, ge=0.0, le=100.0)
    cross_case_score: float = Field(default=0.0, ge=0.0, le=100.0)
    centrality_score: float = Field(default=0.0, ge=0.0, le=100.0)
    financial_anomaly_score: float = Field(default=0.0, ge=0.0, le=100.0)
    # Optional GDS Granular Scores
    degree_centrality: float | None = Field(default=None, ge=0.0, le=100.0)
    pagerank_score: float | None = Field(default=None, ge=0.0, le=100.0)
    betweenness_centrality: float | None = Field(default=None, ge=0.0, le=100.0)


class EntityDetailResponse(BaseModel):
    id: str
    name: str
    type: EntityType
    overall_risk_score: float = Field(..., ge=0.0, le=100.0)
    risk_breakdown: RiskBreakdown
    aliases: list[str] = Field(default_factory=list)
    tags: list[str] = Field(
        default_factory=list,
        description="e.g., ['Kingpin', 'Money Mule', 'Bridge Node']",
    )
    direct_connections_count: int = 0
    metadata: dict[str, Any] = Field(default_factory=dict)


# =============================================================================
# 3. LEGAL EVIDENCE SCHEMA (Audit Drawer / BSA Section 65B Compliance)
# =============================================================================


class EvidenceItem(BaseModel):
    doc_id: str = Field(
        ..., description="Unique document ID (e.g., FIR_102, CDR_AUG_01)"
    )
    doc_type: str = Field(
        ..., description="Evidence category: FIR, CDR, BANK_TXN, RTO_RECORD, MCA_RECORD"
    )
    excerpt: str = Field(..., description="Original excerpt proving the connection")
    timestamp: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    verified_by_nlp: bool = True


# =============================================================================
# 4. INGESTION SCHEMAS (Abhidha NLP -> Ankit Entity Resolution -> Neo4j)
# =============================================================================


class IngestEntity(BaseModel):
    id: str | None = None
    name: str
    type: EntityType
    aliases: list[str] = Field(default_factory=list)
    source_doc: str | None = None
    properties: dict[str, Any] = Field(default_factory=dict)


class IngestRelationship(BaseModel):
    source: str = Field(..., description="Source node ID or raw extracted name")
    type: RelationshipType
    target: str = Field(..., description="Target node ID or raw extracted name")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    doc_id: str = Field(..., description="Source document ID")
    timestamp: str | None = None
    evidence: str | None = None
    properties: dict[str, Any] = Field(default_factory=dict)


class IngestionPayload(BaseModel):
    source_doc: str | None = Field(default=None, description="Batch source document ID")
    entities: list[IngestEntity]
    relationships: list[IngestRelationship]


class IngestionResponse(BaseModel):
    status: str
    nodes_processed: int
    relationships_processed: int
    duplicates_resolved: int = 0


# =============================================================================
# 5. AGENTIC AI & NATURAL LANGUAGE QUERY SCHEMAS
# =============================================================================


class AgentQueryRequest(BaseModel):
    query: str = Field(
        ...,
        examples=["Show all high-risk suspects connected to Rahul Sharma"],
        description="Natural language investigation prompt",
    )


class AgentQueryResponse(BaseModel):
    query: str
    cypher_generated: str
    answer: str
    highlighted_nodes: list[str] = Field(default_factory=list)
    subgraph: GraphResponse | None = None
    evidence: list[EvidenceItem] = Field(default_factory=list)
