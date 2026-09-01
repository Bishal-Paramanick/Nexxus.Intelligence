Nexxus Intelligence — Central Graph Backend & Multi-Agent Engine
High-performance, graph-native intelligence platform designed to ingest multi-source legal and investigative records (FIRs, CDRs, banking records), perform dynamic forensic graph analytics, execute agentic queries via LangGraph, and expose real-time intelligence to frontend Cytoscape visualization canvases.

👨‍💻 My Role & Contributions: Lead Backend & Multi-Agent Architect
As the Backend & Multi-Agent Systems Engineer, I designed, implemented, and consolidated the core operational backbone connecting raw NLP extraction, graph data modeling, forensic graph analytics, multi-agent AI orchestration, and frontend REST APIs.

Core Architectural Accomplishments
Multi-Agent Orchestration (LangGraph & LangChain):

Engineered a compiled StateGraph workflow featuring specialized nodes: query_agent_node (intent classification & entity resolution), tool_execution_node (dynamic tool routing), and synthesis_node (forensic reporting).

Built 4 LangChain tools (lookup_suspect_tool, get_subgraph_tool, get_evidence_trail_tool, get_risk_breakdown_tool) interfacing directly with graph queries and analytical scoring.

Implemented token-level fuzzy and substring entity matching, allowing natural language queries with multi-word names to resolve target nodes.

Integrated automated Section 65B (Indian Evidence Act / BSA) legal evidence summarization and automated Cypher query synthesis.

NLP Ingestion Pipeline & Schema Adaptation (Person 1 - Hand-off):

Adapted schemas and loaders to process multi-format entity extractions (Person, Phone, Location, Vehicle, Organization, and Account).

Implemented bidirectional document provenance normalization across source_doc and doc_id to eliminate ingestion validation errors.

Mapped flat extraction payloads to typed Pydantic models with automated fallback label resolution for UI canvases.

Graph Analytics & Forensic Risk Engine Integration (Person 3  Hand-off):

Integrated multi-layered graph algorithms in NetworkX: Louvain modularity clustering, PageRank, Degree Centrality, and Betweenness Centrality.

Implemented anomaly detection algorithms for circular transaction loops (money laundering patterns) and call burst spikes.

Coupled graph metrics with dynamic behavioral tagging (Kingpin, Mule, Bridge Node) and time-decay recency weighting.

Frontend REST API Gateway Integration:

Structured and exposed 5 core REST endpoints via FastAPI with CORS integration for Vite/React:

GET /api/graph: Returns nodes, edges, clusters, and normalized risk scores for Cytoscape.js canvas rendering.

GET /api/entity/{id}: Deep-dive suspect intelligence, assigned role tags, and granular risk factor breakdowns.

GET /api/entity/{id}/evidence: Audit trail returning court-admissible source citations and excerpts.

POST /api/agent/query: AI investigator interface returning synthesized reports and highlighted node IDs for canvas viewport focus.

POST /api/ingest: Batch ingestion gateway supporting automated database sync and offline validation.

Dual-Mode Hybrid Storage & Fault Tolerance (Person 2 - Hand-off):

Engineered an adaptive data layer that operates smoothly in in-memory NetworkX/JSON mode for offline testing and local development, while maintaining seamless compatibility with a live Neo4j database instance.

Implemented non-blocking socket checks (verify_connectivity) in ingestion routes to prevent runtime crashes when external databases are provisioning.

Comprehensive Quality Assurance:

Authored a 23-test granular test suite (backend/tests/test_master_pipeline.py) validating the entire pipeline end-to-end with 100% test pass rates.