"""
Generate synthetic Pakistani banking transaction dataset for Z-Shield AI demo.
420 normal transactions + 80 bot attack transactions = 500 total.
Context: Raast, Easypaisa, JazzCash, JS Bank — PKR amounts, Pakistani cities.
"""
import json
import random
import os
from datetime import datetime, timedelta

PAKISTANI_CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"]
TRANSACTION_TYPES = ["Raast Transfer", "Easypaisa", "JazzCash", "IBFT", "Card Payment", "Mobile Top-up", "Utility Bill"]
RECIPIENT_BANKS = ["HBL", "MCB", "UBL", "Meezan Bank", "Allied Bank", "Bank Alfalah", "Easypaisa", "JazzCash"]

def make_account(n): return f"PK-ACC{str(n).zfill(4)}"
def make_recipient(n): return f"PK-REC{str(n).zfill(4)}"


def generate_normal_transaction(base_time: datetime, account_id: str) -> dict:
    city = random.choice(PAKISTANI_CITIES)
    return {
        "account_id": account_id,
        "amount": round(random.uniform(500, 150000), 2),
        "transaction_type": random.choice(TRANSACTION_TYPES),
        "recipient_bank": random.choice(RECIPIENT_BANKS),
        "sender_city": city,
        "recipient_city": random.choice(PAKISTANI_CITIES),
        "timestamp": (base_time + timedelta(seconds=random.randint(60, 600))).isoformat(),
        "tx_count_last_5s": random.randint(0, 2),
        "time_delta_ms": random.uniform(60000, 900000),
        "hour_of_day": random.randint(8, 22),
        "unique_recipients_last_10tx": random.randint(3, 10),
        "recipient_id": make_recipient(random.randint(100, 999)),
        "is_new_device": False,
        "location_change": False,
        "label": "normal"
    }


def generate_attack_transaction(base_time: datetime, account_id: str, burst_index: int) -> dict:
    return {
        "account_id": account_id,
        "amount": round(random.uniform(4900, 5100), 2),
        "transaction_type": "Raast Transfer",
        "recipient_bank": "Easypaisa",
        "sender_city": "Karachi",
        "recipient_city": "Lahore",
        "timestamp": (base_time + timedelta(milliseconds=burst_index * 80)).isoformat(),
        "tx_count_last_5s": random.randint(15, 25),
        "time_delta_ms": random.uniform(50, 200),
        "hour_of_day": random.randint(0, 5),
        "unique_recipients_last_10tx": 1,
        "recipient_id": make_recipient(666),
        "is_new_device": True,
        "location_change": True,
        "label": "attack"
    }


def generate_dataset():
    transactions = []
    base_time = datetime.now() - timedelta(hours=24)
    accounts = [make_account(i) for i in range(1, 51)]
    attack_accounts = [make_account(i) for i in range(51, 56)]

    for i in range(420):
        account = random.choice(accounts)
        tx = generate_normal_transaction(base_time + timedelta(minutes=i * 3), account)
        transactions.append(tx)

    for burst in range(4):
        attack_account = random.choice(attack_accounts)
        burst_time = base_time + timedelta(hours=random.randint(1, 20))
        for i in range(20):
            tx = generate_attack_transaction(burst_time, attack_account, i)
            transactions.append(tx)

    random.shuffle(transactions)

    output_path = os.path.join(os.path.dirname(__file__), "transactions.json")
    with open(output_path, "w") as f:
        json.dump(transactions, f, indent=2)

    normal = sum(1 for t in transactions if t["label"] == "normal")
    attack = sum(1 for t in transactions if t["label"] == "attack")
    print(f"Generated {len(transactions)} transactions -> {output_path}")
    print(f"  Normal: {normal}, Attack: {attack}")
    print(f"  Types: Raast Transfer, Easypaisa, JazzCash, IBFT, Card Payment")
    print(f"  Cities: {', '.join(PAKISTANI_CITIES[:4])}...")


if __name__ == "__main__":
    generate_dataset()
