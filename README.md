# Person 3 — Graph Analytics + Risk Engine

Standalone module. Runs entirely on a mock graph right now, so it doesn't
block on Person 1 (extraction) or Person 2 (Neo4j). Output is validated
against **Person 4's official schema contract** (`schemas.py`) using real
Pydantic instances — if our data doesn't conform, it fails here during
testing, not inside their FastAPI during integration or the demo.

## Files

- `schemas.py` — local copy of Person 4's official backend contract
  (pasted 2026-08-29). Don't edit casually; if it changes on their end,
  update this to match.
- `constants.py` — canonical entity/relationship type names, aligned to
  `schemas.py`. Everyone should import type strings from here.
- `mock_graph.py` — synthetic test graph with a deliberate story: a
  circular transaction (laundering pattern), a high-betweenness bridge
  node, a call burst, and a small isolated community.
- `json_loader.py` — parses Person 1/2's real entities+relationships JSON
  export into a `networkx.MultiDiGraph`, normalizing type casing and
  handling dangling entity references (see "Data quality issues" below).
- `graph_loader.py` — single entry point (`load_graph()`) everything else
  calls. Toggle `DATA_SOURCE = "mock" | "json" | "neo4j"`.
- `analytics.py` — centrality, Louvain community detection, rule-based
  anomaly detection (circular transactions, call bursts, cross-case).
- `risk_engine.py` — computes the six `RiskBreakdown` sub-scores (all
  0–100), `overall_risk_score`, and investigative `tags` ("Bridge Node",
  "Kingpin", "Money Mule", "High Communication Volume").
- `schema_mapper.py` — builds real `GraphNode` / `GraphEdge` /
  `GraphResponse` / `EntityDetailResponse` Pydantic instances from the
  graph + risk output. Filters out anything that wouldn't pass Person 4's
  validation (see below).
- `api_interface.py` — **the only file Person 4 should import.**

## Setup

```bash
pip install -r requirements.txt
```

## Run

```bash
python risk_engine.py      # ranked risk breakdown for the mock graph
python api_interface.py    # full GraphResponse + a sample EntityDetailResponse, Pydantic-validated
```

## How each person uses this folder

**Person 1 (extraction)** — import type strings from `constants.py`
(`normalize_entity_type`, `OFFICIAL_EDGE_TYPES`) instead of hardcoding.
Every PERSON/Person entity needs a `case_ids` list (or enough `FIR_*`
`source_doc` references for `json_loader.py` to derive one — see below).

**Person 2 (Neo4j)** — same: node labels and relationship types in Neo4j
should match `constants.py`/`schemas.py` exactly (Title Case entity types
like `Person`, `Phone`; relationship types like `CALLED`). When ready, set
`USE_NEO4J`-equivalent (`DATA_SOURCE = "neo4j"`) in `graph_loader.py` and
fill in `_load_from_neo4j()`.

**Person 4 (backend/API)** — import `api_interface.py` only:

```python
from api_interface import get_full_analysis, get_entity_detail
from schemas import GraphResponse, EntityDetailResponse

@app.get("/api/graph", response_model=GraphResponse)
def get_graph():
    return get_full_analysis()

@app.get("/api/entity/{entity_id}", response_model=EntityDetailResponse)
def get_entity(entity_id: str):
    result = get_entity_detail(entity_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    return result
```

Cache `get_full_analysis()` in your API layer (recompute on an interval,
not per-request) — it's not built for high request volume.

**Person 5 (frontend)** — consume Person 4's `/api/graph` and
`/api/entity/{id}` endpoints directly; you don't touch this folder.

## ⚠️ Open issues to resolve with the team (found 2026-08-29)

1. **`ASSOCIATED_WITH` is not in Person 4's official `RelationshipType`.**
   Our mock graph and the original team plan both use it for generic
   associations. Right now `schema_mapper.py` keeps it in the *internal*
   analytics graph (useful for community detection) but **silently drops
   any such edge before it reaches the API** — so if Person 1/2's real
   data uses this relationship type, that data will not appear in the
   API output at all. Either get Person 4 to add it to the Literal, or
   agree to stop producing it upstream.

