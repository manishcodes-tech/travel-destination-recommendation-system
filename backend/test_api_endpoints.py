import requests

cities = ['agra', 'manali', 'dubai', 'sydney']
all_ok = True

for city in cities:
    r = requests.get(f'http://127.0.0.1:8000/api/destinations/{city}')
    if r.status_code == 200:
        d = r.json()
        stays = len(d.get('stays', []))
        acts = len(d.get('activities', []))
        food = len(d.get('food', []))
        reach = len(d.get('howToReach', []))
        local = len(d.get('localTransport', []))
        img = d.get('image', '')
        print(f"[{city.upper()}] HTTP 200 - image: {img[:50]}... | stays: {stays} | acts: {acts} | food: {food} | howToReach: {reach} | localTransport: {local}")
        if not (stays > 0 and acts > 0 and food > 0 and reach > 0 and local > 0 and img):
            all_ok = False
            print(f"  WARNING: missing items in {city}")
    else:
        all_ok = False
        print(f"[{city.upper()}] Error: {r.status_code}")

print(f"\nOverall Endpoint Health: {'ALL PASSED' if all_ok else 'FAILURES DETECTED'}")
