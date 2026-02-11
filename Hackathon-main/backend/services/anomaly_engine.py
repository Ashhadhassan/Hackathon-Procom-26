"""
Bot-Killer: Ensemble anomaly detection engine.
Isolation Forest (unsupervised) + XGBoost (supervised) voting together.
Trained on synthetic Pakistani banking data (Raast, Easypaisa, JazzCash).
"""
import json
import os
import random
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
from typing import List

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

# Global state
_iso_model: IsolationForest = None
_xgb_model = None
_blocked_today: int = 127   # realistic baseline — resets to 127 on startup
_threat_timeline: List[dict] = []
_recent_alerts: List[dict] = []
_total_processed: int = 0

TX_TYPES = ["Raast Transfer", "Easypaisa", "JazzCash", "IBFT", "Card Payment", "Mobile Top-up", "Utility Bill"]
_tx_encoder = LabelEncoder().fit(TX_TYPES)


def _extract_features(transactions: List[dict]) -> np.ndarray:
    """Extract ML features. Returns 7-feature array per transaction."""
    features = []
    for tx in transactions:
        tx_type = tx.get("transaction_type", "Raast Transfer")
        try:
            tx_type_encoded = _tx_encoder.transform([tx_type])[0]
        except Exception:
            tx_type_encoded = 0

        features.append([
            tx.get("tx_count_last_5s", 0),
            tx.get("time_delta_ms", 100000),
            tx.get("hour_of_day", 12),
            tx.get("unique_recipients_last_10tx", 5),
            tx.get("amount", 1000),
            int(tx.get("is_new_device", False)),
            int(tx.get("location_change", False)),
        ])
    return np.array(features, dtype=float)


def _get_attack_type(tx: dict) -> str:
    """Classify the type of attack pattern detected."""
    if tx.get("tx_count_last_5s", 0) >= 15 and tx.get("unique_recipients_last_10tx", 5) <= 1:
        return "Agentic Bot Drain"
    if tx.get("is_new_device") and tx.get("location_change"):
        return "Account Takeover"
    if tx.get("amount", 0) < 1000 and tx.get("tx_count_last_5s", 0) >= 5:
        return "Card Testing (Micro-TX)"
    if tx.get("hour_of_day", 12) in range(0, 5) and tx.get("amount", 0) > 50000:
        return "Late-Night High-Value Fraud"
    return "Behavioral Anomaly"


def _get_reason(tx: dict) -> str:
    """Generate human-readable explanation for the block."""
    reasons = []
    if tx.get("tx_count_last_5s", 0) >= 10:
        reasons.append(f"High-velocity burst ({tx['tx_count_last_5s']} Raast transfers in 5s)")
    if tx.get("time_delta_ms", 100000) < 300:
        reasons.append(f"Non-human rhythm ({tx['time_delta_ms']:.0f}ms between transfers)")
    if tx.get("unique_recipients_last_10tx", 5) <= 1:
        reasons.append("Single-target drain pattern")
    if tx.get("is_new_device"):
        reasons.append("Unrecognized device")
    if tx.get("location_change"):
        reasons.append(f"Sudden city change ({tx.get('sender_city','?')} → {tx.get('recipient_city','?')})")
    if tx.get("hour_of_day", 12) in range(0, 5):
        reasons.append(f"Unusual hour ({tx['hour_of_day']}:00 AM)")
    if not reasons:
        reasons.append("Statistical anomaly detected by ensemble model")
    return "; ".join(reasons[:2])


def load_and_train():
    """Load Pakistani banking dataset and train Isolation Forest + XGBoost ensemble."""
    global _iso_model, _xgb_model

    data_path = os.path.join(os.path.dirname(__file__), "../data/transactions.json")

    if not os.path.exists(data_path):
        import subprocess, sys
        gen_path = os.path.join(os.path.dirname(__file__), "../data/generate_mock_data.py")
        subprocess.run([sys.executable, gen_path])

    with open(data_path) as f:
        transactions = json.load(f)

    X = _extract_features(transactions)
    y = np.array([0 if t.get("label") == "normal" else 1 for t in transactions])

    # Train Isolation Forest (unsupervised)
    _iso_model = IsolationForest(contamination=0.15, n_estimators=100, random_state=42)
    _iso_model.fit(X)

    # Train XGBoost (supervised, uses labels)
    if XGBOOST_AVAILABLE:
        _xgb_model = XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            scale_pos_weight=5,  # handle class imbalance (80 attack vs 420 normal)
            random_state=42,
            eval_metric='logloss',
            verbosity=0
        )
        _xgb_model.fit(X, y)
        print(f"[AnomalyEngine] Ensemble trained: Isolation Forest + XGBoost on {len(transactions)} transactions.")
    else:
        print(f"[AnomalyEngine] Isolation Forest trained on {len(transactions)} transactions. (XGBoost not available)")


