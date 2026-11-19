import requests

base = "http://127.0.0.1:8000/api"

# Login as admin
login_resp = requests.post(f"{base}/auth/login", json={
    "email": "admin@travelmate.com",
    "password": "admin123"
})

print(f"Login status: {login_resp.status_code}")
if login_resp.status_code == 200:
    token = login_resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check stats
    stats_resp = requests.get(f"{base}/admin/stats", headers=headers)
    print("Admin stats keys:", list(stats_resp.json().keys()) if stats_resp.status_code == 200 else stats_resp.status_code)
    
    # Check admin stays
    stays_resp = requests.get(f"{base}/admin/stays", headers=headers)
    print(f"Admin stays: count={len(stays_resp.json()) if stays_resp.status_code == 200 else stays_resp.status_code}")
    
    # Check admin activities
    act_resp = requests.get(f"{base}/admin/activities", headers=headers)
    print(f"Admin activities: count={len(act_resp.json()) if act_resp.status_code == 200 else act_resp.status_code}")
    
    # Check admin transport
    trans_resp = requests.get(f"{base}/admin/transport", headers=headers)
    print(f"Admin transport: count={len(trans_resp.json()) if trans_resp.status_code == 200 else trans_resp.status_code}")
    
    # Check admin rentals
    rent_resp = requests.get(f"{base}/admin/rentals", headers=headers)
    print(f"Admin rentals: count={len(rent_resp.json()) if rent_resp.status_code == 200 else rent_resp.status_code}")
    
    # Check admin food
    food_resp = requests.get(f"{base}/admin/food", headers=headers)
    print(f"Admin food: count={len(food_resp.json()) if food_resp.status_code == 200 else food_resp.status_code}")
else:
    print("Login error:", login_resp.text)
