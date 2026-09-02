<div align="center">

# ⚡ Nexxus Intelligence
### Central Graph Backend & Multi-Agent Engine

*A high-performance, graph-native intelligence platform engineered to ingest multi-source legal records (FIRs, CDRs, banking transactions), perform dynamic forensic graph analytics, execute agentic queries via LangGraph, and feed real-time graph intelligence to Cytoscape.js interfaces.*

---

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi&logoColor=white)](#)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph%20%2F%20LangChain-FF6F00)](#)
[![NetworkX](https://img.shields.io/badge/Graph%20Engine-NetworkX-blueviolet)](#)
[![Neo4j Ready](https://img.shields.io/badge/Storage-Neo4j%20Dual--Mode-008CC1?logo=neo4j&logoColor=white)](#)
[![Tests](https://img.shields.io/badge/Tests-23%2F23%20Passing-brightgreen?logo=pytest&logoColor=white)](#)

</div>

---

## 👨‍💻 My Role & Contributions
### Lead Backend & Multi-Agent Architect

> As the **Lead Backend & Multi-Agent Systems Engineer**, I designed and built the operational core connecting upstream NLP extraction, graph analytics, multi-agent AI orchestration, and frontend REST APIs.

---

### 🌟 Core Architectural Accomplishments

#### 1. Multi-Agent Orchestration (`LangGraph` & `LangChain`)
* **Compiled StateGraph Workflow:** Engineered a multi-agent state machine comprising:
  * `query_agent_node`: Intent classification and fuzzy token-level entity resolution.
  * `tool_execution_node`: Dynamic routing to analytical tools based on query intent.
  * `synthesis_node`: Legal evidence synthesis under Section 65B standards.
* **Specialized Agent Tools:** Built 4 production-grade LangChain `@tool` wrappers:
  * `lookup_suspect_tool` — Rapid profile retrieval and metadata extraction.
  * `get_subgraph_tool` — Dynamic ego-network subgraph slicing.
  * `get_evidence_trail_tool` — Court-admissible provenance audit trail gathering.
  * `get_risk_breakdown_tool` — Suspect risk factor computation and anomaly detection.
* **Resilient Entity Matching:** Built token-level regex resolvers capable of mapping ambiguous multi-word suspect queries (e.g., `"Rahul"`) to target entities (`"Rahul Sharma"`).
* **Section 65B Compliance:** Automated natural language lead generation citing FIR case IDs, call record timestamps, and verified text spans.

---

#### 2. Ingestion Adaptation & Normalization *(Person 1 Hand-off)*
* **Entity Support:** Adapted loaders and Pydantic schemas to parse all 6 canonical entity types: `Person`, `Phone`, `Location`, `Vehicle`, `Organization`, and `Account`.
* **Bidirectional Key Normalization:** Normalized `source_doc` $\leftrightarrow$ `doc_id` across models to eliminate 422 schema crashes.
* **Dynamic Property Resolution:** Formatted flat entity payloads (`registration_number`, `account_number`, `number`) with fallback label resolution for canvas rendering.

---

#### 3. Forensic Analytics & Anomaly Detection *(Person 3 Hand-off)*
* **Network Algorithms:** Integrated Louvain modularity community detection, PageRank, Degree Centrality, and Betweenness Centrality on dynamic `NetworkX` graphs.
* **Financial Crime Detection:** Implemented cycle-detection algorithms to catch circular transaction loops (money laundering patterns).
* **Behavioral Tagging:** Implemented dynamic threshold scoring assigning roles such as `Kingpin`, `Mule`, and `Bridge Node`.

---

#### 4. Frontend REST Gateway (`FastAPI`)
* **UI Integration:** Configured CORS middleware for local Vite/React development (`http://localhost:5173`).
* **5 Core Contracts:**
  | Endpoint | Method | Purpose / Frontend Destination |
  | :--- | :---: | :--- |
  | `/api/graph` | `GET` | Cytoscape.js canvas rendering with clusters & risk scores |
  | `/api/entity/{id}` | `GET` | Suspect card drawer with factor breakdowns & tags |
  | `/api/entity/{id}/evidence` | `GET` | Slide-out legal evidence drawer with Section 65B excerpts |
  | `/api/agent/query` | `POST` | AI copilot endpoint with response & highlighted node IDs |
  | `/api/ingest` | `POST` | Batch ingestion endpoint for raw extracted payloads |

---

#### 5. Dual-Mode Storage Engine *(Person 2 Hand-off)*
* **Zero-Crash Resilience:** Implemented non-blocking socket checks (`verify_connectivity`) in ingestion and query routes, avoiding connection drops during testing when external databases are offline.
* **Drop-in Neo4j Activation:** Architecture defaults to an in-memory/JSON store for testing, with instant live database activation via `DATA_SOURCE = "neo4j"`.

---

#### 6. End-to-End Test Suite
* Built a master test suite (`backend/tests/test_master_pipeline.py`) validating extraction ingestion, risk algorithms, tools, LangGraph state flows, and REST endpoints.
* **Result:** **23 / 23 tests passing (100% pass rate)**.

---