2. **No explicit `case_ids` field in Person 1/2's real sample.** Their
   schema uses `source_doc` per entity/relationship, not a case ID.
   `json_loader.py` assumes **any `source_doc` matching `FIR_<number>` is
   a distinct case** and derives `case_ids` from that (CDR/financial/MCA/
   RTO records are treated as supporting evidence, not separate cases).
   **Confirm this assumption with Person 1/2** — if a person can be tied
   to a case without a FIR record directly naming them, they'll be
   undercounted on `cross_case_score`.

3. **Dangling entity references cause real data loss.** In the sample
   Person 2 provided, relationships referenced `P002`, `P003`, `P004` as
   source/target, but the `entities` list never defined them. Our loader
   doesn't crash (creates a stub, warns) but `schema_mapper.py` **must**
   drop those stub nodes *and* any edge touching them before the API
   response, to avoid the frontend graph rendering an edge that points at
   nothing. In that sample, this meant 4 of 5 relationships were dropped
   from the final API output. **This needs to be fixed at the extraction
   source (Person 1), not patched around downstream** — otherwise the
   real graph the frontend/investigator sees will be missing most of the
   actual connections.

## Data contract quick reference

- Entity types: `Person`, `Phone`, `Location`, `Vehicle`, `Organization`
  (Title Case — `constants.normalize_entity_type()` also accepts the old
  all-caps form and converts it).
- Relationship types (official): `CALLED`, `TRANSACTED_WITH`,
  `PRESENT_AT`, `OWNS_VEHICLE`, `MEMBER_OF`.
- `case_ids`: list of case identifiers, required on every Person node (or
  derivable from `FIR_*` source docs).
