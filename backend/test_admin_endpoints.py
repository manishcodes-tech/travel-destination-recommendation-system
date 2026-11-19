import requests

base = "http://127.0.0.1:8000/api"

# Test public and admin listings
endpoints = [
    ("/destinations", "Destinations"),
    ("/admin/stats", "Admin Stats"),
    ("/stays", "Stays"),
    ("/activities", "Activities"),
]

for ep, label in endpoints:
    try:
        r = requests.get(f"{base}{ep}", timeout=5)
        print(f"[{label}] {ep} -> Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, list):
                print(f"    Count: {len(data)}")
            elif isinstance(data, dict):
                print(f"    Keys: {list(data.keys())}")
    except Exception as e:
        print(f"[{label}] {ep} -> Error: {e}")
