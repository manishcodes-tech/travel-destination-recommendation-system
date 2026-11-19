import os
import secrets
import hashlib
import sqlite3
import socket
import time
import json
from datetime import datetime

# Database Configuration
MYSQL_HOST = os.environ.get("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.environ.get("MYSQL_PORT", 3306))
MYSQL_USER = os.environ.get("MYSQL_USER", "root")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
MYSQL_DB = os.environ.get("MYSQL_DB", "travelmate_db")

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "travelmate.db")
ACTIVE_ENGINE = "SQLite"

# Cache MySQL reachability so we don't block on TCP handshakes
_LAST_MYSQL_CHECK_TIME = 0
_CACHED_MYSQL_ONLINE = False

try:
    import pymysql
    import pymysql.cursors
    PYMYSQL_AVAILABLE = True
except ImportError:
    PYMYSQL_AVAILABLE = False


def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    salted = f"{password}{salt}".encode("utf-8")
    pwd_hash = hashlib.sha256(salted).hexdigest()
    return pwd_hash, salt


def verify_password(password: str, pwd_hash: str, salt: str) -> bool:
    expected_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(expected_hash, pwd_hash)


def is_mysql_port_reachable(host=MYSQL_HOST, port=MYSQL_PORT, timeout=0.15) -> bool:
    """Non-blocking socket probe to test if MySQL port is open."""
    global _LAST_MYSQL_CHECK_TIME, _CACHED_MYSQL_ONLINE
    now = time.time()
    if (now - _LAST_MYSQL_CHECK_TIME) < 10.0:
        return _CACHED_MYSQL_ONLINE

    _LAST_MYSQL_CHECK_TIME = now
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((host, port))
        s.close()
        _CACHED_MYSQL_ONLINE = True
        return True
    except Exception:
        _CACHED_MYSQL_ONLINE = False
        return False


def try_connect_mysql():
    """Attempts to connect to MySQL database if port is live."""
    if not PYMYSQL_AVAILABLE:
        return None

    if not is_mysql_port_reachable():
        return None

    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=1
        )
        return conn
    except Exception:
        try:
            temp_conn = pymysql.connect(
                host=MYSQL_HOST,
                port=MYSQL_PORT,
                user=MYSQL_USER,
                password=MYSQL_PASSWORD,
                charset="utf8mb4",
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=1
            )
            with temp_conn.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            temp_conn.commit()
            temp_conn.close()

            return pymysql.connect(
                host=MYSQL_HOST,
                port=MYSQL_PORT,
                user=MYSQL_USER,
                password=MYSQL_PASSWORD,
                database=MYSQL_DB,
                charset="utf8mb4",
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=1
            )
        except Exception:
            return None


def get_sqlite_conn():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_db():
    """Returns an active database connection (MySQL if online, SQLite as fail-safe)."""
    global ACTIVE_ENGINE
    mysql_conn = try_connect_mysql()
    if mysql_conn:
        ACTIVE_ENGINE = "MySQL"
        return mysql_conn
    else:
        ACTIVE_ENGINE = "SQLite"
        return get_sqlite_conn()


def get_active_engine_info():
    """Returns metadata about the active database engine."""
    global ACTIVE_ENGINE
    if is_mysql_port_reachable():
        mysql_test = try_connect_mysql()
        if mysql_test:
            mysql_test.close()
            ACTIVE_ENGINE = "MySQL"
            return {
                "engine": "MySQL",
                "host": f"{MYSQL_HOST}:{MYSQL_PORT}",
                "database": MYSQL_DB,
                "status": "Online & Synced",
                "is_mysql": True
            }

    ACTIVE_ENGINE = "SQLite"
    return {
        "engine": "SQLite",
        "host": "Local Embedded Storage",
        "database": "travelmate.db",
        "status": "Active (MySQL Dual-Engine Ready)",
        "is_mysql": False
    }