- Timestamps: ISO format; a trailing `Z` (as in Person 1/2's real sample)
  is handled automatically.

## Upgrades added (2026-08-29)

- **Percentile rank** — `metadata.percentile_rank` on every entity, so a
  raw score like 76 has context ("top 15% of entities in this graph").
- **Watchlist boost** (`watchlist.py`) — a flat bonus + `"Watchlisted"` tag
  for entities matching a known-offender list. Currently mock data
  (`KNOWN_OFFENDERS` dict) — swap for a real lookup later, interface stays
  the same.
- **Time-decay weighting** — `call_frequency_score` and
  `financial_anomaly_score` are multiplied by a recency factor
  (`metadata.recency_multiplier`, half-life `DECAY_HALF_LIFE_DAYS` in
  `risk_engine.py`) so a call burst or transaction anomaly from months ago
  counts less than one from yesterday. "Now" is the latest timestamp
  found anywhere in the graph, not wall-clock time — important since demo
  data lives in its own timeline. Centrality scores are NOT decayed
  (structural position, not a recency-sensitive signal).
- **Explanation path highlight** (`explanation.py`) — `get_entity_evidence()`
  returns the actual source-document excerpts (as `EvidenceItem`s) behind
  an entity's connections; `get_explanation_path()` returns the exact
  cycle of entities for a circular-transaction flag, ready for the
  frontend to highlight. Both feed into `metadata.evidence` /
  `metadata.explanation_path` on `EntityDetailResponse`, and are exactly
  the shape Person 4's Phase 2 LangGraph explanation-agent should call
  when answering "why is X high risk?" (maps directly to
  `AgentQueryResponse.evidence` / `.highlighted_nodes` in their schema).

All four extras live inside `EntityDetailResponse.metadata` — Person 4's
official schema wasn't touched, `metadata: dict[str, Any]` is exactly the
extension point they designed for this.

## Neo4j integration (2026-08-29)

`neo4j_loader.py` is now a **real, working loader** (not a placeholder) --
tested against a JSON mirror of Person 2's actual Cypher seed script,
which is 100% schema-compatible: correctly-cased entity types (Cypher
labels map directly to `Person`/`Phone`/`Location`/`Vehicle`/`Organization`,
no normalization needed on this path), property names matching Person 4's
`NodeProperties` field-for-field, and relationship properties matching
`EdgeProperties`. No `ASSOCIATED_WITH` usage, and — unlike the earlier
JSON sample — **no dangling entity references**: every relationship's
source/target has a full entity record.

To use it for real:

```bash
docker compose up -d          # starts Neo4j locally (see docker-compose.yml)
# load Person 2's seed Cypher script via Neo4j Browser or cypher-shell
```

Then in `graph_loader.py`:

```python
DATA_SOURCE = "neo4j"
```

Connection defaults to `bolt://localhost:7687` / `neo4j` / `password` --
override with `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` environment
variables if Person 2's instance runs elsewhere.

`case_utils.py` now holds the shared case-ID derivation logic (previously
duplicated inline in `json_loader.py`) — both `json_loader.py` and
`neo4j_loader.py` use it, so the FIR-pattern assumption only needs fixing
in one place if the team's definition of "case" changes.

Note: this particular seed data has no `evidence` text fields (unlike the
earlier JSON sample), so `metadata.evidence` will be empty for entities
loaded this way — that's expected, not a bug; add `evidence` properties to
edges when that's ready in the real pipeline.

## Validated against Person 1's real ground-truth case (2026-08-29)

Person 1 sent a full synthetic dataset with a known answer key (3 FIRs,
call records, transaction records, plus the expected findings: a hidden
kingpin, two clusters, an entity-resolution case, a calling spike, and a
circular fund-routing loop). Ran it through the full pipeline and
compared against the answer key -- this caught two real bugs and drove
two real algorithm improvements:

**Bugs fixed:**
- `case_utils.py`'s FIR-pattern match was case-sensitive (`^FIR`) but this
  real data uses lowercase `fir_101` -- silently produced empty
  `case_ids` for everyone. Fixed with `re.IGNORECASE`.

**Algorithm improvements (both directly motivated by this dataset):**
- **`compute_bridge_score()`** (new, in `analytics.py`) — raw betweenness
  centrality alone flagged the wrong entity as the network's most
  important bridge: a well-connected hub (high degree AND high
  betweenness) out-ranked the actual low-profile "hidden kingpin" (low
  degree, but disproportionately high betweenness). betweenness/degree
  ratio fixes this — surfaces the "few connections, but everything routes
  through them" signature instead. Drives a new `"Hidden Kingpin"` tag,
  distinct from `"Bridge Node"`.
- **Circular transaction significance scoring** (`detect_circular_transactions`
  in `analytics.py` now returns scored cycles, not just paths) — a real
  laundering loop (consistent amounts, closes within ~72h) is now
  distinguished from a coincidental cycle that can form from unrelated
  back-and-forth transactions between the same accounts. `risk_engine.py`
  weights `financial_anomaly_score` accordingly (100 for a confirmed
  loop, 30 for an incidental one, 0 for none).

**Confirmed working correctly, no changes needed:**
- Call burst detection caught the exact 22-call spike between the two
  ground-truth entities on the exact flagged date.
- Community detection separated the two expected clusters (though
  Louvain's modularity optimization split one cluster into two tighter
  sub-groups where a very dense edge -- the 22-call spike -- pulled two
  nodes into their own micro-community; worth tuning Louvain's resolution
  parameter if a cleaner 2-cluster split is wanted for the demo).

**Data gap found (not a code issue, flag to Person 1):** one entity's
presence in a third case was established only through FIR narrative text
("was seen visiting the branch..."), never captured as a structured
CALLED/TRANSACTED_WITH/PRESENT_AT relationship in the CDR/transaction
data. `cross_case_score` under-counts this entity as a result. Extracting
a `PRESENT_AT` relationship from narrative FIR text (not just structured
CDR/transaction data) would close this gap — worth raising with Person 1.
