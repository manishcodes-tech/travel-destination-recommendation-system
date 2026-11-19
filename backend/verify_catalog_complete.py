import sqlite3
import json

db_path = "backend/travelmate.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Check destinations
dest_count = cur.execute("SELECT COUNT(*) FROM destinations").fetchone()[0]
dest_empty_imgs = cur.execute("SELECT COUNT(*) FROM destinations WHERE image IS NULL OR trim(image) = ''").fetchone()[0]
print(f"Destinations: {dest_count} total, {dest_empty_imgs} empty image")

# Check stays
stays_count = cur.execute("SELECT COUNT(*) FROM stays").fetchone()[0]
stays_empty_imgs = cur.execute("SELECT COUNT(*) FROM stays WHERE image IS NULL OR trim(image) = ''").fetchone()[0]
stays_distinct_imgs = cur.execute("SELECT COUNT(DISTINCT image) FROM stays").fetchone()[0]
print(f"Stays: {stays_count} total, {stays_empty_imgs} empty image, {stays_distinct_imgs} distinct images")

# Check transport_options
trans_count = cur.execute("SELECT COUNT(*) FROM transport_options").fetchone()[0]
trans_empty_imgs = cur.execute("SELECT COUNT(*) FROM transport_options WHERE image IS NULL OR trim(image) = ''").fetchone()[0]
trans_distinct_imgs = cur.execute("SELECT COUNT(DISTINCT image) FROM transport_options").fetchone()[0]
print(f"Transport Options: {trans_count} total, {trans_empty_imgs} empty image, {trans_distinct_imgs} distinct images")

# Check vehicle_rentals
rent_count = cur.execute("SELECT COUNT(*) FROM vehicle_rentals").fetchone()[0]
rent_empty_imgs = cur.execute("SELECT COUNT(*) FROM vehicle_rentals WHERE image IS NULL OR trim(image) = ''").fetchone()[0]
rent_distinct_imgs = cur.execute("SELECT COUNT(DISTINCT image) FROM vehicle_rentals").fetchone()[0]
print(f"Vehicle Rentals: {rent_count} total, {rent_empty_imgs} empty image, {rent_distinct_imgs} distinct images")

# Check activities
act_count = cur.execute("SELECT COUNT(*) FROM activities").fetchone()[0]
act_empty_imgs = cur.execute("SELECT COUNT(*) FROM activities WHERE image IS NULL OR trim(image) = ''").fetchone()[0]
act_distinct_imgs = cur.execute("SELECT COUNT(DISTINCT image) FROM activities").fetchone()[0]
print(f"Activities: {act_count} total, {act_empty_imgs} empty image, {act_distinct_imgs} distinct images")

# Check food_items
food_count = cur.execute("SELECT COUNT(*) FROM food_items").fetchone()[0]
food_empty_imgs = cur.execute("SELECT COUNT(*) FROM food_items WHERE image IS NULL OR trim(image) = ''").fetchone()[0]
food_distinct_imgs = cur.execute("SELECT COUNT(DISTINCT image) FROM food_items").fetchone()[0]
print(f"Food Items: {food_count} total, {food_empty_imgs} empty image, {food_distinct_imgs} distinct images")

# Check specific destinations: agra, manali, dubai, sydney
for city in ['agra', 'manali', 'dubai', 'sydney']:
    dest = cur.execute("SELECT id, name, image FROM destinations WHERE id = ?", (city,)).fetchone()
    print(f"\n--- {city.upper()} ---")
    if dest:
        print(f"Destination: {dest['name']} -> {dest['image']}")
    stays = cur.execute("SELECT name, image FROM stays WHERE destination_id = ?", (city,)).fetchall()
    print(f"  Stays ({len(stays)}):")
    for s in stays:
        print(f"    - {s['name']}: {s['image']}")
    acts = cur.execute("SELECT name, image FROM activities WHERE destination_id = ?", (city,)).fetchall()
    print(f"  Activities ({len(acts)}):")
    for a in acts:
        print(f"    - {a['name']}: {a['image']}")
    foods = cur.execute("SELECT name, image FROM food_items WHERE destination_id = ?", (city,)).fetchall()
    print(f"  Food ({len(foods)}):")
    for f in foods:
        print(f"    - {f['name']}: {f['image']}")
    trans = cur.execute("SELECT mode, image FROM transport_options WHERE destination_id = ?", (city,)).fetchall()
    print(f"  Transport ({len(trans)}):")
    for t in trans:
        print(f"    - {t['mode']}: {t['image']}")
    rents = cur.execute("SELECT option_name, image FROM vehicle_rentals WHERE destination_id = ?", (city,)).fetchall()
    print(f"  Rentals ({len(rents)}):")
    for r in rents:
        print(f"    - {r['option_name']}: {r['image']}")

conn.close()
