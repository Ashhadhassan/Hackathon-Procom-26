from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.agent_guard import check_agent_message
from services.anomaly_engine import score_single_transaction
import os, json, re

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

router = APIRouter()

CHAT_SYSTEM_PROMPT = """You are Zindigi's AI banking assistant for JS Bank Pakistan. You are helpful, concise, and professional.
You help customers with: account balance inquiries, transaction history, Raast transfers, Easypaisa/JazzCash payments, card services, and general banking queries.
You NEVER ask for OTPs, PINs, passwords, or card numbers.
Keep responses under 3 sentences. Be conversational but professional.
Always mention that for sensitive transactions, OTP verification is required via the official Zindigi app."""

class ScoreTransactionRequest(BaseModel):
    account_id: str = "PK-ACC0042"
    amount: float = 5000.0
    transaction_type: str = "Raast Transfer"
    recipient_bank: str = "Easypaisa"
    sender_city: str = "Karachi"
    recipient_city: str = "Lahore"
    tx_count_last_5s: int = 1
    time_delta_ms: float = 120000.0
    hour_of_day: int = 14
    unique_recipients_last_10tx: int = 5
    is_new_device: bool = False
    location_change: bool = False


class AgentMessageRequest(BaseModel):
    message: str


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]


@router.post("/score-transaction")
async def score_transaction(request: ScoreTransactionRequest):
    """Score a single transaction using the Isolation Forest + XGBoost ensemble."""
    tx = request.model_dump()
    result = score_single_transaction(tx)
    return result


@router.post("/check-agent-message")
async def check_agent_message_endpoint(request: AgentMessageRequest):
    """Detect if a message is a prompt injection attack targeting the Zindigi AI agent."""
    result = check_agent_message(request.message)
    return result


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Groq-powered Zindigi banking chatbot."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or not GROQ_AVAILABLE:
        return {"reply": "I'm here to help with your Zindigi banking needs. For account queries, please verify via the Zindigi app or call 021-111-747-747."}
    try:
        client = Groq(api_key=api_key)
        messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
        for m in request.messages[-6:]:  # last 6 messages for context
            messages.append({"role": m.role, "content": m.content})
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=150,
        )
        return {"reply": response.choices[0].message.content.strip()}
    except Exception as e:
        print(f"[Chat] Groq error: {e}")
        return {"reply": "I'm having trouble connecting right now. Please try again or call 021-111-747-747."}
