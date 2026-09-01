"""
backend/app/main.py
Central FastAPI gateway entry point.
Exposes REST endpoints for Jayanta's React/Cytoscape UI and orchestrates
the lifecycle of backend services.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import agent_routes, entity_routes, graph_routes, ingest_routes
from app.database.neo4j_driver import db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manages database connection lifecycle and graceful shutdowns."""
    # Attempt connection check to Neo4j on startup
    if db.verify_connectivity():
        print("[Startup] Connected to Neo4j database successfully.")
    else:
        print(
            "[Startup] Running in decoupled/offline mode (Fallback to in-memory graph loader)."
        )

    yield

    # Cleanly teardown driver connection pool on shutdown
    db.close()
    print("[Shutdown] Closed database connection pools.")


app = FastAPI(
    title="Crime Network Graph Intelligence API",
    description="Backend services for criminal network analysis, explainable risk scoring, and agentic investigation.",
    version="1.0.0",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Jayanta's Vite/React dev server
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 1. GET  /api/graph              -> Cytoscape.js Canvas (Nodes, Edges, Clusters, Risk)
# 2. GET  /api/entity/{id}         -> Suspect Intelligence Card & Risk Factor Breakdown
# 3. GET  /api/entity/{id}/evidence-> Slide-out Legal Evidence Drawer
# 4. POST /api/agent/query         -> LangGraph Multi-Agent Investigation Runner
# 5. POST /api/ingest              -> Payload Batch Ingestion
app.include_router(graph_routes.router)
app.include_router(entity_routes.router)
app.include_router(agent_routes.router)
app.include_router(ingest_routes.router)


@app.get("/api/health", tags=["Health Check"])
def health_check() -> dict[str, str]:
    """Health check endpoint to verify backend service availability."""
    return {"status": "healthy", "service": "Crime Network Graph API"}