# 20 Handcrafted Destinations for seeding
ALL_DESTINATIONS = [
    ("manali", "Manali", "Himachal Pradesh, India", "Valley of the Gods, snow-capped peaks and pine forest trails", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80", 4.8, 1420, 8500, "3 Days / 2 Nights", "Snow Peaks,Adventure,Pine Forests,Cafes"),
    ("goa", "Goa", "West Coast, India", "Sun-drenched beaches, Portuguese colonial villas and vibrant nightlife", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80", 4.7, 2180, 11000, "4 Days / 3 Nights", "Beaches,Nightlife,Water Sports,Seafood"),
    ("udaipur", "Udaipur", "Rajasthan, India", "City of Lakes, royal marble palaces and romantic sunset boat rides", "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80", 4.9, 1680, 12500, "3 Days / 2 Nights", "Palaces,Lakes,Royal Heritage,Fine Dining"),
    ("lonavala", "Lonavala", "Maharashtra, India", "Misty Western Ghats, ancient Buddhist caves and cascading waterfalls", "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80", 4.6, 940, 6500, "2 Days / 1 Night", "Waterfalls,Western Ghats,Trekking,Chikki"),
    ("kerala", "Kerala", "South-West Coast, India", "God's Own Country, emerald backwaters, tea gardens and Ayurvedic retreats", "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80", 4.9, 2450, 14000, "5 Days / 4 Nights", "Backwaters,Houseboat,Tea Estates,Ayurveda"),
    ("dubai", "Dubai", "United Arab Emirates", "Futuristic skyscrapers, golden desert dunes and world-class luxury", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80", 4.8, 3120, 28000, "5 Days / 4 Nights", "Skyscrapers,Desert Safari,Luxury,Theme Parks"),
    ("kasol", "Kasol", "Himachal Pradesh, India", "Mini Israel of India, Parvati Valley riverbanks and mystical pine treks", "https://images.unsplash.com/photo-1596761224566-320c2777f98d?auto=format&fit=crop&w=1200&q=80", 4.7, 1150, 6000, "3 Days / 2 Nights", "Parvati Valley,Kheerganga Trek,Cafes,Riverside"),
    ("auli", "Auli", "Uttarakhand, India", "India's Skiing Paradise, sweeping meadows and Nanda Devi views", "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80", 4.8, 890, 9500, "3 Days / 2 Nights", "Skiing,Snow Meadows,Ropeway,Nanda Devi"),
    ("jaipur", "Jaipur", "Rajasthan, India", "The Pink City, majestic hilltop forts, vibrant bazaars and regal heritage", "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80", 4.8, 1850, 9200, "3 Days / 2 Nights", "Heritage,Forts,Royal Architecture,Bazaars"),
    ("ooty", "Ooty", "Tamil Nadu, India", "Queen of Hill Stations, misty Nilgiri tea estates and heritage steam toy trains", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", 4.7, 1310, 7800, "3 Days / 2 Nights", "Tea Gardens,Toy Train,Lakes,Cool Climate"),
    ("darjeeling", "Darjeeling", "West Bengal, India", "Land of the Thunderbolt, golden sunrise over Kanchenjunga and aroma of single estate tea", "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", 4.8, 1490, 8900, "4 Days / 3 Nights", "Himalayan Views,Tea Estates,Colonial Charm,Toy Train"),
    ("varanasi", "Varanasi", "Uttar Pradesh, India", "The Spiritual Capital of India, sacred dawn Ganga boat journeys and timeless evening Maha Aarti", "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80", 4.9, 2800, 6800, "3 Days / 2 Nights", "Spiritual,Ghats,Ganga Aarti,Ancient Culture"),
    ("andaman", "Andaman & Nicobar", "Bay of Bengal, India", "Tropical archipelago with turquoise lagoons, untouched white beaches and vibrant coral reefs", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", 4.9, 1940, 22500, "5 Days / 4 Nights", "Islands,Scuba Diving,Coral Reefs,Radhanagar Beach"),
    ("rishikesh", "Rishikesh", "Uttarakhand, India", "Yoga Capital of the World, sacred Ganga riverbank ghats and thrilling white-water rapids", "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80", 4.8, 2100, 7200, "3 Days / 2 Nights", "Yoga & Wellness,River Rafting,Ashrams,Suspension Bridges"),
    ("ladakh", "Leh Ladakh", "Ladakh, India", "Land of High Passes, azure Pangong Tso lake, and ancient cliffside monasteries", "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80", 4.9, 1720, 18500, "6 Days / 5 Nights", "High Altitude,Pangong Lake,Monasteries,Biking,Mountains"),
    ("munnar", "Munnar", "Kerala, India", "Endless rolling emerald tea plantations, misty mountain valleys and cascading waterfalls", "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80", 4.8, 1420, 8200, "3 Days / 2 Nights", "Tea Estates,Misty Valleys,Waterfalls,Western Ghats"),
    ("pondicherry", "Pondicherry", "Tamil Nadu Coast, India", "French colonial boulevards, pastel villas, Promenade seaside walks and Auroville spirituality", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80", 4.7, 1180, 7500, "3 Days / 2 Nights", "French Colony,Beaches,Auroville,Cafes,Heritage"),
    ("shimla", "Shimla", "Himachal Pradesh, India", "Queen of the Hills, historic Mall Road, neo-Gothic Christ Church and pine-scented ridge walks", "https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=1200&q=80", 4.7, 1640, 7800, "3 Days / 2 Nights", "Colonial Architecture,Mall Road,Toy Train,Snow Peaks"),
    ("coorg", "Coorg (Kodagu)", "Karnataka, India", "Scotland of India, mist-covered coffee plantations, aromatic spices, and tumbling Abbey Falls", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", 4.8, 1290, 8900, "3 Days / 2 Nights", "Coffee Plantations,Waterfalls,Nature,Trekking"),
    ("bali", "Bali", "Indonesia", "Island of the Gods, sacred ocean cliff temples, terraced emerald rice fields and sunset beach clubs", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80", 4.9, 3420, 34000, "6 Days / 5 Nights", "Tropical,Temples,Surfing,Rice Terraces,Luxury")
]

INITIAL_BOOKINGS = [
    ("BK-8901", 1, "Aarav Sharma", "aarav@gmail.com", "+91 98765 11111", "manali", "Manali, HP", "Oct 12 - Oct 15, 2026", 2, 17000, "Confirmed", json.dumps({
        "stay": {"name": "Snow Valley Alpine Resort", "type": "Resort", "nights": 3, "pricePerNight": 3200, "totalCost": 9600},
        "transport": {"mode": "Volvo Semi-Sleeper AC Coach", "detail": "Delhi to Manali Overnight", "unitPrice": 1400, "travelers": 2, "totalCost": 2800},
        "rental": {"option": "Royal Enfield Classic 350", "type": "Motorbike", "dailyRate": 1200, "days": 3, "totalCost": 3600},
        "activities": [{"name": "Solang Valley Paragliding", "quantity": 2, "unitPrice": 500, "totalPrice": 1000}],
        "food": None,
        "priceSummary": {"stay": 9600, "transport": 2800, "rental": 3600, "activities": 1000, "food": 0, "taxes": 0, "grandTotal": 17000}
    })),
    ("BK-8902", 1, "Priya Venkatesh", "priya@gmail.com", "+91 98765 22222", "goa", "Goa (Vagator)", "Nov 04 - Nov 08, 2026", 4, 44000, "Confirmed", json.dumps({
        "stay": {"name": "W Goa Vagator Cliffside", "type": "Luxury Resort", "nights": 4, "pricePerNight": 6500, "totalCost": 26000},
        "transport": {"mode": "Mumbai to Goa Vande Bharat Express", "detail": "Executive AC Chair Car", "unitPrice": 2000, "travelers": 4, "totalCost": 8000},
        "rental": {"option": "Mahindra Thar 4x4", "type": "SUV Rental", "dailyRate": 2000, "days": 4, "totalCost": 8000},
        "activities": [{"name": "Grand Island Scuba & Snorkeling", "quantity": 4, "unitPrice": 500, "totalPrice": 2000}],
        "food": None,
        "priceSummary": {"stay": 26000, "transport": 8000, "rental": 8000, "activities": 2000, "food": 0, "taxes": 0, "grandTotal": 44000}
    })),
    ("BK-8903", 1, "Rohan & Sneha", "rohan@gmail.com", "+91 98765 33333", "udaipur", "Udaipur (Palace Suite)", "Oct 20 - Oct 23, 2026", 2, 38500, "Pending", json.dumps({
        "stay": {"name": "Taj Lake Palace Heritage Suite", "type": "Heritage Palace", "nights": 3, "pricePerNight": 9500, "totalCost": 28500},
        "transport": {"mode": "Intercity Flight & Airport Transfer", "detail": "Delhi to Udaipur Premium Coach", "unitPrice": 2500, "travelers": 2, "totalCost": 5000},
        "rental": {"option": "Chauffeured Toyota Innova Crysta", "type": "Premium Cab", "dailyRate": 1500, "days": 3, "totalCost": 4500},
        "activities": [{"name": "Lake Pichola Sunset Royal Boat Cruise", "quantity": 2, "unitPrice": 250, "totalPrice": 500}],
        "food": None,
        "priceSummary": {"stay": 28500, "transport": 5000, "rental": 4500, "activities": 500, "food": 0, "taxes": 0, "grandTotal": 38500}
    })),
    ("BK-8904", 1, "Vikram Malhotra", "vikram@gmail.com", "+91 98765 44444", "dubai", "Dubai (Desert Safari)", "Dec 18 - Dec 23, 2026", 3, 84000, "Confirmed", json.dumps({
        "stay": {"name": "JW Marriott Marquis Dubai", "type": "5-Star Hotel", "nights": 5, "pricePerNight": 9200, "totalCost": 46000},
        "transport": {"mode": "Direct International Flight", "detail": "Mumbai to DXB Emirates", "unitPrice": 7000, "travelers": 3, "totalCost": 21000},
        "rental": {"option": "Dubai Private City Chauffeur", "type": "Luxury Sedan", "dailyRate": 2000, "days": 5, "totalCost": 10000},
        "activities": [
            {"name": "Red Dunes Desert Safari & BBQ Dinner", "quantity": 3, "unitPrice": 1500, "totalPrice": 4500},
            {"name": "Burj Khalifa At the Top (Level 124)", "quantity": 3, "unitPrice": 833, "totalPrice": 2500}
        ],
        "food": None,
        "priceSummary": {"stay": 46000, "transport": 21000, "rental": 10000, "activities": 7000, "food": 0, "taxes": 0, "grandTotal": 84000}
    })),
    ("BK-8905", 1, "Ananya Deshmukh", "ananya@gmail.com", "+91 98765 55555", "lonavala", "Lonavala (Pawna Camp)", "Sep 26 - Sep 28, 2026", 5, 14500, "Confirmed", json.dumps({
        "stay": {"name": "Pawna Lake Luxury Lakeside Glamping", "type": "Campsite", "nights": 2, "pricePerNight": 3500, "totalCost": 7000},
        "transport": {"mode": "Private Tempo Traveler", "detail": "Mumbai/Pune Pickup & Drop", "unitPrice": 700, "travelers": 5, "totalCost": 3500},
        "rental": None,
        "activities": [
            {"name": "Pawna Lake Kayaking & Bonfire BBQ", "quantity": 5, "unitPrice": 400, "totalPrice": 2000},
            {"name": "Lohagad Fort Guided Sunrise Trek", "quantity": 5, "unitPrice": 400, "totalPrice": 2000}
        ],
        "food": None,
        "priceSummary": {"stay": 7000, "transport": 3500, "rental": 0, "activities": 4000, "food": 0, "taxes": 0, "grandTotal": 14500}
    })),
    ("BK-8906", 1, "Dr. K. Nair & Family", "drnair@gmail.com", "+91 98765 66666", "kerala", "Kerala (Houseboat)", "Nov 15 - Nov 20, 2026", 4, 56000, "Pending", json.dumps({
        "stay": {"name": "Kumarakom Traditional Luxury Houseboat", "type": "Houseboat Suite", "nights": 4, "pricePerNight": 8500, "totalCost": 34000},
        "transport": {"mode": "Kochi to Alleppey Private Intercity Transfer", "detail": "AC Coach", "unitPrice": 2500, "travelers": 4, "totalCost": 10000},
        "rental": {"option": "Self-Drive Sedan", "type": "Car", "dailyRate": 1500, "days": 4, "totalCost": 6000},
        "activities": [
            {"name": "Vembanad Lake Sunset Canoe Safari", "quantity": 4, "unitPrice": 750, "totalPrice": 3000},
            {"name": "Authentic Kalaripayattu & Kathakali Show", "quantity": 4, "unitPrice": 750, "totalPrice": 3000}
        ],
        "food": None,
        "priceSummary": {"stay": 34000, "transport": 10000, "rental": 6000, "activities": 6000, "food": 0, "taxes": 0, "grandTotal": 56000}
    })),
    ("BK-8907", 1, "Kabir Mehta", "kabir@gmail.com", "+91 98765 77777", "kasol", "Kasol & Kheerganga", "Oct 01 - Oct 04, 2026", 1, 6800, "Cancelled", json.dumps({
        "stay": {"name": "Parvati Woods Riverfront Wooden Cottages", "type": "Cottage", "nights": 3, "pricePerNight": 1200, "totalCost": 3600},
        "transport": {"mode": "Overnight Himalayan AC Bus", "detail": "Delhi to Bhuntar", "unitPrice": 1200, "travelers": 1, "totalCost": 1200},
        "rental": None,
        "activities": [
            {"name": "Kheerganga Hot Springs Guided Trek", "quantity": 1, "unitPrice": 1000, "totalPrice": 1000},
            {"name": "Tosh Village Nature Trail", "quantity": 1, "unitPrice": 1000, "totalPrice": 1000}
        ],
        "food": None,
        "priceSummary": {"stay": 3600, "transport": 1200, "rental": 0, "activities": 2000, "food": 0, "taxes": 0, "grandTotal": 6800}
    })),
    ("BK-8908", 1, "Sunita & Raj", "sunita@gmail.com", "+91 98765 88888", "jaipur", "Jaipur (Hawa Mahal)", "Nov 12 - Nov 15, 2026", 2, 18400, "Confirmed", json.dumps({
        "stay": {"name": "Alsisar Haveli Heritage Stay", "type": "Heritage Haveli", "nights": 3, "pricePerNight": 3600, "totalCost": 10800},
        "transport": {"mode": "Delhi to Jaipur Superfast Express", "detail": "Vande Bharat AC Chair Car", "unitPrice": 1300, "travelers": 2, "totalCost": 2600},
        "rental": {"option": "Chauffeured City Cab", "type": "Cab", "dailyRate": 1200, "days": 3, "totalCost": 3600},
        "activities": [
            {"name": "Amber Fort Royal Elephant Walk & Light Show", "quantity": 2, "unitPrice": 700, "totalPrice": 1400}
        ],
        "food": None,
        "priceSummary": {"stay": 10800, "transport": 2600, "rental": 3600, "activities": 1400, "food": 0, "taxes": 0, "grandTotal": 18400}
    }))
]


SEED_FILE = os.path.join(os.path.dirname(__file__), "destinations_seed.json")


def load_seed_destinations():
    if os.path.exists(SEED_FILE):
        try:
            with open(SEED_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Notice: Error loading destinations_seed.json:", e)

    fallback = []
    for d in ALL_DESTINATIONS:
        fallback.append({
            "id": d[0],
            "name": d[1],
            "location": d[2],
            "region": d[2],
            "country": "India" if "India" in d[2] else ("United Arab Emirates" if "Emirates" in d[2] else "Indonesia"),
            "description": d[3],
            "tagline": d[3],
            "image": d[4],
            "rating": d[5],
            "reviews_count": d[6],
            "estimated_budget": d[7],
            "base_price": d[7],
            "duration": d[8],
            "best_season": "Winter",
            "category": "Mountains",
            "activities": [],
            "latitude": 20.5937,
            "longitude": 78.9629,
            "tags": d[9].split(","),
            "details": {}
        })
    return fallback


def init_sqlite_db():
    conn = get_sqlite_conn()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        persona TEXT DEFAULT 'Explorer',
        avatar TEXT,
        role TEXT DEFAULT 'traveler',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS destinations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        region TEXT NOT NULL DEFAULT '',
        country TEXT NOT NULL DEFAULT 'India',
        description TEXT DEFAULT '',
        tagline TEXT,
        image TEXT NOT NULL,
        category TEXT DEFAULT 'Mountains',
        rating REAL DEFAULT 4.8,
        reviews_count INTEGER DEFAULT 100,
        estimated_budget INTEGER NOT NULL DEFAULT 10000,
        base_price INTEGER NOT NULL DEFAULT 10000,
        duration TEXT NOT NULL DEFAULT '3 Days / 2 Nights',
        best_season TEXT DEFAULT 'Winter',
        activities TEXT DEFAULT '[]',
        latitude REAL DEFAULT 0.0,
        longitude REAL DEFAULT 0.0,
        tags TEXT DEFAULT '',
        details TEXT DEFAULT '{}'
    )
    """)

    # Migration check for existing SQLite database without new columns
    cursor.execute("PRAGMA table_info(destinations)")
    existing_cols = {row["name"] if isinstance(row, dict) else row[1] for row in cursor.fetchall()}
    needed_cols = [
        ("location", "TEXT DEFAULT ''"),
        ("country", "TEXT DEFAULT 'India'"),
        ("description", "TEXT DEFAULT ''"),
        ("category", "TEXT DEFAULT 'Mountains'"),
        ("estimated_budget", "INTEGER DEFAULT 10000"),
        ("best_season", "TEXT DEFAULT 'Winter'"),
        ("activities", "TEXT DEFAULT '[]'"),
        ("latitude", "REAL DEFAULT 0.0"),
        ("longitude", "REAL DEFAULT 0.0"),
        ("details", "TEXT DEFAULT '{}'"),
        ("is_active", "INTEGER DEFAULT 1")
    ]
    for col_name, col_type in needed_cols:
        if col_name not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE destinations ADD COLUMN {col_name} {col_type}")
            except Exception:
                pass
    cursor.execute("UPDATE destinations SET is_active = 1 WHERE is_active IS NULL")
    conn.commit()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        traveler_name TEXT NOT NULL,
        traveler_email TEXT,
        traveler_phone TEXT,
        destination_id TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        travel_date TEXT NOT NULL,
        travelers_count INTEGER DEFAULT 1,
        amount INTEGER NOT NULL,
        status TEXT DEFAULT 'Confirmed',
        booking_details TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    # Migration check for existing SQLite database bookings table
    cursor.execute("PRAGMA table_info(bookings)")
    booking_cols = {row["name"] if isinstance(row, dict) else row[1] for row in cursor.fetchall()}
    if "booking_details" not in booking_cols:
        try:
            cursor.execute("ALTER TABLE bookings ADD COLUMN booking_details TEXT DEFAULT '{}'")
        except Exception:
            pass
    conn.commit()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        destination_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, destination_id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stays (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        price TEXT NOT NULL,
        price_num INTEGER DEFAULT 0,
        rating REAL DEFAULT 4.8,
        image TEXT,
        FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        place TEXT,
        is_veg BOOLEAN DEFAULT 0,
        image TEXT,
        FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transport_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        detail TEXT NOT NULL,
        icon TEXT DEFAULT 'Plane',
        est_time TEXT,
        est_cost TEXT,
        FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_rentals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination_id TEXT NOT NULL,
        option_name TEXT NOT NULL,
        type TEXT,
        cost TEXT NOT NULL,
        cost_num INTEGER DEFAULT 0,
        note TEXT,
        image TEXT,
        FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        price_num INTEGER DEFAULT 0,
        duration TEXT,
        badge TEXT,
        category TEXT,
        image TEXT,
        FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attractions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination_id TEXT NOT NULL,
        name TEXT NOT NULL,
        tag TEXT,
        desc TEXT,
        image TEXT,
        FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS itineraries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination_id TEXT NOT NULL,
        day INTEGER NOT NULL,
        title TEXT NOT NULL,
        morning TEXT,
        afternoon TEXT,
        evening TEXT,
        tip TEXT,
        FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    )
    """)
    conn.commit()

    # Ensure inventory tables have is_active and management columns
    inventory_migrations = [
        ("stays", [
            ("is_active", "INTEGER DEFAULT 1"),
            ("description", "TEXT DEFAULT ''"),
            ("amenities", "TEXT DEFAULT ''"),
            ("location", "TEXT DEFAULT ''")
        ]),
        ("transport_options", [
            ("is_active", "INTEGER DEFAULT 1"),
            ("price_num", "INTEGER DEFAULT 0"),
            ("type", "TEXT DEFAULT 'Intercity'"),
            ("provider", "TEXT DEFAULT ''"),
            ("image", "TEXT DEFAULT ''")
        ]),
        ("vehicle_rentals", [
            ("is_active", "INTEGER DEFAULT 1"),
            ("provider", "TEXT DEFAULT ''")
        ]),
        ("activities", [
            ("is_active", "INTEGER DEFAULT 1"),
            ("description", "TEXT DEFAULT ''"),
            ("location", "TEXT DEFAULT ''"),
            ("rating", "REAL DEFAULT 4.8")
        ]),
        ("food_items", [
            ("is_active", "INTEGER DEFAULT 1"),
            ("category", "TEXT DEFAULT 'Standard'"),
            ("price_num", "INTEGER DEFAULT 0")
        ])
    ]
    for tbl, cols in inventory_migrations:
        cursor.execute(f"PRAGMA table_info({tbl})")
        tbl_cols = {row["name"] if isinstance(row, dict) else row[1] for row in cursor.fetchall()}
        for col_name, col_type in cols:
            if col_name not in tbl_cols:
                try:
                    cursor.execute(f"ALTER TABLE {tbl} ADD COLUMN {col_name} {col_type}")
                except Exception:
                    pass
        cursor.execute(f"UPDATE {tbl} SET is_active = 1 WHERE is_active IS NULL")
    conn.commit()

    # Seed users: Only administrator account, no fake customer accounts
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        admin_pwd, admin_salt = hash_password("admin123")
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, salt, persona, avatar, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "Administrator", "admin@travelmate.com", admin_pwd, admin_salt, "Administrator",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80", "admin"
        ))
        conn.commit()

    # Seed / sync all 20 destinations
    seed_data = load_seed_destinations()
    for d in seed_data:
        dest_id = d["id"]
        name = d["name"]
        location = d.get("location") or d.get("region", "")
        region = d.get("region") or location
        country = d.get("country", "India")
        tagline = d.get("tagline", "")
        description = d.get("description") or d.get("overview") or tagline
        image = d.get("image", "")
        category = d.get("category", "Mountains")
        rating = float(d.get("rating", 4.8))
        reviews_count = int(d.get("reviews_count") or d.get("reviewsCount") or 100)
        base_price = int(d.get("base_price") or d.get("basePrice") or 8500)
        estimated_budget = int(d.get("estimated_budget") or base_price)
        duration = d.get("duration", "3 Days / 2 Nights")
        best_season = d.get("best_season", "Winter")
        activities_raw = d.get("activities", [])
        activities_str = json.dumps(activities_raw) if isinstance(activities_raw, list) else str(activities_raw)
        lat = float(d.get("latitude", 0.0))
        lng = float(d.get("longitude", 0.0))
        tags_raw = d.get("tags", [])
        tags_str = ",".join(tags_raw) if isinstance(tags_raw, list) else str(tags_raw)

        details_obj = {
            "overview": d.get("overview", description),
            "howToReach": d.get("howToReach", []),
            "stays": d.get("stays", []),
            "food": d.get("food", []),
            "localTransport": d.get("localTransport", []),
            "activities": activities_raw,
            "attractions": d.get("attractions", []),
            "itinerary": d.get("itinerary", []),
            "bestTime": d.get("bestTime", ""),
            "weather": d.get("weather", ""),
            "idealFor": d.get("idealFor", ""),
            "language": d.get("language", ""),
            "styles": d.get("styles", [category]),
            "seasons": d.get("seasons", [best_season]),
            "travelWith": d.get("travelWith", ["Friends", "Couple", "Solo", "Family"])
        }
        details_str = json.dumps(details_obj)

        cursor.execute("""
            INSERT OR REPLACE INTO destinations (
                id, name, location, region, country, description, tagline, image,
                category, rating, reviews_count, estimated_budget, base_price,
                duration, best_season, activities, latitude, longitude, tags, details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dest_id, name, location, region, country, description, tagline, image,
            category, rating, reviews_count, estimated_budget, base_price,
            duration, best_season, activities_str, lat, lng, tags_str, details_str
        ))
    conn.commit()

    # Seed relational tables if empty
    cursor.execute("SELECT COUNT(*) FROM stays")
    if cursor.fetchone()[0] == 0:
        for d in seed_data:
            dest_id = d["id"]
            for s in d.get("stays", []):
                cursor.execute("""
                    INSERT INTO stays (destination_id, name, type, price, price_num, rating, image)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (dest_id, s["name"], s["type"], s["price"], s.get("priceNum", 0), float(s.get("rating", 4.8)), s.get("image", "")))

            for f in d.get("food", []):
                cursor.execute("""
                    INSERT INTO food_items (destination_id, name, type, place, is_veg, image)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (dest_id, f["name"], f["type"], f.get("place", ""), 1 if f.get("isVeg") else 0, f.get("image", "")))

            for t in d.get("howToReach", []):
                cursor.execute("""
                    INSERT INTO transport_options (destination_id, mode, detail, icon, est_time, est_cost)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (dest_id, t["mode"], t["detail"], t.get("icon", "Plane"), t.get("estTime", ""), t.get("estCost", "")))

            for r in d.get("localTransport", []):
                cursor.execute("""
                    INSERT INTO vehicle_rentals (destination_id, option_name, type, cost, cost_num, note, image)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (dest_id, r["option"], r.get("type", "Car"), r["cost"], r.get("costNum", 0), r.get("note", ""), r.get("image", "")))

            for a in d.get("activities", []):
                cursor.execute("""
                    INSERT INTO activities (destination_id, name, price, price_num, duration, badge, category, image)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (dest_id, a["name"], a["price"], a.get("priceNum", 0), a.get("duration", ""), a.get("badge", ""), a.get("category", ""), a.get("image", "")))

            for at in d.get("attractions", []):
                cursor.execute("""
                    INSERT INTO attractions (destination_id, name, tag, desc, image)
                    VALUES (?, ?, ?, ?, ?)
                """, (dest_id, at["name"], at.get("tag", ""), at.get("desc", ""), at.get("image", "")))

            for it in d.get("itinerary", []):
                cursor.execute("""
                    INSERT INTO itineraries (destination_id, day, title, morning, afternoon, evening, tip)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (dest_id, it["day"], it["title"], it.get("morning", ""), it.get("afternoon", ""), it.get("evening", ""), it.get("tip", "")))
        conn.commit()

    # Seed bookings if empty
    cursor.execute("SELECT COUNT(*) FROM bookings")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
            INSERT INTO bookings (id, user_id, traveler_name, traveler_email, traveler_phone, destination_id, destination_name, travel_date, travelers_count, amount, status, booking_details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, INITIAL_BOOKINGS)
        conn.commit()
    else:
        # Backfill booking_details for pre-existing initial bookings if empty
        for bk in INITIAL_BOOKINGS:
            cursor.execute("""
                UPDATE bookings
                SET booking_details = ?
                WHERE id = ? AND (booking_details IS NULL OR booking_details = '' OR booking_details = '{}')
            """, (bk[11], bk[0]))
        conn.commit()

    conn.close()


def init_mysql_db(conn):
    """Initializes schema and seed data in MySQL."""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                salt VARCHAR(255) NOT NULL,
                persona VARCHAR(100) DEFAULT 'Explorer',
                avatar TEXT,
                role VARCHAR(50) DEFAULT 'traveler',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS destinations (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL DEFAULT '',
                region VARCHAR(255) NOT NULL DEFAULT '',
                country VARCHAR(100) NOT NULL DEFAULT 'India',
                description TEXT,
                tagline TEXT,
                image TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'Mountains',
                rating DECIMAL(3, 2) DEFAULT 4.80,
                reviews_count INT DEFAULT 100,
                estimated_budget INT NOT NULL DEFAULT 10000,
                base_price INT NOT NULL DEFAULT 10000,
                duration VARCHAR(100) NOT NULL DEFAULT '3 Days / 2 Nights',
                best_season VARCHAR(100) DEFAULT 'Winter',
                activities TEXT,
                latitude DOUBLE DEFAULT 0.0,
                longitude DOUBLE DEFAULT 0.0,
                tags TEXT,
                details LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(50) PRIMARY KEY,
                user_id INT,
                traveler_name VARCHAR(255) NOT NULL,
                traveler_email VARCHAR(255),
                traveler_phone VARCHAR(50),
                destination_id VARCHAR(100) NOT NULL,
                destination_name VARCHAR(255) NOT NULL,
                travel_date VARCHAR(100) NOT NULL,
                travelers_count INT DEFAULT 1,
                amount INT NOT NULL,
                status VARCHAR(50) DEFAULT 'Confirmed',
                booking_details LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (user_id),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS wishlist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                destination_id VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY user_dest_idx (user_id, destination_id),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            conn.commit()

            # Seed users: Only administrator account, no fake customer accounts
            cursor.execute("SELECT COUNT(*) as cnt FROM users")
            row = cursor.fetchone()
            if row["cnt"] == 0:
                admin_pwd, admin_salt = hash_password("admin123")
                cursor.execute("""
                    INSERT INTO users (name, email, password_hash, salt, persona, avatar, role)
                    VALUES (%s, %s, %s, %s, %s, %s, 'admin')
                """, ("Administrator", "admin@travelmate.com", admin_pwd, admin_salt, "Administrator", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"))
                conn.commit()

            # Seed destinations
            seed_data = load_seed_destinations()
            for d in seed_data:
                dest_id = d["id"]
                name = d["name"]
                location = d.get("location") or d.get("region", "")
                region = d.get("region") or location
                country = d.get("country", "India")
                tagline = d.get("tagline", "")
                description = d.get("description") or d.get("overview") or tagline
                image = d.get("image", "")
                category = d.get("category", "Mountains")
                rating = float(d.get("rating", 4.8))
                reviews_count = int(d.get("reviews_count") or d.get("reviewsCount") or 100)
                base_price = int(d.get("base_price") or d.get("basePrice") or 8500)
                estimated_budget = int(d.get("estimated_budget") or base_price)
                duration = d.get("duration", "3 Days / 2 Nights")
                best_season = d.get("best_season", "Winter")
                activities_raw = d.get("activities", [])
                activities_str = json.dumps(activities_raw) if isinstance(activities_raw, list) else str(activities_raw)
                lat = float(d.get("latitude", 0.0))
                lng = float(d.get("longitude", 0.0))
                tags_raw = d.get("tags", [])
                tags_str = ",".join(tags_raw) if isinstance(tags_raw, list) else str(tags_raw)

                details_obj = {
                    "overview": d.get("overview", description),
                    "howToReach": d.get("howToReach", []),
                    "stays": d.get("stays", []),
                    "food": d.get("food", []),
                    "localTransport": d.get("localTransport", []),
                    "activities": activities_raw,
                    "attractions": d.get("attractions", []),
                    "itinerary": d.get("itinerary", []),
                    "bestTime": d.get("bestTime", ""),
                    "weather": d.get("weather", ""),
                    "idealFor": d.get("idealFor", ""),
                    "language": d.get("language", ""),
                    "styles": d.get("styles", [category]),
                    "seasons": d.get("seasons", [best_season]),
                    "travelWith": d.get("travelWith", ["Friends", "Couple", "Solo", "Family"])
                }
                details_str = json.dumps(details_obj)

                cursor.execute("""
                    INSERT INTO destinations (
                        id, name, location, region, country, description, tagline, image,
                        category, rating, reviews_count, estimated_budget, base_price,
                        duration, best_season, activities, latitude, longitude, tags, details
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        name=VALUES(name), location=VALUES(location), region=VALUES(region),
                        country=VALUES(country), description=VALUES(description), tagline=VALUES(tagline),
                        image=VALUES(image), category=VALUES(category), rating=VALUES(rating),
                        reviews_count=VALUES(reviews_count), estimated_budget=VALUES(estimated_budget),
                        base_price=VALUES(base_price), duration=VALUES(duration),
                        best_season=VALUES(best_season), activities=VALUES(activities),
                        latitude=VALUES(latitude), longitude=VALUES(longitude),
                        tags=VALUES(tags), details=VALUES(details)
                """, (
                    dest_id, name, location, region, country, description, tagline, image,
                    category, rating, reviews_count, estimated_budget, base_price,
                    duration, best_season, activities_str, lat, lng, tags_str, details_str
                ))
            conn.commit()

            # Seed bookings
            cursor.execute("SELECT COUNT(*) as cnt FROM bookings")
            if cursor.fetchone()["cnt"] == 0:
                for b in INITIAL_BOOKINGS:
                    cursor.execute("""
                        INSERT INTO bookings (id, user_id, traveler_name, traveler_email, traveler_phone, destination_id, destination_name, travel_date, travelers_count, amount, status)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, b)
                conn.commit()

        conn.close()
        print("MySQL Database successfully initialized.")
    except Exception as e:
        print("Notice: MySQL init error (falling back to SQLite):", e)


def init_db():
    """Master initialization: Tries MySQL first if online; initializes SQLite as fail-safe."""
    if is_mysql_port_reachable():
        mysql_conn = try_connect_mysql()
        if mysql_conn:
            init_mysql_db(mysql_conn)
    init_sqlite_db()
