"""
backend/app/services/graph_loader.py
Single entry point analytics.py and risk_engine.py call to get the graph.

Person 2 (Neo4j Data Engineer):
Requirement: Must supply valid Neo4j connection parameters (NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD) in .env.
Requirement: Must ensure neo4j_loader.py returns an initialized networkx.MultiDiGraph with matching node/edge schemas.

Person 1 (Extraction / Data Pipeline)
Requirement: If DATA_SOURCE="json", must provide the exact schema and file path for the extracted ground truth file (ground_truth_case.json or equivalent batch export).
"""

from pathlib import Path

import networkx as nx

from app.services.json_loader import load_from_json_file

# Direct package import matching your folder layout
try:
    from scripts.mock_graph import build_mock_graph
except ImportError:
    try:
        from backend.scripts.mock_graph import build_mock_graph
    except ImportError:

        def build_mock_graph():
            import networkx as nx

            return nx.MultiDiGraph()


# Optional Neo4j loader guard (prevents crash if neo4j_loader.py is not created yet)
try:
    from app.services.neo4j_loader import load_from_neo4j
except ImportError:
    load_from_neo4j = None

DATA_SOURCE = "mock"  # "mock" | "json" | "neo4j"

JSON_DATA_PATH = str(
    Path(__file__).resolve().parent.parent.parent
    / "sample_data"
    / "ground_truth_case.json"
)


def load_graph() -> nx.MultiDiGraph:
    if DATA_SOURCE == "neo4j":
        if load_from_neo4j is None:
            raise NotImplementedError(
                "neo4j_loader.py is not yet implemented or imported."
            )
        return load_from_neo4j()
    if DATA_SOURCE == "json":
        return load_from_json_file(JSON_DATA_PATH)
    return build_mock_graph()
