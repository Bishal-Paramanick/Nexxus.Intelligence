# Nexxus.Intelligence — Backend, Graph Analytics & Risk Engine

Standalone, production-grade investigative graph backend service for law enforcement intelligence. Ingests multimodal records (FIR, CDR, Bank Statements, MCA, RTO), executes graph centrality and behavioral anomaly algorithms, derives multi-case linkages, and serves Pydantic-validated REST API endpoints for downstream frontend visualization and AI agents.

---

## 📁 Architecture & File Overview

* **`backend/app/schemas.py`** — Official Pydantic schema contracts defining `GraphNode`, `GraphEdge`, `RiskBreakdown`, `EntityDetailResponse`, `EvidenceItem`, and `IngestionPayload`.
* **`backend/app/services/constants.py`** — Canonical entity types (`Person`, `Phone`, `Location`, `Vehicle`, `Organization`) and relationship types (`CALLED`, `TRANSACTED_WITH`, `PRESENT_AT`, `OWNS_VEHICLE`, `MEMBER_OF`). Provides case-normalization routines.
* **`backend/scripts/mock_graph.py`** — Synthetic test graph modeling a criminal syndicate: a circular fund-routing loop (money laundering), a low-profile bridge coordinator, high-frequency call bursts, and multi-case suspects.
* **`backend/app/services/json_loader.py`** — Parses Person 1 (NLP Extraction) batch JSON exports into an in-memory `networkx.MultiDiGraph`, normalizing entity casing, unpacking nested properties, and creating stub nodes for dangling references.
* **`backend/app/services/neo4j_loader.py`** — Live Cypher extraction client connecting to Person 2's Neo4j database instance via environment variables (`NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`, `NEO4J_DATABASE`).
* **`backend/app/services/case_utils.py`** — Shared case-derivation engine matching case and FIR pattern provenance across nodes and edges to populate `case_ids` dynamically.
* **`backend/app/services/watchlist.py`** — Dynamic known-offenders lookup supporting case-insensitive name/ID verification and risk point boosting (`WATCHLIST_BOOST`).
* **`backend/app/services/analytics.py`** — Graph algorithms:
  * Centrality computation (Degree, PageRank, Betweenness).
  * `compute_bridge_score()`: Disproportionate betweenness-to-degree ratio to detect low-profile coordinators.
  * Louvain community and gang cluster detection.
  * Scored circular transaction detection (temporal consistency and amount matching).
  * Temporal call burst detection ($\ge 10\text{ calls/day}$).
  * Multi-case overlap detection.
* **`backend/app/services/risk_engine.py`** — Multi-factor scoring engine:
  * Normalized sub-scores (0–100) matching `RiskBreakdown`.
  * Time-decay multiplier with exponential half-life ($T_{1/2} = 90\text{ days}$) anchored to latest graph activity.
  * Percentile rank computation.
  * Behavioral tag assignments (`"Bridge Node"`, `"Hidden Kingpin"`, `"Kingpin"`, `"Money Mule"`, `"High Communication Volume"`, `"Watchlisted"`).
* **`backend/app/services/explanation.py`** — Section 65B legal evidence extractor and ordered cycle path visualizer for circular transaction loops.
* **`backend/app/services/schema_mapper.py`** — Converts raw NetworkX graph elements into strict Pydantic `GraphResponse` and `EntityDetailResponse` structures.
* **`backend/app/main.py`** & **`backend/app/api/`** — FastAPI application serving the investigative endpoints.
* **`backend/tests/test_services.py`** — Integration test suite verifying all graph loaders, algorithms, risk scoring, and schema validations.

---

## 🚀 Setup & Execution

### 1. Environment Installation
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt