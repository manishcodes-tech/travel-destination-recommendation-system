import requests

base = "http://127.0.0.1:8000/api"

# Scenario 1: Agra, 2 Days / 1 Night, 2 travelers
req1 = {
    "budget": 20000,
    "destination": "Agra",
    "days": 2,
    "nights": 1,
    "travelers": 2,
    "duration": "2 Days / 1 Night",
    "interest": "Heritage & Culture"
}
res1 = requests.post(f"{base}/recommendations", json=req1)
print(f"Rec 1 (2D/1N) Status: {res1.status_code}")
if res1.status_code == 200:
    items = res1.json()
    print(f"Returned {len(items)} recommendations")
    if items:
        top = items[0]
        print(f"Top: {top.get('name')} | Duration: {top.get('duration')} | Cost: {top.get('estimatedCost')}")

# Scenario 2: Agra, 4 Days / 3 Nights, 2 travelers
req2 = {
    "budget": 20000,
    "destination": "Agra",
    "days": 4,
    "nights": 3,
    "travelers": 2,
    "duration": "4 Days / 3 Nights",
    "interest": "Heritage & Culture"
}
res2 = requests.post(f"{base}/recommendations", json=req2)
print(f"\nRec 2 (4D/3N) Status: {res2.status_code}")
if res2.status_code == 200:
    items = res2.json()
    print(f"Returned {len(items)} recommendations")
    if items:
        top = items[0]
        print(f"Top: {top.get('name')} | Duration: {top.get('duration')} | Cost: {top.get('estimatedCost')}")
