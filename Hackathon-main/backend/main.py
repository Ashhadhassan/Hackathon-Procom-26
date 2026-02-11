from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import asyncio

load_dotenv()

from routes.anomaly import router as anomaly_router
from routes.phishing import router as phishing_router
from routes.agent import router as agent_router
from services.anomaly_engine import load_and_train, tick_live_traffic


async def _live_traffic_loop():
    """Background task: drip normal transactions every 8s to keep dashboard alive."""
    await asyncio.sleep(5)  # wait for startup to finish
    while True:
        try:
            tick_live_traffic()
        except Exception as e:
            print(f"[LiveTraffic] tick error: {e}")
        await asyncio.sleep(8)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Z-Shield] Loading anomaly detection model...")
    load_and_train()
    print("[Z-Shield] System online.")
    task = asyncio.create_task(_live_traffic_loop())
    yield
    task.cancel()
    print("[Z-Shield] Shutting down.")


app = FastAPI(
    title="Z-Shield AI",
    description="Defensive AI layer for the Zindigi ecosystem — Bot detection & phishing analysis",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(anomaly_router, prefix="/api", tags=["Anomaly Detection"])
app.include_router(phishing_router, prefix="/api", tags=["Phishing Shield"])
app.include_router(agent_router, prefix="/api", tags=["Agentic Attack Interceptor"])


@app.get("/")
async def root():
    return {
        "system": "Z-Shield AI",
        "status": "online",
        "version": "1.0.0",
        "modules": ["Bot-Killer (Anomaly Engine)", "NLP Phishing Shield", "Z-Command Center"]
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
