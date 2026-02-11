from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Transaction(BaseModel):
    account_id: str
    amount: float
    timestamp: str
    tx_count_last_5s: int
    time_delta_ms: float
    hour_of_day: int
    unique_recipients_last_10tx: int
    recipient_id: str


class FlaggedTransaction(BaseModel):
    account_id: str
    amount: float
    timestamp: str
    risk_score: float
    reason: str
    status: str


class AnalyzeTransactionsRequest(BaseModel):
    transactions: List[Transaction]


class AnalyzeTransactionsResponse(BaseModel):
    flagged: List[FlaggedTransaction]
    total_analyzed: int
    total_flagged: int


class StreamStatusResponse(BaseModel):
    active_threats: int
    blocked_today: int
    transactions_per_second: float
    risk_level: str
    recent_alerts: List[FlaggedTransaction]
    threat_timeline: List[dict]
    total_processed: int = 0


class AnalyzeTextRequest(BaseModel):
    text: str


class PhishingAnalysisResponse(BaseModel):
    is_phishing: bool
    confidence: float
    risk_label: str
    markers: List[str]
    explanation: str
    recommendation: str


class SimulateAttackResponse(BaseModel):
    message: str
    injected_count: int
    flagged: List[FlaggedTransaction]
