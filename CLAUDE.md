# Z-Shield AI — Project Reference

## Quick Start

```bash
# Backend (run first)
cd backend
pip install -r requirements.txt
python data/generate_mock_data.py
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

## Project Structure
```
d:\Hackathon\
├── backend/
│   ├── main.py                     # FastAPI app entry + CORS + lifespan
│   ├── routes/
│   │   ├── anomaly.py              # GET /api/stream-status, POST /api/analyze-transactions, POST /api/simulate-attack
│   │   └── phishing.py             # POST /api/analyze-text
│   ├── services/
│   │   ├── anomaly_engine.py       # Isolation Forest + explainability
│   │   └── phishing_service.py     # Groq API (Llama 3) + rule-based fallback
│   ├── models/schemas.py           # Pydantic request/response models
│   ├── data/
│   │   ├── generate_mock_data.py   # Generates transactions.json (run once)
│   │   └── transactions.json       # 500 synthetic transactions (420 normal + 80 attack)
│   ├── requirements.txt
│   └── .env.example                # Copy to .env and add GROQ_API_KEY
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CommandCenter.tsx   # Route: /  — Admin dashboard
│   │   │   └── PhishingCheck.tsx   # Route: /verify — Message analyzer
│   │   ├── components/
│   │   │   ├── Layout/             # Sidebar.tsx, Header.tsx
│   │   │   ├── Dashboard/          # StatsCards, TransactionStream, ThreatChart, AlertPanel
│   │   │   └── PhishingShield/     # MessageAnalyzer.tsx, AnalysisResult.tsx
│   │   ├── hooks/
│   │   │   └── useStreamStatus.ts  # Polls /api/stream-status every 3s
│   │   └── lib/api.ts              # All API calls (axios)
│   └── vite.config.ts              # Proxy: /api -> localhost:8000
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/stream-status | Dashboard metrics (poll every 3s) |
| POST | /api/simulate-attack | Injects 20 bot transactions for demo |
| POST | /api/analyze-text | Phishing check via Groq LLM |
| POST | /api/analyze-transactions | Batch transaction scoring |

## Environment
- Backend: Python 3.10+, FastAPI, uvicorn port 8000
- Frontend: Node 18+, Vite port 5173
- Groq API: Free tier, set GROQ_API_KEY in backend/.env
  - Get key at: https://console.groq.com
  - Model: llama-3.3-70b-versatile (or llama3-8b-8192 for speed)
  - Falls back to rule-based NLP if key not set

## Design System
- Colors: CSS vars in src/index.css (--accent-cyan, --accent-red, --accent-green, --accent-yellow)
- Font: Syne (headings) + Space Mono (data/code)
- Theme: Dark cyberpunk / enterprise SOC terminal aesthetic
- Animations: Framer Motion for page transitions, threat-pulse CSS for alerts

## Key Patterns
- Frontend polls backend every 3s (useStreamStatus hook)
- "Simulate Attack" → POST /api/simulate-attack → 20 bot transactions → Isolation Forest flags them → alerts appear live
- Phishing check is async; shows loading spinner during Groq API call
- Groq fallback: if GROQ_API_KEY not set, uses keyword-based rule engine
