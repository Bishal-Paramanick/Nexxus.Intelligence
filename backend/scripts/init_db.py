import re
from pathlib import Path

from app.database.neo4j_driver import db

# Resolve SIH_2026 root folder (2 levels up from backend/scripts/init_db.py)
ROOT_DIR = Path(__file__).resolve().parents[2]
CYPHER_DIR = ROOT_DIR / "cypher"

SCHEMA_FILE = CYPHER_DIR / "schema.cypher"
SEED_FILE = CYPHER_DIR / "seed.cypher"


def clean_and_split_cypher(content: str) -> list[str]:
    """Strips all single-line and multi-line comments, then splits by semicolon."""
    # 1. Strip multi-line comments (/* ... */)
    cleaned = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
    # 2. Strip single-line comments (// ...)
    cleaned = re.sub(r"//.*$", "", cleaned, flags=re.MULTILINE)
    # 3. Split by semicolon and discard purely blank statements
    statements = [stmt.strip() for stmt in cleaned.split(";") if stmt.strip()]
    return statements


def execute_cypher_file(file_path: Path, step_name: str):
    if not file_path.exists():
        raise FileNotFoundError(f"Cypher file not found at: {file_path}")

    print(f"\n--- Applying {step_name} ({file_path.name}) ---")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    queries = clean_and_split_cypher(content)

    for idx, query in enumerate(queries, 1):
        try:
            db.query(query)
            print(f"[{idx}/{len(queries)}] Executed successfully.")
        except Exception as e:  # noqa: BLE001
            print(f"[!] Error on statement #{idx}:\n{query}\nDetails: {e}\n")


def init_database():
    print("=" * 50)
    print("Initializing Crime Network Graph Database...")
    print("=" * 50)

    execute_cypher_file(SCHEMA_FILE, "Schema Constraints & Indexes")
    execute_cypher_file(SEED_FILE, "Seed Dataset & Relationships")

    # Audit node and relationship counts
    node_res = db.query("MATCH (n) RETURN count(n) AS count")
    rel_res = db.query("MATCH ()-[r]->() RETURN count(r) AS count")

    nodes_count = node_res[0]["count"] if node_res else 0
    rels_count = rel_res[0]["count"] if rel_res else 0

    print("\n" + "=" * 50)
    print(f"Status: {nodes_count} Nodes | {rels_count} Relationships Loaded")
    print("=" * 50)


if __name__ == "__main__":
    init_database()
