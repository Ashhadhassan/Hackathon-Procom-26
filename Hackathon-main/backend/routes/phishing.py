from fastapi import APIRouter
from models.schemas import AnalyzeTextRequest, PhishingAnalysisResponse
from services.phishing_service import analyze_text

router = APIRouter()


@router.post("/analyze-text", response_model=PhishingAnalysisResponse)
async def analyze_text_endpoint(request: AnalyzeTextRequest):
    """Analyze a message for phishing using Groq LLM (with rule-based fallback)."""
    result = analyze_text(request.text)
    return PhishingAnalysisResponse(**result)
