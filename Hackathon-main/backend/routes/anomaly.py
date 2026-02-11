from fastapi import APIRouter
from models.schemas import (
    AnalyzeTransactionsRequest,
    AnalyzeTransactionsResponse,
    StreamStatusResponse,
    SimulateAttackResponse,
    FlaggedTransaction
)
from services.anomaly_engine import analyze_transactions, get_stream_status, inject_attack_burst
import random

router = APIRouter()


@router.post("/analyze-transactions", response_model=AnalyzeTransactionsResponse)
async def analyze_transactions_endpoint(request: AnalyzeTransactionsRequest):
    """Run Isolation Forest on a batch of transactions, return flagged ones."""
    transactions = [tx.model_dump() for tx in request.transactions]
    flagged = analyze_transactions(transactions)
    return AnalyzeTransactionsResponse(
        flagged=[FlaggedTransaction(**f) for f in flagged],
        total_analyzed=len(transactions),
        total_flagged=len(flagged)
    )


@router.get("/stream-status", response_model=StreamStatusResponse)
async def stream_status():
    """Return current live threat metrics for the dashboard (poll every 3s)."""
    tps = round(random.uniform(8, 45), 1)
    status = get_stream_status(tps=tps)
    return StreamStatusResponse(
        active_threats=status["active_threats"],
        blocked_today=status["blocked_today"],
        transactions_per_second=status["transactions_per_second"],
        risk_level=status["risk_level"],
        recent_alerts=[FlaggedTransaction(**a) for a in status["recent_alerts"]],
        threat_timeline=status["threat_timeline"],
        total_processed=status.get("total_processed", 0)
    )


@router.post("/simulate-attack", response_model=SimulateAttackResponse)
async def simulate_attack():
    """Inject a simulated bot attack burst for demo purposes."""
    flagged = inject_attack_burst()
    return SimulateAttackResponse(
        message="Bot attack simulation complete. 20 transactions injected.",
        injected_count=20,
        flagged=[FlaggedTransaction(**f) for f in flagged]
    )