def _get_feature_importance(tx: dict) -> list:
    """Return which features are suspicious, scored 0-1, for UI display."""
    features = []

    # TX velocity — bots burst 10-20 tx/5s, humans do 1
    tx_vel = min(1.0, tx.get("tx_count_last_5s", 0) / 20.0)
    features.append({"label": "TX Velocity", "score": round(tx_vel, 3), "value": f"{tx.get('tx_count_last_5s',0)} tx/5s"})

    # Time delta — bots <500ms, humans >60s
    delta_ms = tx.get("time_delta_ms", 100000)
    delta_risk = round(max(0.0, 1.0 - min(delta_ms, 60000) / 60000), 3)
    features.append({"label": "Inter-TX Speed", "score": delta_risk, "value": f"{delta_ms:.0f}ms"})

    # Recipient diversity — bots drain 1 recipient
    recip = tx.get("unique_recipients_last_10tx", 5)
    recip_risk = round(max(0.0, 1.0 - min(recip, 5) / 5.0), 3)
    features.append({"label": "Recipient Diversity", "score": recip_risk, "value": f"{recip} unique"})

    # Unusual hour — 0-5 AM is high risk
    hour = tx.get("hour_of_day", 12)
    hour_risk = round(0.8 if hour < 5 else (0.3 if hour < 8 or hour > 22 else 0.0), 3)
    features.append({"label": "Hour of Day", "score": hour_risk, "value": f"{hour:02d}:00"})

    # Amount — large amounts at unusual times
    amount = tx.get("amount", 1000)
    amount_risk = round(min(1.0, amount / 200000), 3)
    features.append({"label": "Amount", "score": amount_risk, "value": f"PKR {amount:,.0f}"})

    # Device / location signals
    device_risk = round((0.5 if tx.get("is_new_device") else 0.0) + (0.5 if tx.get("location_change") else 0.0), 3)
    features.append({"label": "Device / Location", "score": device_risk, "value": ("New device" if tx.get("is_new_device") else "") + (" + City change" if tx.get("location_change") else "") or "Normal"})

    return sorted(features, key=lambda x: x["score"], reverse=True)


def score_single_transaction(tx: dict) -> dict:
    """Score a single transaction and return detailed result. Used by /api/score-transaction."""
    if _iso_model is None:
        load_and_train()

    X = _extract_features([tx])

    # Isolation Forest score
    iso_score = _iso_model.decision_function(X)[0]
    iso_pred = _iso_model.predict(X)[0]  # -1 = anomaly
    iso_risk = min(1.0, max(0.0, 1.0 - (iso_score + 0.5)))

    # Rule-based override: hard signals that always indicate fraud regardless of IF score
    rule_score = 0.0
    if tx.get("tx_count_last_5s", 0) >= 10:
        rule_score = max(rule_score, 0.85)  # bot burst
    if tx.get("time_delta_ms", 100000) < 200:
        rule_score = max(rule_score, 0.80)  # sub-200ms = non-human
    if tx.get("is_new_device") and tx.get("location_change") and tx.get("amount", 0) > 30000:
        rule_score = max(rule_score, 0.75)  # ATO pattern
    if tx.get("tx_count_last_5s", 0) >= 5 and tx.get("unique_recipients_last_10tx", 5) <= 1:
        rule_score = max(rule_score, 0.78)  # drain pattern
    # Blend rule score with IF (rules dominate when strong signal)
    if rule_score > 0:
        iso_risk = max(iso_risk, rule_score)

    # XGBoost score
    xgb_risk = 0.0
    if XGBOOST_AVAILABLE and _xgb_model is not None:
        xgb_prob = _xgb_model.predict_proba(X)[0][1]
        xgb_risk = float(xgb_prob)

    # Ensemble: weighted average (XGBoost more reliable when available)
    if XGBOOST_AVAILABLE and _xgb_model is not None:
        final_risk = round(0.4 * iso_risk + 0.6 * xgb_risk, 3)
    else:
        final_risk = round(iso_risk, 3)

    is_fraud = bool(final_risk > 0.5)
    final_risk = float(final_risk)
    iso_risk = float(iso_risk)
    xgb_risk = float(xgb_risk)

    if final_risk >= 0.8:
        risk_label = "CRITICAL"
    elif final_risk >= 0.6:
        risk_label = "HIGH"
    elif final_risk >= 0.35:
        risk_label = "MEDIUM"
    else:
        risk_label = "LOW"

    return {
        "account_id": tx.get("account_id", "UNKNOWN"),
        "amount": tx.get("amount", 0),
        "transaction_type": tx.get("transaction_type", "Unknown"),
        "is_fraud": is_fraud,
        "fraud_probability": round(final_risk, 3),
        "risk_label": risk_label,
        "attack_type": _get_attack_type(tx) if is_fraud else None,
        "reason": _get_reason(tx) if is_fraud else "Transaction profile within normal parameters",
        "recommendation": (
            "BLOCK — Refer to fraud team immediately" if final_risk >= 0.8 else
            "FLAG — Require additional OTP verification" if final_risk >= 0.6 else
            "MONITOR — Track next 5 transactions" if final_risk >= 0.35 else
            "APPROVE — Transaction appears legitimate"
        ),
        "model_breakdown": {
            "isolation_forest": round(iso_risk, 3),
            "xgboost": round(xgb_risk, 3) if XGBOOST_AVAILABLE else None,
            "ensemble": round(final_risk, 3)
        },
        "feature_importance": _get_feature_importance(tx)
    }


