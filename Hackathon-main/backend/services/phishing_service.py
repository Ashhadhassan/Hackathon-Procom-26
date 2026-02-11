"""
NLP Phishing Shield: Uses Groq API (Llama 3) to analyze messages for fraud markers.
Falls back to rule-based detection if Groq API key is not set.
"""
import os
import json
import re
from typing import Optional

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

SYSTEM_PROMPT = """You are a cybersecurity AI for JS Bank (Zindigi) analyzing messages for phishing and fraud.
Analyze the given text and return ONLY a valid JSON response (no markdown, no extra text) with these exact fields:
{
  "is_phishing": boolean,
  "confidence": float between 0.0 and 1.0,
  "risk_label": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "markers": ["list", "of", "detected", "fraud", "patterns"],
  "explanation": "1-2 sentences explaining why this is or is not phishing",
  "recommendation": "What the user should do"
}

Look for these fraud patterns:
- Manufactured urgency ("immediately", "within 24 hours", "suspended")
- Financial threats ("lose your funds", "account blocked", "penalty")
- Impersonation of banks/officials
- Requests for OTP, PIN, password, or card details
- Suspicious links or unusual URLs
- AI-generated text patterns (unnatural phrasing, excessive formality)
- Emotional manipulation and pressure tactics
- Grammar/spelling designed to bypass filters"""


def _rule_based_analysis(text: str) -> dict:
    """Fallback rule-based phishing detection when Groq is unavailable."""
    text_lower = text.lower()

    urgency_words = ["immediately", "urgent", "suspended", "blocked", "expire", "24 hours", "right now", "asap"]
    threat_words = ["lose", "penalty", "forfeit", "close", "terminated", "legal action"]
    request_words = ["otp", "pin", "password", "card number", "cvv", "account number", "verify your", "confirm your"]
    bank_impersonation = ["js bank", "zindigi", "hbl", "meezan", "ubl", "state bank", "sbp"]

    markers = []
    score = 0.0

    for word in urgency_words:
        if word in text_lower:
            markers.append(f"manufactured urgency ('{word}')")
            score += 0.15

    for word in threat_words:
        if word in text_lower:
            markers.append(f"financial threat language ('{word}')")
            score += 0.15

    for word in request_words:
        if word in text_lower:
            markers.append(f"sensitive data request ('{word}')")
            score += 0.2

    for word in bank_impersonation:
        if word in text_lower:
            markers.append(f"potential bank impersonation ('{word}')")
            score += 0.1

    if re.search(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+])+', text):
        markers.append("suspicious URL detected")
        score += 0.15

    confidence = min(1.0, score)
    is_phishing = confidence >= 0.3
    markers = list(set(markers))[:5]

    if confidence >= 0.7:
        risk_label = "CRITICAL"
    elif confidence >= 0.5:
        risk_label = "HIGH"
    elif confidence >= 0.3:
        risk_label = "MEDIUM"
    else:
        risk_label = "LOW"

    return {
        "is_phishing": is_phishing,
        "confidence": round(confidence, 2),
        "risk_label": risk_label,
        "markers": markers if markers else ["No obvious fraud patterns detected"],
        "explanation": (
            f"Rule-based analysis detected {len(markers)} fraud indicators in this message. "
            f"Pattern matching identified {risk_label.lower()} risk level."
            if is_phishing else
            "No significant phishing patterns detected in this message."
        ),
        "recommendation": (
            "Do NOT click any links or share personal details. Contact JS Bank directly at 021-111-747-747."
            if is_phishing else
            "Message appears safe, but always verify directly with your bank if uncertain."
        )
    }


def analyze_text(text: str) -> dict:
    """Analyze text for phishing using Groq API (with rule-based fallback)."""
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key or not GROQ_AVAILABLE:
        return _rule_based_analysis(text)

    try:
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this message for phishing:\n\n{text}"}
            ],
            temperature=0.1,
            max_tokens=500,
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown code blocks if present
        if raw.startswith("```"):
            raw = re.sub(r"```[a-z]*\n?", "", raw).strip()

        result = json.loads(raw)

        # Validate required fields
        required = ["is_phishing", "confidence", "risk_label", "markers", "explanation", "recommendation"]
        for field in required:
            if field not in result:
                raise ValueError(f"Missing field: {field}")

        return result

    except Exception as e:
        print(f"[PhishingService] Groq API error: {e}, falling back to rule-based.")
        return _rule_based_analysis(text)
