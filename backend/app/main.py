from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import agent_routes, entity_routes, graph_routes, ingest_routes
from app.database.neo4j_driver import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not db.verify_connectivity():
        print("[Warning] Neo4j instance is not reachable at startup.")
    else:
        print("[Startup] Connected to Neo4j database successfully.")
    yield
    db.close()
    print("[Shutdown] Neo4j connection pool closed.")


app = FastAPI(
    title="Crime Network Graph Intelligence API",
    description="Backend services for crime pattern detection, evidence auditing, and graph visualization.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include sub-routers
app.include_router(graph_routes.router)
app.include_router(entity_routes.router)
app.include_router(agent_routes.router)
app.include_router(ingest_routes.router)