def tick_live_traffic():
    """Called every ~8s by background task. Drips 3-8 normal transactions with occasional low-risk flag."""
    global _total_processed, _threat_timeline

    ACCOUNTS = [f"PK-ACC{str(i).zfill(4)}" for i in range(1, 50)]
    CITIES = ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan"]
    TX_TYPES_NORMAL = ["Raast Transfer", "Easypaisa", "JazzCash", "IBFT", "Card Payment"]

    count = random.randint(3, 8)
    batch = []
    for _ in range(count):
        is_slightly_odd = random.random() < 0.12  # 12% chance of borderline tx
        batch.append({
            "account_id": random.choice(ACCOUNTS),
            "amount": round(random.uniform(500, 45000), 2),
            "transaction_type": random.choice(TX_TYPES_NORMAL),
            "recipient_bank": random.choice(["HBL", "MCB", "UBL", "Meezan Bank", "JS Bank"]),
            "sender_city": random.choice(CITIES),
            "recipient_city": random.choice(CITIES),
            "timestamp": datetime.now().isoformat(),
            "tx_count_last_5s": random.randint(3, 7) if is_slightly_odd else random.randint(1, 2),
            "time_delta_ms": random.uniform(800, 3000) if is_slightly_odd else random.uniform(20000, 120000),
            "hour_of_day": datetime.now().hour,
            "unique_recipients_last_10tx": random.randint(2, 4) if is_slightly_odd else random.randint(4, 9),
            "is_new_device": False,
            "location_change": False,
        })

    _total_processed += count
    return analyze_transactions(batch)


def analyze_transactions(transactions: List[dict]) -> List[dict]:
    """Score a batch of transactions, return flagged ones. Used by stream simulation."""
    global _blocked_today, _recent_alerts, _threat_timeline

    if _iso_model is None:
        load_and_train()

    flagged = []
    for tx in transactions:
        result = score_single_transaction(tx)
        if result["is_fraud"]:
            flagged_tx = {
                "account_id": result["account_id"],
                "amount": result["amount"],
                "timestamp": tx.get("timestamp", datetime.now().isoformat()),
                "risk_score": result["fraud_probability"],
                "reason": result["reason"],
                "status": "BLOCKED" if result["fraud_probability"] > 0.75 else "FLAGGED",
                "attack_type": result["attack_type"],
            }
            flagged.append(flagged_tx)
            _blocked_today += 1
            _recent_alerts.insert(0, flagged_tx)
            _recent_alerts = _recent_alerts[:10]

    _threat_timeline.append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "threats": len(flagged),
        "total": len(transactions)
    })
    _threat_timeline = _threat_timeline[-20:]

    return flagged


def get_stream_status(tps: float = None) -> dict:
    if tps is None:
        # TPS drifts based on recent alert volume — more alerts = higher apparent load
        base = 18 + len(_recent_alerts) * 2
        tps = round(random.uniform(max(8, base - 5), min(80, base + 15)), 1)

    active = len([a for a in _recent_alerts if a.get("status") == "BLOCKED"])
    risk_level = "CRITICAL" if active >= 5 else "HIGH" if active >= 3 else "MEDIUM" if active >= 1 else "LOW"

    return {
        "active_threats": active,
        "blocked_today": _blocked_today,
        "transactions_per_second": tps,
        "risk_level": risk_level,
        "recent_alerts": _recent_alerts[:5],
        "threat_timeline": _threat_timeline,
        "total_processed": _total_processed
    }


def inject_attack_burst() -> List[dict]:
    """Inject a Pakistani bot attack burst for demo."""
    attack_account = f"PK-ACC{random.randint(100, 999)}"
    burst_transactions = []
    now = datetime.now()

    for i in range(20):
        burst_transactions.append({
            "account_id": attack_account,
            "amount": round(random.uniform(4900, 5100), 2),
            "transaction_type": "Raast Transfer",
            "recipient_bank": "Easypaisa",
            "sender_city": "Karachi",
            "recipient_city": "Lahore",
            "timestamp": now.isoformat(),
            "tx_count_last_5s": 20,
            "time_delta_ms": random.uniform(50, 150),
            "hour_of_day": 3,
            "unique_recipients_last_10tx": 1,
            "recipient_id": "PK-REC0666",
            "is_new_device": True,
            "location_change": True,
        })

    return analyze_transactions(burst_transactions)
