# Folder structure (reorganized 2026-08-30)

Same code as before, just grouped by what it does. Import paths were
updated to match -- everything still runs, tested end to end (mock
graph, JSON data source, and the full API pipeline).

```
graph/
├── contracts/       Data contract -- what everyone must agree on
│   ├── schemas.py       Person 4's official Pydantic models (source of truth)
│   └── constants.py     Entity/relationship type names, normalization
│
├── data_sources/    Turns raw data into the networkx graph
│   ├── mock_graph.py    Synthetic test graph (no dependencies)
│   ├── json_loader.py   Parses Person 1/2's JSON export
│   ├── neo4j_loader.py  Reads Person 2's live Neo4j graph
│   ├── case_utils.py    Shared case_ids derivation (used by both loaders)
│   └── graph_loader.py  Entry point -- load_graph(), picks the source
│
├── engine/          The actual analysis -- "main engine"
│   ├── analytics.py     Centrality, communities, anomaly detection
│   ├── risk_engine.py   Combines analytics into the 6 risk sub-scores
│   ├── watchlist.py     Known-offender lookup + score boost
│   └── explanation.py   "Why is this flagged" evidence trail
│
├── api/             Output layer -- what Person 4 actually imports
│   ├── schema_mapper.py   Converts graph + risk output -> real GraphNode/
│   │                      GraphEdge/GraphResponse/EntityDetailResponse
│   │                      instances, filtering out anything invalid
│   └── api_interface.py   get_full_analysis() / get_entity_detail() --
│                           the ONLY module Person 4 should import
│
├── sample_data/     Test fixtures, not code
│   ├── sample_person2_data.json      Early real sample (has dangling refs)
│   ├── ground_truth_case.json        Person 1's full validated dataset
│   └── build_ground_truth_data.py    Script that generated it
│
├── docs/
│   ├── README.md                  Full original documentation, open issues
│   └── DATA_CONTRACT_FOR_PERSON1.md
│
├── requirements.txt
└── docker-compose.yml             Local Neo4j for testing neo4j_loader.py
```

## How to run things now

Everything is a proper Python package (`graph/`), so run modules with
`-m` from the folder **containing** `graph/` (i.e. one level above this
file):

```bash
pip install -r graph/requirements.txt

python -m graph.engine.risk_engine        # ranked risk breakdown, mock graph
python -m graph.api.api_interface         # full GraphResponse + sample entity detail
python -m graph.data_sources.json_loader  # smoke-test the JSON loader
```

Person 4 imports it the same way as before, just with the full path:

```python
from graph.api.api_interface import get_full_analysis, get_entity_detail
from graph.contracts.schemas import GraphResponse, EntityDetailResponse
```

## What changed vs. the flat layout

Only import lines (e.g. `from constants import ...` became
`from graph.contracts.constants import ...`) and two hardcoded relative
file paths (`graph_loader.py`'s `JSON_DATA_PATH`, `json_loader.py`'s
default sample path) -- both now resolve relative to the file's own
location instead of assuming you're running from inside the old flat
`graph/` folder. No logic was touched.
