import os
import json
import secrets
import requests
import hashlib
import hmac
import math
import re
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from database import (
    get_db,
    hash_password,
    verify_password,
    init_db,
    get_active_engine_info,
    PYMYSQL_AVAILABLE
)
from recommender.recommender import DestinationRecommender

recommender = DestinationRecommender()

app = FastAPI(title="TravelMate Multi-Engine API", version="2.5.0")

# Enable CORS for frontend development
origins = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_SECRET = os.environ.get("SESSION_SECRET", "travelmate_secure_session_key_2026")

# In-memory token store for session mapping: token -> user_id
active_sessions: dict[str, int] = {}


def generate_session_token(user_id: int) -> str:
    nonce = secrets.token_hex(16)
    sig = hmac.new(SESSION_SECRET.encode(), f"{user_id}_{nonce}".encode(), hashlib.sha256).hexdigest()[:16]
    token = f"tm_sess_{user_id}_{nonce}_{sig}"
    active_sessions[token] = user_id
    return token


class DatabaseSession:
    """Wrapper that abstracts SQL parameter syntax (? vs %s) between SQLite and MySQL."""
    def __init__(self):
        self.conn = get_db()
        self.is_mysql = hasattr(self.conn, "cursorclass")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.conn.close()
        except Exception:
            pass

    def execute(self, sql: str, params: tuple = ()):
        cursor = self.conn.cursor()
        if self.is_mysql:
            formatted_sql = sql.replace("?", "%s")
        else:
            formatted_sql = sql
        cursor.execute(formatted_sql, params)
        return cursor

    def commit(self):
        self.conn.commit()


def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[int]:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        return None
    uid = active_sessions.get(token)
    if uid:
        return uid
    # In case backend restarted, verify signed session token
    try:
        if token.startswith("tm_sess_"):
            parts = token.split("_")
            if len(parts) >= 5 and parts[0] == "tm" and parts[1] == "sess":
                u_str, nonce, sig = parts[2], parts[3], parts[4]
                expected_sig = hmac.new(SESSION_SECRET.encode(), f"{u_str}_{nonce}".encode(), hashlib.sha256).hexdigest()[:16]
                if secrets.compare_digest(sig, expected_sig):
                    verified_uid = int(u_str)
                    active_sessions[token] = verified_uid
                    return verified_uid
    except Exception:
        pass
    return None


def require_admin_user(user_id: Optional[int] = Depends(get_current_user_id)) -> int:
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in as administrator.")
    with DatabaseSession() as db:
        cur = db.execute("SELECT role FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="User account not found.")
        role = row["role"] if isinstance(row, dict) else row[0]
        if role != "admin":
            raise HTTPException(status_code=403, detail="Forbidden: Administrator access required.")
    return user_id


# Models
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    persona: Optional[str] = "Explorer"
    avatar: Optional[str] = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"


class LoginRequest(BaseModel):
    email: str
    password: str


class BookingCreateRequest(BaseModel):
    destinationId: str
    destinationName: str
    travelDate: str
    travelersCount: int = 1
    travelerName: str
    travelerEmail: str
    travelerPhone: str
    amount: int
    status: Optional[str] = "Pending"
    bookingDetails: Optional[Dict[str, Any]] = None


class StatusUpdateRequest(BaseModel):
    status: str


class WishlistToggleRequest(BaseModel):
    destinationId: str


class DestinationCreateRequest(BaseModel):
    name: str
    region: str
    tagline: str
    image: str
    base_price: int
    duration: str
    tags: Optional[str] = "Handcrafted,Curated"


class DestinationPriceUpdate(BaseModel):
    base_price: int


class ItemStatusToggleRequest(BaseModel):
    is_active: Optional[int] = None


class DestinationSaveRequest(BaseModel):
    name: str
    region: Optional[str] = ""
    country: Optional[str] = "India"
    description: Optional[str] = ""
    tagline: Optional[str] = ""
    image: Optional[str] = ""
    category: Optional[str] = "Mountains"
    rating: Optional[float] = 4.8
    reviews_count: Optional[int] = 100
    base_price: int
    duration: Optional[str] = "3 Days / 2 Nights"
    best_season: Optional[str] = "Winter"
    tags: Optional[str] = "Handcrafted,Curated"
    is_active: Optional[int] = 1


class StaySaveRequest(BaseModel):
    destination_id: str
    name: str
    type: str
    price: str
    price_num: Optional[int] = 0
    rating: Optional[float] = 4.8
    image: Optional[str] = ""
    description: Optional[str] = ""
    amenities: Optional[str] = ""
    location: Optional[str] = ""
    is_active: Optional[int] = 1


class TransportSaveRequest(BaseModel):
    destination_id: str
    mode: str
    detail: str
    icon: Optional[str] = "Plane"
    est_time: Optional[str] = ""
    est_cost: Optional[str] = ""
    price_num: Optional[int] = 0
    type: Optional[str] = "Intercity"
    provider: Optional[str] = ""
    image: Optional[str] = ""
    is_active: Optional[int] = 1


class RentalSaveRequest(BaseModel):
    destination_id: str
    option_name: str
    type: Optional[str] = "Cab"
    cost: str
    cost_num: Optional[int] = 0
    note: Optional[str] = ""
    image: Optional[str] = ""
    provider: Optional[str] = ""
    is_active: Optional[int] = 1


class ActivitySaveRequest(BaseModel):
    destination_id: str
    name: str
    price: str
    price_num: Optional[int] = 0
    duration: Optional[str] = "2 Hours"
    badge: Optional[str] = ""
    category: Optional[str] = "Sightseeing"
    image: Optional[str] = ""
    description: Optional[str] = ""
    location: Optional[str] = ""
    rating: Optional[float] = 4.8
    is_active: Optional[int] = 1


class FoodSaveRequest(BaseModel):
    destination_id: str
    name: str
    type: str
    place: Optional[str] = ""
    is_veg: Optional[bool] = False
    image: Optional[str] = ""
    category: Optional[str] = "Standard"
    price_num: Optional[int] = 0
    is_active: Optional[int] = 1


class RecommendationRequest(BaseModel):
    budget: Optional[float] = None
    duration: Optional[Any] = "2 Days / 1 Night"
    days: Optional[int] = None
    nights: Optional[int] = None
    travelers: Optional[int] = 2
    traveling_with: Optional[str] = "Friends"
    interest: Optional[str] = "Adventure"
    season: Optional[str] = "Winter"
    destination: Optional[str] = None



class RecommendationPreviewRequest(RecommendationRequest):
    pass


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    db_info = get_active_engine_info()
    return {
        "message": "TravelMate Database Engine is Running",
        "database": db_info,
        "version": "2.5.0"
    }


# ----------------- DATABASE STATUS & EXPORT -----------------

@app.get("/api/admin/db-info")
def db_info(admin_id: int = Depends(require_admin_user)):
    info = get_active_engine_info()
    with DatabaseSession() as db:
        cur_users = db.execute("SELECT COUNT(*) as c FROM users")
        row_users = cur_users.fetchone()
        u_count = row_users["c"] if isinstance(row_users, dict) else row_users[0]

        cur_bk = db.execute("SELECT COUNT(*) as c FROM bookings")
        row_bk = cur_bk.fetchone()
        b_count = row_bk["c"] if isinstance(row_bk, dict) else row_bk[0]

        cur_dest = db.execute("SELECT COUNT(*) as c FROM destinations")
        row_dest = cur_dest.fetchone()
        d_count = row_dest["c"] if isinstance(row_dest, dict) else row_dest[0]

        cur_fav = db.execute("SELECT COUNT(*) as c FROM wishlist")
        row_fav = cur_fav.fetchone()
        f_count = row_fav["c"] if isinstance(row_fav, dict) else row_fav[0]

    schema_file = os.path.join(os.path.dirname(__file__), "travelmate_mysql_schema.sql")
    schema_exists = os.path.exists(schema_file)

    return {
        **info,
        "tableCounts": {
            "users": u_count,
            "destinations": d_count,
            "wishlist": f_count,
            "trips": b_count,
            "bookings": b_count
        },
        "mysqlSchemaAvailable": schema_exists,
        "schemaFilename": "travelmate_mysql_schema.sql"
    }


@app.get("/api/admin/mysql-schema")
def download_mysql_schema(admin_id: int = Depends(require_admin_user)):
    schema_file = os.path.join(os.path.dirname(__file__), "travelmate_mysql_schema.sql")
    if not os.path.exists(schema_file):
        raise HTTPException(status_code=404, detail="MySQL schema file not found")
    with open(schema_file, "r", encoding="utf-8") as f:
        content = f.read()
    return {"filename": "travelmate_mysql_schema.sql", "sql": content, "schema": content}


@app.get("/api/admin/users")
def get_all_users(admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        cur = db.execute("SELECT id, name, email, persona, avatar, role, created_at FROM users ORDER BY id DESC")
        rows = cur.fetchall()
        users = [dict(r) for r in rows]
    return users


# ----------------- AUTH ENDPOINTS -----------------

def _format_booking(row: dict) -> dict:
    if not row:
        return {}
    b = dict(row)
    details = b.get("booking_details")
    if isinstance(details, str):
        try:
            b["booking_details"] = json.loads(details) if details else {}
        except Exception:
            b["booking_details"] = {}
    elif not isinstance(details, dict):
        b["booking_details"] = {}
    return b


# ----------------- AUTH ENDPOINTS -----------------

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    name = req.name.strip()
    email = req.email.strip().lower()
    password = req.password

    if not name:
        raise HTTPException(status_code=400, detail="Full name is required.")
    if not email or "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="A valid email address is required.")
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    with DatabaseSession() as db:
        cur = db.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists. Please login instead.")

        pwd_hash, salt = hash_password(password)
        cur = db.execute("""
            INSERT INTO users (name, email, password_hash, salt, persona, avatar, role)
            VALUES (?, ?, ?, ?, ?, ?, 'customer')
        """, (name, email, pwd_hash, salt, req.persona or "Explorer", req.avatar))
        db.commit()

        user_id = cur.lastrowid
        cur = db.execute("SELECT id, name, email, persona, avatar, role, created_at FROM users WHERE id = ?", (user_id,))
        user_row = dict(cur.fetchone())

    # IMPORTANT: DO NOT return a session token here. Registration does not automatically log the user in.
    return {
        "success": True,
        "user": user_row,
        "message": "Account created successfully. Please login."
    }


@app.post("/api/auth/login")
def login(req: LoginRequest):
    target_identifier = req.email.strip().lower()
    # Support admin123 or admin as username
    if target_identifier in ["admin123", "admin"]:
        target_identifier = "admin@travelmate.com"

    with DatabaseSession() as db:
        cur = db.execute(
            "SELECT id, name, email, password_hash, salt, persona, avatar, role FROM users WHERE email = ?",
            (target_identifier,)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        user_dict = dict(row)
        if not verify_password(req.password, user_dict["password_hash"], user_dict["salt"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        user_id = user_dict["id"]
        # Normalize legacy 'traveler' to 'customer'
        if user_dict.get("role") == "traveler":
            user_dict["role"] = "customer"

        # Fetch Wishlist
        cur = db.execute("SELECT destination_id FROM wishlist WHERE user_id = ?", (user_id,))
        wishlist = [r["destination_id"] if isinstance(r, dict) else r[0] for r in cur.fetchall()]

    token = generate_session_token(user_id)

    # Clean sensitive password fields
    user_dict.pop("password_hash", None)
    user_dict.pop("salt", None)

    return {
        "success": True,
        "token": token,
        "user": user_dict,
        "wishlist": wishlist,
        "message": "Logged in successfully"
    }


@app.get("/api/auth/me")
def get_me(user_id: Optional[int] = Depends(get_current_user_id)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    with DatabaseSession() as db:
        cur = db.execute("SELECT id, name, email, persona, avatar, role, created_at FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        user_dict = dict(row)
        if user_dict.get("role") == "traveler":
            user_dict["role"] = "customer"

        cur = db.execute("SELECT destination_id FROM wishlist WHERE user_id = ?", (user_id,))
        wishlist = [r["destination_id"] if isinstance(r, dict) else r[0] for r in cur.fetchall()]

        cur = db.execute("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        bookings = [_format_booking(dict(r)) for r in cur.fetchall()]

    return {
        "user": user_dict,
        "wishlist": wishlist,
        "bookings": bookings
    }


def _format_booking(b: dict) -> dict:
    details = {}
    raw_details = b.get("booking_details")
    if raw_details:
        if isinstance(raw_details, dict):
            details = raw_details
        elif isinstance(raw_details, str):
            try:
                details = json.loads(raw_details)
            except Exception:
                details = {}

    return {
        "id": b["id"],
        "user_id": b.get("user_id"),
        "destination_id": b.get("destination_id"),
        "destination_name": b.get("destination_name"),
        "travel_date": b.get("travel_date"),
        "travelers_count": b.get("travelers_count", 1),
        "traveler_name": b.get("traveler_name"),
        "traveler_email": b.get("traveler_email"),
        "traveler_phone": b.get("traveler_phone", ""),
        "amount": b.get("amount", 0),
        "status": b.get("status", "Confirmed"),
        "created_at": str(b.get("created_at") or ""),
        "booking_details": details
    }


# ----------------- DESTINATIONS -----------------

def _extract_num(val) -> int:
    if isinstance(val, (int, float)):
        return int(val)
    if not val or not isinstance(val, str):
        return 0
    clean = re.sub(r"[^\d]", "", val)
    return int(clean) if clean else 0


def _format_destination(d: dict, include_details: bool = False) -> dict:
    tags = [t.strip() for t in d.get("tags", "").split(",") if t.strip()] if isinstance(d.get("tags"), str) else (d.get("tags") or [])
    
    activities = []
    if d.get("activities"):
        try:
            activities = json.loads(d["activities"]) if isinstance(d["activities"], str) else d["activities"]
        except Exception:
            activities = []

    details = {}
    if d.get("details"):
        try:
            details = json.loads(d["details"]) if isinstance(d["details"], str) else d["details"]
        except Exception:
            details = {}

    category = d.get("category") or "Mountains"
    styles = details.get("styles") or [category]
    base_price = int(d.get("base_price") or d.get("estimated_budget") or 10000)
    estimated_budget = int(d.get("estimated_budget") or base_price)
    reviews_count = int(d.get("reviews_count") or 100)
    is_act = 1 if d.get("is_active") is None or d.get("is_active") == 1 or d.get("is_active") == "1" else 0

    dest_obj = {
        "id": d["id"],
        "name": d["name"],
        "location": d.get("location") or d.get("region") or "",
        "region": d.get("region") or d.get("location") or "",
        "country": d.get("country") or "India",
        "description": d.get("description") or d.get("overview") or d.get("tagline") or "",
        "tagline": d.get("tagline") or d.get("description") or "",
        "image": d.get("image") or "",
        "category": category,
        "rating": float(d.get("rating") or 4.8),
        "reviews_count": reviews_count,
        "reviewsCount": reviews_count,
        "estimated_budget": estimated_budget,
        "base_price": base_price,
        "basePrice": base_price,
        "duration": d.get("duration") or "3 Days / 2 Nights",
        "best_season": d.get("best_season") or "Winter",
        "activities": activities,
        "latitude": float(d.get("latitude") or 0.0),
        "longitude": float(d.get("longitude") or 0.0),
        "tags": tags,
        "styles": styles,
        "is_active": is_act
    }

    if include_details:
        dest_obj.update({
            "overview": details.get("overview", dest_obj["description"]),
            "howToReach": details.get("howToReach", []),
            "stays": details.get("stays", []),
            "food": details.get("food", []),
            "localTransport": details.get("localTransport", []),
            "attractions": details.get("attractions", []),
            "itinerary": details.get("itinerary", []),
            "bestTime": details.get("bestTime", ""),
            "weather": details.get("weather", ""),
            "idealFor": details.get("idealFor", ""),
            "language": details.get("language", ""),
            "seasons": details.get("seasons", [dest_obj["best_season"]]),
            "travelWith": details.get("travelWith", ["Friends", "Couple", "Solo", "Family"])
        })

    return dest_obj


def _populate_destination_relational_items(clean_id: str, dest_obj: dict, db):
    # 1. Stays
    cur = db.execute("SELECT * FROM stays WHERE destination_id = ? AND (is_active = 1 OR is_active IS NULL) ORDER BY id ASC", (clean_id,))
    stay_rows = [dict(r) for r in cur.fetchall()]
    if stay_rows:
        dest_obj["stays"] = [{
            "id": r["id"],
            "destination_id": r["destination_id"],
            "name": r["name"],
            "type": r["type"],
            "price": r["price"],
            "priceNum": r.get("price_num") if r.get("price_num") else _extract_num(r.get("price")),
            "rating": float(r.get("rating") or 4.8),
            "image": r.get("image") or "",
            "description": r.get("description") or "",
            "amenities": [a.strip() for a in (r.get("amenities") or "").split(",") if a.strip()] if isinstance(r.get("amenities"), str) else (r.get("amenities") or []),
            "location": r.get("location") or "",
            "is_active": 1 if r.get("is_active") is None or r.get("is_active") == 1 else 0
        } for r in stay_rows]
    else:
        cur_all = db.execute("SELECT COUNT(*) as c FROM stays WHERE destination_id = ?", (clean_id,))
        c_row = cur_all.fetchone()
        c = c_row["c"] if isinstance(c_row, dict) else c_row[0]
        if c > 0:
            dest_obj["stays"] = []

    # 2. Transport Options (howToReach)
    cur = db.execute("SELECT * FROM transport_options WHERE destination_id = ? AND (is_active = 1 OR is_active IS NULL) ORDER BY id ASC", (clean_id,))
    trans_rows = [dict(r) for r in cur.fetchall()]
    if trans_rows:
        dest_obj["howToReach"] = [{
            "id": r["id"],
            "destination_id": r["destination_id"],
            "mode": r["mode"],
            "detail": r["detail"],
            "icon": r.get("icon") or "Plane",
            "estTime": r.get("est_time") or "",
            "estCost": r.get("est_cost") or (f"₹{r.get('price_num')}" if r.get("price_num") else ""),
            "price": r.get("est_cost") or (f"₹{r.get('price_num')}" if r.get("price_num") else ""),
            "priceNum": r.get("price_num") if r.get("price_num") else _extract_num(r.get("est_cost")),
            "type": r.get("type") or "Intercity",
            "provider": r.get("provider") or "",
            "image": r.get("image") or "",
            "is_active": 1 if r.get("is_active") is None or r.get("is_active") == 1 else 0
        } for r in trans_rows]
    else:
        cur_all = db.execute("SELECT COUNT(*) as c FROM transport_options WHERE destination_id = ?", (clean_id,))
        c_row = cur_all.fetchone()
        c = c_row["c"] if isinstance(c_row, dict) else c_row[0]
        if c > 0:
            dest_obj["howToReach"] = []

    # 3. Vehicle Rentals (localTransport)
    cur = db.execute("SELECT * FROM vehicle_rentals WHERE destination_id = ? AND (is_active = 1 OR is_active IS NULL) ORDER BY id ASC", (clean_id,))
    rent_rows = [dict(r) for r in cur.fetchall()]
    if rent_rows:
        dest_obj["localTransport"] = [{
            "id": r["id"],
            "destination_id": r["destination_id"],
            "option": r.get("option_name") or "",
            "option_name": r.get("option_name") or "",
            "type": r.get("type") or "Cab",
            "cost": r.get("cost") or "",
            "costNum": r.get("cost_num") if r.get("cost_num") else _extract_num(r.get("cost")),
            "note": r.get("note") or "",
            "image": r.get("image") or "",
            "provider": r.get("provider") or "",
            "is_active": 1 if r.get("is_active") is None or r.get("is_active") == 1 else 0
        } for r in rent_rows]
    else:
        cur_all = db.execute("SELECT COUNT(*) as c FROM vehicle_rentals WHERE destination_id = ?", (clean_id,))
        c_row = cur_all.fetchone()
        c = c_row["c"] if isinstance(c_row, dict) else c_row[0]
        if c > 0:
            dest_obj["localTransport"] = []

    # 4. Activities
    cur = db.execute("SELECT * FROM activities WHERE destination_id = ? AND (is_active = 1 OR is_active IS NULL) ORDER BY id ASC", (clean_id,))
    act_rows = [dict(r) for r in cur.fetchall()]
    if act_rows:
        dest_obj["activities"] = [{
            "id": r["id"],
            "destination_id": r["destination_id"],
            "name": r["name"],
            "price": r["price"],
            "priceNum": r.get("price_num") if r.get("price_num") else _extract_num(r.get("price")),
            "duration": r.get("duration") or "2 Hours",
            "badge": r.get("badge") or "",
            "category": r.get("category") or "Sightseeing",
            "image": r.get("image") or "",
            "description": r.get("description") or "",
            "location": r.get("location") or "",
            "rating": float(r.get("rating") or 4.8),
            "is_active": 1 if r.get("is_active") is None or r.get("is_active") == 1 else 0
        } for r in act_rows]
    else:
        cur_all = db.execute("SELECT COUNT(*) as c FROM activities WHERE destination_id = ?", (clean_id,))
        c_row = cur_all.fetchone()
        c = c_row["c"] if isinstance(c_row, dict) else c_row[0]
        if c > 0:
            dest_obj["activities"] = []

    # 5. Food
    cur = db.execute("SELECT * FROM food_items WHERE destination_id = ? AND (is_active = 1 OR is_active IS NULL) ORDER BY id ASC", (clean_id,))
    food_rows = [dict(r) for r in cur.fetchall()]
    if food_rows:
        dest_obj["food"] = [{
            "id": r["id"],
            "destination_id": r["destination_id"],
            "name": r["name"],
            "type": r["type"],
            "place": r.get("place") or "",
            "isVeg": bool(r.get("is_veg", 0)),
            "image": r.get("image") or "",
            "category": r.get("category") or "Standard",
            "price": f"₹{r.get('price_num')}" if r.get("price_num") else "",
            "priceNum": r.get("price_num", 0),
            "is_active": 1 if r.get("is_active") is None or r.get("is_active") == 1 else 0
        } for r in food_rows]
    else:
        cur_all = db.execute("SELECT COUNT(*) as c FROM food_items WHERE destination_id = ?", (clean_id,))
        c_row = cur_all.fetchone()
        c = c_row["c"] if isinstance(c_row, dict) else c_row[0]
        if c > 0:
            dest_obj["food"] = []


@app.get("/api/destinations")
def list_destinations():
    with DatabaseSession() as db:
        cur = db.execute("SELECT * FROM destinations WHERE (is_active = 1 OR is_active IS NULL) ORDER BY name ASC")
        rows = cur.fetchall()
        result = [_format_destination(dict(r), include_details=False) for r in rows]
    return result


@app.get("/api/destinations/{dest_id}")
def get_destination_details(dest_id: str):
    clean_id = dest_id.strip().lower()
    with DatabaseSession() as db:
        cur = db.execute("SELECT * FROM destinations WHERE id = ?", (clean_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Destination '{dest_id}' not found")
        dest = _format_destination(dict(row), include_details=True)
        _populate_destination_relational_items(clean_id, dest, db)
    return dest


def _map_wmo_code(code: int) -> tuple[str, str]:
    """Map WMO weather interpretation codes to conditions and icons."""
    if code == 0:
        return "Clear Sky", "Sun"
    elif code in (1, 2):
        return "Mainly Clear", "CloudSun"
    elif code == 3:
        return "Overcast", "Cloud"
    elif code in (45, 48):
        return "Foggy", "CloudFog"
    elif code in (51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82):
        return "Rainy", "CloudRain"
    elif code in (71, 73, 75, 77, 85, 86):
        return "Snowy", "CloudSnow"
    elif code in (95, 96, 99):
        return "Thunderstorm", "CloudLightning"
    return "Partly Cloudy", "CloudSun"


def _fetch_weather_openweather(lat: float, lon: float, api_key: str):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    resp = requests.get(url, timeout=5)
    if resp.status_code == 200:
        data = resp.json()
        main = data.get("main", {})
        weather_list = data.get("weather", [{}])
        cond = weather_list[0].get("main", "Clear")
        desc = weather_list[0].get("description", cond).title()
        wind = data.get("wind", {})
        c_lower = cond.lower()
        if "clear" in c_lower:
            icon = "Sun"
        elif "rain" in c_lower or "drizzle" in c_lower:
            icon = "CloudRain"
        elif "snow" in c_lower:
            icon = "CloudSnow"
        elif "thunder" in c_lower:
            icon = "CloudLightning"
        elif "cloud" in c_lower:
            icon = "CloudSun"
        else:
            icon = "Cloud"
        return {
            "temperature": round(main.get("temp", 20)),
            "condition": desc,
            "feels_like": round(main.get("feels_like", main.get("temp", 20))),
            "humidity": round(main.get("humidity", 50)),
            "wind_speed": round(wind.get("speed", 10) * 3.6),
            "icon": icon
        }
    return None


def _fetch_weather_openmeteo(lat: float, lon: float):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
    resp = requests.get(url, timeout=5)
    if resp.status_code == 200:
        data = resp.json()
        curr = data.get("current", {})
        wmo_code = int(curr.get("weather_code", 0))
        cond, icon = _map_wmo_code(wmo_code)
        return {
            "temperature": round(curr.get("temperature_2m", 20)),
            "condition": cond,
            "feels_like": round(curr.get("apparent_temperature", curr.get("temperature_2m", 20))),
            "humidity": round(curr.get("relative_humidity_2m", 50)),
            "wind_speed": round(curr.get("wind_speed_10m", 10)),
            "icon": icon
        }
    return None


@app.get("/api/weather/{destination_id}")
def get_destination_weather(destination_id: str):
    clean_id = destination_id.strip().lower()
    with DatabaseSession() as db:
        cur = db.execute("SELECT id, name, latitude, longitude FROM destinations WHERE id = ?", (clean_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Destination '{destination_id}' not found")
        dest = dict(row)

    lat = float(dest.get("latitude") or 0.0)
    lng = float(dest.get("longitude") or 0.0)
    if lat == 0.0 and lng == 0.0:
        raise HTTPException(status_code=404, detail="Coordinates unavailable for destination")

    weather_data = None
    owm_key = os.environ.get("OPENWEATHER_API_KEY") or os.environ.get("WEATHER_API_KEY")
    if owm_key:
        try:
            weather_data = _fetch_weather_openweather(lat, lng, owm_key)
        except Exception:
            weather_data = None

    if not weather_data:
        try:
            weather_data = _fetch_weather_openmeteo(lat, lng)
        except Exception:
            weather_data = None

    if not weather_data:
        # Fallback to realistic regional climate estimation if external APIs are temporarily unavailable
        temp = 28 if abs(lat) < 25 else 22
        weather_data = {
            "temperature": temp,
            "condition": "Sunny" if lat > 20 else "Partly Cloudy",
            "feels_like": temp + 1,
            "humidity": 45,
            "wind_speed": 12,
            "icon": "Sun" if lat > 20 else "CloudSun"
        }

    return {
        "success": True,
        "destination_id": clean_id,
        "destination_name": dest["name"],
        "latitude": lat,
        "longitude": lng,
        **weather_data
    }


@app.post("/api/recommendations")
def get_recommendations(req: RecommendationRequest):
    with DatabaseSession() as db:
        cur = db.execute("SELECT * FROM destinations WHERE (is_active = 1 OR is_active IS NULL)")
        rows = cur.fetchall()
        destinations = [_format_destination(dict(r), include_details=True) for r in rows]
        for d in destinations:
            _populate_destination_relational_items(d["id"], d, db)

    if not destinations:
        return {
            "success": True,
            "count": 0,
            "recommendations": []
        }

    prefs = {
        "budget": req.budget,
        "duration": req.duration,
        "days": req.days,
        "nights": req.nights,
        "travelers": req.travelers,
        "traveling_with": req.traveling_with,
        "interest": req.interest,
        "season": req.season,
        "destination": req.destination
    }

    results = recommender.recommend(destinations, prefs, top_n=6)
    return {
        "success": True,
        "count": len(results),
        "recommendations": results
    }


@app.post("/api/recommendations/preview")
def get_recommendations_preview(req: RecommendationPreviewRequest):
    with DatabaseSession() as db:
        cur = db.execute("SELECT * FROM destinations WHERE (is_active = 1 OR is_active IS NULL)")
        rows = cur.fetchall()
        destinations = [_format_destination(dict(r), include_details=True) for r in rows]
        for d in destinations:
            _populate_destination_relational_items(d["id"], d, db)

    if not destinations:
        return {
            "success": True,
            "count": 0,
            "recommendations": []
        }

    prefs = {
        "budget": req.budget,
        "duration": req.duration,
        "days": req.days,
        "nights": req.nights,
        "travelers": req.travelers,
        "traveling_with": req.traveling_with,
        "interest": req.interest,
        "season": req.season,
        "destination": req.destination
    }

    results = recommender.recommend(destinations, prefs, top_n=len(destinations))
    return {
        "success": True,
        "count": len(results),
        "recommendations": results
    }



# ----------------- ADMIN CATALOG INVENTORY ENDPOINTS -----------------

# 1. Destinations Management
@app.get("/api/admin/destinations")
def admin_list_destinations(admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        cur = db.execute("SELECT * FROM destinations ORDER BY name ASC")
        rows = cur.fetchall()
        result = [_format_destination(dict(r), include_details=False) for r in rows]
    return result


@app.post("/api/admin/destinations")
def admin_create_destination(req: DestinationSaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.name.lower().replace(" ", "-").replace("(", "").replace(")", "").strip()
    if not dest_id:
        dest_id = f"dest-{secrets.randbelow(9000) + 1000}"
    with DatabaseSession() as db:
        db.execute("""
            INSERT OR REPLACE INTO destinations (
                id, name, location, region, country, description, tagline, image,
                category, rating, reviews_count, estimated_budget, base_price,
                duration, best_season, activities, latitude, longitude, tags, details, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 0.0, 0.0, ?, '{}', ?)
        """, (
            dest_id,
            req.name,
            req.region or req.name,
            req.region or req.name,
            req.country or "India",
            req.description or req.tagline or "",
            req.tagline or req.description or "",
            req.image or "",
            req.category or "Mountains",
            float(req.rating or 4.8),
            int(req.reviews_count or 100),
            int(req.base_price),
            int(req.base_price),
            req.duration or "3 Days / 2 Nights",
            req.best_season or "Winter",
            req.tags or "Handcrafted,Curated",
            1 if req.is_active is None or req.is_active == 1 else 0
        ))
        db.commit()

        cur = db.execute("SELECT * FROM destinations WHERE id = ?", (dest_id,))
        created = _format_destination(dict(cur.fetchone()), include_details=True)
        _populate_destination_relational_items(dest_id, created, db)
    return {"success": True, "destination": created}


@app.put("/api/admin/destinations/{dest_id}")
def admin_update_destination(dest_id: str, req: DestinationSaveRequest, admin_id: int = Depends(require_admin_user)):
    clean_id = dest_id.strip().lower()
    with DatabaseSession() as db:
        cur = db.execute("SELECT * FROM destinations WHERE id = ?", (clean_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Destination not found")

        db.execute("""
            UPDATE destinations SET
                name = ?, location = ?, region = ?, country = ?, description = ?,
                tagline = ?, image = ?, category = ?, rating = ?, reviews_count = ?,
                estimated_budget = ?, base_price = ?, duration = ?, best_season = ?,
                tags = ?, is_active = ?
            WHERE id = ?
        """, (
            req.name,
            req.region or req.name,
            req.region or req.name,
            req.country or "India",
            req.description or req.tagline or "",
            req.tagline or req.description or "",
            req.image or "",
            req.category or "Mountains",
            float(req.rating or 4.8),
            int(req.reviews_count or 100),
            int(req.base_price),
            int(req.base_price),
            req.duration or "3 Days / 2 Nights",
            req.best_season or "Winter",
            req.tags or "",
            1 if req.is_active is None or req.is_active == 1 else 0,
            clean_id
        ))
        db.commit()

        cur = db.execute("SELECT * FROM destinations WHERE id = ?", (clean_id,))
        updated = _format_destination(dict(cur.fetchone()), include_details=True)
        _populate_destination_relational_items(clean_id, updated, db)
    return {"success": True, "destination": updated}


@app.patch("/api/admin/destinations/{dest_id}/status")
def admin_toggle_destination_status(dest_id: str, req: ItemStatusToggleRequest, admin_id: int = Depends(require_admin_user)):
    clean_id = dest_id.strip().lower()
    with DatabaseSession() as db:
        cur = db.execute("SELECT is_active FROM destinations WHERE id = ?", (clean_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Destination not found")
        curr_status = row["is_active"] if isinstance(row, dict) else row[0]
        new_status = req.is_active if req.is_active is not None else (0 if curr_status == 1 else 1)

        db.execute("UPDATE destinations SET is_active = ? WHERE id = ?", (new_status, clean_id))
        db.commit()

        cur = db.execute("SELECT * FROM destinations WHERE id = ?", (clean_id,))
        updated = _format_destination(dict(cur.fetchone()), include_details=False)
    return {"success": True, "destination": updated, "is_active": new_status}


@app.delete("/api/admin/destinations/{dest_id}")
def admin_delete_destination(dest_id: str, admin_id: int = Depends(require_admin_user)):
    clean_id = dest_id.strip().lower()
    with DatabaseSession() as db:
        # Soft-deactivate to safely keep historic bookings intact
        db.execute("UPDATE destinations SET is_active = 0 WHERE id = ?", (clean_id,))
        db.commit()
    return {"success": True, "message": f"Destination '{clean_id}' deactivated successfully", "id": clean_id}


@app.patch("/api/destinations/{dest_id}/price")
def update_destination_price(dest_id: str, req: DestinationPriceUpdate, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        db.execute(
            "UPDATE destinations SET base_price = ?, estimated_budget = ? WHERE id = ?",
            (req.base_price, req.base_price, dest_id)
        )
        db.commit()

        cur = db.execute("SELECT * FROM destinations WHERE id = ?", (dest_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Destination not found")
        updated = _format_destination(dict(row), include_details=True)
    return {"success": True, "destination": updated}


# 2. Stays Management
@app.get("/api/admin/stays")
def admin_list_stays(
    destination_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin_id: int = Depends(require_admin_user)
):
    with DatabaseSession() as db:
        query = """
            SELECT s.*, d.name as destination_name
            FROM stays s
            LEFT JOIN destinations d ON s.destination_id = d.id
            WHERE 1=1
        """
        params = []
        if destination_id and destination_id != "All":
            query += " AND s.destination_id = ?"
            params.append(destination_id.strip().lower())
        if status and status != "All":
            val = 1 if status.lower() == "active" else 0
            query += " AND (s.is_active = ? OR (? = 1 AND s.is_active IS NULL))"
            params.extend([val, val])
        if search and search.strip():
            term = f"%{search.strip()}%"
            query += " AND (s.name LIKE ? OR s.type LIKE ? OR d.name LIKE ?)"
            params.extend([term, term, term])

        query += " ORDER BY s.id DESC"
        cur = db.execute(query, tuple(params))
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["is_active"] = 1 if d.get("is_active") is None or d.get("is_active") == 1 else 0
            d["priceNum"] = d.get("price_num") or _extract_num(d.get("price"))
            result.append(d)
    return result


@app.post("/api/admin/stays")
def admin_create_stay(req: StaySaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    price_num = req.price_num if req.price_num else _extract_num(req.price)
    with DatabaseSession() as db:
        cur = db.execute("""
            INSERT INTO stays (destination_id, name, type, price, price_num, rating, image, description, amenities, location, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dest_id, req.name, req.type, req.price, price_num, float(req.rating or 4.8),
            req.image or "", req.description or "", req.amenities or "", req.location or "",
            1 if req.is_active is None or req.is_active == 1 else 0
        ))
        db.commit()
        stay_id = cur.lastrowid

        cur = db.execute("""
            SELECT s.*, d.name as destination_name
            FROM stays s
            LEFT JOIN destinations d ON s.destination_id = d.id
            WHERE s.id = ?
        """, (stay_id,))
        created = dict(cur.fetchone())
        created["is_active"] = 1 if created.get("is_active") is None or created.get("is_active") == 1 else 0
    return {"success": True, "stay": created}


@app.put("/api/admin/stays/{stay_id}")
def admin_update_stay(stay_id: int, req: StaySaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    price_num = req.price_num if req.price_num else _extract_num(req.price)
    with DatabaseSession() as db:
        db.execute("""
            UPDATE stays SET
                destination_id = ?, name = ?, type = ?, price = ?, price_num = ?,
                rating = ?, image = ?, description = ?, amenities = ?, location = ?, is_active = ?
            WHERE id = ?
        """, (
            dest_id, req.name, req.type, req.price, price_num, float(req.rating or 4.8),
            req.image or "", req.description or "", req.amenities or "", req.location or "",
            1 if req.is_active is None or req.is_active == 1 else 0,
            stay_id
        ))
        db.commit()

        cur = db.execute("""
            SELECT s.*, d.name as destination_name
            FROM stays s
            LEFT JOIN destinations d ON s.destination_id = d.id
            WHERE s.id = ?
        """, (stay_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Stay not found")
        updated = dict(row)
        updated["is_active"] = 1 if updated.get("is_active") is None or updated.get("is_active") == 1 else 0
    return {"success": True, "stay": updated}


@app.patch("/api/admin/stays/{stay_id}/status")
def admin_toggle_stay_status(stay_id: int, req: ItemStatusToggleRequest, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        cur = db.execute("SELECT is_active FROM stays WHERE id = ?", (stay_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Stay not found")
        curr_status = row["is_active"] if isinstance(row, dict) else row[0]
        new_status = req.is_active if req.is_active is not None else (0 if curr_status == 1 else 1)

        db.execute("UPDATE stays SET is_active = ? WHERE id = ?", (new_status, stay_id))
        db.commit()
    return {"success": True, "id": stay_id, "is_active": new_status}


@app.delete("/api/admin/stays/{stay_id}")
def admin_delete_stay(stay_id: int, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        db.execute("UPDATE stays SET is_active = 0 WHERE id = ?", (stay_id,))
        db.commit()
    return {"success": True, "message": f"Stay {stay_id} deactivated", "id": stay_id}


# 3. Transport Management (Intercity & Local Transit)
@app.get("/api/admin/transport")
def admin_list_transport(
    destination_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin_id: int = Depends(require_admin_user)
):
    with DatabaseSession() as db:
        query = """
            SELECT t.*, d.name as destination_name
            FROM transport_options t
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE 1=1
        """
        params = []
        if destination_id and destination_id != "All":
            query += " AND t.destination_id = ?"
            params.append(destination_id.strip().lower())
        if status and status != "All":
            val = 1 if status.lower() == "active" else 0
            query += " AND (t.is_active = ? OR (? = 1 AND t.is_active IS NULL))"
            params.extend([val, val])
        if search and search.strip():
            term = f"%{search.strip()}%"
            query += " AND (t.mode LIKE ? OR t.detail LIKE ? OR t.provider LIKE ? OR d.name LIKE ?)"
            params.extend([term, term, term, term])

        query += " ORDER BY t.id DESC"
        cur = db.execute(query, tuple(params))
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["is_active"] = 1 if d.get("is_active") is None or d.get("is_active") == 1 else 0
            d["priceNum"] = d.get("price_num") or _extract_num(d.get("est_cost"))
            result.append(d)
    return result


@app.post("/api/admin/transport")
def admin_create_transport(req: TransportSaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    price_num = req.price_num if req.price_num else _extract_num(req.est_cost)
    est_cost = req.est_cost or (f"₹{price_num}" if price_num else "")
    with DatabaseSession() as db:
        cur = db.execute("""
            INSERT INTO transport_options (destination_id, mode, detail, icon, est_time, est_cost, price_num, type, provider, image, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dest_id, req.mode, req.detail, req.icon or "Plane", req.est_time or "",
            est_cost, price_num, req.type or "Intercity", req.provider or "", req.image or "",
            1 if req.is_active is None or req.is_active == 1 else 0
        ))
        db.commit()
        trans_id = cur.lastrowid

        cur = db.execute("""
            SELECT t.*, d.name as destination_name
            FROM transport_options t
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.id = ?
        """, (trans_id,))
        created = dict(cur.fetchone())
        created["is_active"] = 1 if created.get("is_active") is None or created.get("is_active") == 1 else 0
    return {"success": True, "transport": created}


@app.put("/api/admin/transport/{trans_id}")
def admin_update_transport(trans_id: int, req: TransportSaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    price_num = req.price_num if req.price_num else _extract_num(req.est_cost)
    est_cost = req.est_cost or (f"₹{price_num}" if price_num else "")
    with DatabaseSession() as db:
        db.execute("""
            UPDATE transport_options SET
                destination_id = ?, mode = ?, detail = ?, icon = ?, est_time = ?,
                est_cost = ?, price_num = ?, type = ?, provider = ?, image = ?, is_active = ?
            WHERE id = ?
        """, (
            dest_id, req.mode, req.detail, req.icon or "Plane", req.est_time or "",
            est_cost, price_num, req.type or "Intercity", req.provider or "", req.image or "",
            1 if req.is_active is None or req.is_active == 1 else 0,
            trans_id
        ))
        db.commit()

        cur = db.execute("""
            SELECT t.*, d.name as destination_name
            FROM transport_options t
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.id = ?
        """, (trans_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transport option not found")
        updated = dict(row)
        updated["is_active"] = 1 if updated.get("is_active") is None or updated.get("is_active") == 1 else 0
    return {"success": True, "transport": updated}


@app.patch("/api/admin/transport/{trans_id}/status")
def admin_toggle_transport_status(trans_id: int, req: ItemStatusToggleRequest, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        cur = db.execute("SELECT is_active FROM transport_options WHERE id = ?", (trans_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transport option not found")
        curr_status = row["is_active"] if isinstance(row, dict) else row[0]
        new_status = req.is_active if req.is_active is not None else (0 if curr_status == 1 else 1)

        db.execute("UPDATE transport_options SET is_active = ? WHERE id = ?", (new_status, trans_id))
        db.commit()
    return {"success": True, "id": trans_id, "is_active": new_status}


@app.delete("/api/admin/transport/{trans_id}")
def admin_delete_transport(trans_id: int, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        db.execute("UPDATE transport_options SET is_active = 0 WHERE id = ?", (trans_id,))
        db.commit()
    return {"success": True, "message": f"Transport {trans_id} deactivated", "id": trans_id}


# 4. Vehicle Rentals Management
@app.get("/api/admin/rentals")
def admin_list_rentals(
    destination_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin_id: int = Depends(require_admin_user)
):
    with DatabaseSession() as db:
        query = """
            SELECT r.*, d.name as destination_name
            FROM vehicle_rentals r
            LEFT JOIN destinations d ON r.destination_id = d.id
            WHERE 1=1
        """
        params = []
        if destination_id and destination_id != "All":
            query += " AND r.destination_id = ?"
            params.append(destination_id.strip().lower())
        if status and status != "All":
            val = 1 if status.lower() == "active" else 0
            query += " AND (r.is_active = ? OR (? = 1 AND r.is_active IS NULL))"
            params.extend([val, val])
        if search and search.strip():
            term = f"%{search.strip()}%"
            query += " AND (r.option_name LIKE ? OR r.type LIKE ? OR r.provider LIKE ? OR d.name LIKE ?)"
            params.extend([term, term, term, term])

        query += " ORDER BY r.id DESC"
        cur = db.execute(query, tuple(params))
        rows = cur.fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["is_active"] = 1 if d.get("is_active") is None or d.get("is_active") == 1 else 0
            d["costNum"] = d.get("cost_num") or _extract_num(d.get("cost"))
            result.append(d)
    return result


@app.post("/api/admin/rentals")
def admin_create_rental(req: RentalSaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    cost_num = req.cost_num if req.cost_num else _extract_num(req.cost)
    with DatabaseSession() as db:
        cur = db.execute("""
            INSERT INTO vehicle_rentals (destination_id, option_name, type, cost, cost_num, note, image, provider, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dest_id, req.option_name, req.type or "Cab", req.cost, cost_num,
            req.note or "", req.image or "", req.provider or "",
            1 if req.is_active is None or req.is_active == 1 else 0
        ))
        db.commit()
        rental_id = cur.lastrowid

        cur = db.execute("""
            SELECT r.*, d.name as destination_name
            FROM vehicle_rentals r
            LEFT JOIN destinations d ON r.destination_id = d.id
            WHERE r.id = ?
        """, (rental_id,))
        created = dict(cur.fetchone())
        created["is_active"] = 1 if created.get("is_active") is None or created.get("is_active") == 1 else 0
    return {"success": True, "rental": created}


@app.put("/api/admin/rentals/{rental_id}")
def admin_update_rental(rental_id: int, req: RentalSaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    cost_num = req.cost_num if req.cost_num else _extract_num(req.cost)
    with DatabaseSession() as db:
        db.execute("""
            UPDATE vehicle_rentals SET
                destination_id = ?, option_name = ?, type = ?, cost = ?, cost_num = ?,
                note = ?, image = ?, provider = ?, is_active = ?
            WHERE id = ?
        """, (
            dest_id, req.option_name, req.type or "Cab", req.cost, cost_num,
            req.note or "", req.image or "", req.provider or "",
            1 if req.is_active is None or req.is_active == 1 else 0,
            rental_id
        ))
        db.commit()

        cur = db.execute("""
            SELECT r.*, d.name as destination_name
            FROM vehicle_rentals r
            LEFT JOIN destinations d ON r.destination_id = d.id
            WHERE r.id = ?
        """, (rental_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Vehicle rental not found")
        updated = dict(row)
        updated["is_active"] = 1 if updated.get("is_active") is None or updated.get("is_active") == 1 else 0
    return {"success": True, "rental": updated}


@app.patch("/api/admin/rentals/{rental_id}/status")
def admin_toggle_rental_status(rental_id: int, req: ItemStatusToggleRequest, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        cur = db.execute("SELECT is_active FROM vehicle_rentals WHERE id = ?", (rental_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Vehicle rental not found")
        curr_status = row["is_active"] if isinstance(row, dict) else row[0]
        new_status = req.is_active if req.is_active is not None else (0 if curr_status == 1 else 1)

        db.execute("UPDATE vehicle_rentals SET is_active = ? WHERE id = ?", (new_status, rental_id))
        db.commit()
    return {"success": True, "id": rental_id, "is_active": new_status}


@app.delete("/api/admin/rentals/{rental_id}")
def admin_delete_rental(rental_id: int, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        db.execute("UPDATE vehicle_rentals SET is_active = 0 WHERE id = ?", (rental_id,))
        db.commit()
    return {"success": True, "message": f"Rental {rental_id} deactivated", "id": rental_id}


# 5. Activities Management
@app.get("/api/admin/activities")
def admin_list_activities(
    destination_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin_id: int = Depends(require_admin_user)
):
    with DatabaseSession() as db:
        query = """
            SELECT a.*, d.name as destination_name
            FROM activities a
            LEFT JOIN destinations d ON a.destination_id = d.id
            WHERE 1=1
        """
        params = []
        if destination_id and destination_id != "All":
            query += " AND a.destination_id = ?"
            params.append(destination_id.strip().lower())
        if status and status != "All":
            val = 1 if status.lower() == "active" else 0
            query += " AND (a.is_active = ? OR (? = 1 AND a.is_active IS NULL))"
            params.extend([val, val])
        if search and search.strip():
            term = f"%{search.strip()}%"
            query += " AND (a.name LIKE ? OR a.category LIKE ? OR a.badge LIKE ? OR d.name LIKE ?)"
            params.extend([term, term, term, term])

        query += " ORDER BY a.id DESC"
        cur = db.execute(query, tuple(params))
        rows = cur.fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["is_active"] = 1 if d.get("is_active") is None or d.get("is_active") == 1 else 0
            d["priceNum"] = d.get("price_num") or _extract_num(d.get("price"))
            result.append(d)
    return result


@app.post("/api/admin/activities")
def admin_create_activity(req: ActivitySaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    price_num = req.price_num if req.price_num else _extract_num(req.price)
    with DatabaseSession() as db:
        cur = db.execute("""
            INSERT INTO activities (destination_id, name, price, price_num, duration, badge, category, image, description, location, rating, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dest_id, req.name, req.price, price_num, req.duration or "2 Hours",
            req.badge or "", req.category or "Sightseeing", req.image or "",
            req.description or "", req.location or "", float(req.rating or 4.8),
            1 if req.is_active is None or req.is_active == 1 else 0
        ))
        db.commit()
        act_id = cur.lastrowid

        cur = db.execute("""
            SELECT a.*, d.name as destination_name
            FROM activities a
            LEFT JOIN destinations d ON a.destination_id = d.id
            WHERE a.id = ?
        """, (act_id,))
        created = dict(cur.fetchone())
        created["is_active"] = 1 if created.get("is_active") is None or created.get("is_active") == 1 else 0
    return {"success": True, "activity": created}


@app.put("/api/admin/activities/{act_id}")
def admin_update_activity(act_id: int, req: ActivitySaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    price_num = req.price_num if req.price_num else _extract_num(req.price)
    with DatabaseSession() as db:
        db.execute("""
            UPDATE activities SET
                destination_id = ?, name = ?, price = ?, price_num = ?, duration = ?,
                badge = ?, category = ?, image = ?, description = ?, location = ?, rating = ?, is_active = ?
            WHERE id = ?
        """, (
            dest_id, req.name, req.price, price_num, req.duration or "2 Hours",
            req.badge or "", req.category or "Sightseeing", req.image or "",
            req.description or "", req.location or "", float(req.rating or 4.8),
            1 if req.is_active is None or req.is_active == 1 else 0,
            act_id
        ))
        db.commit()

        cur = db.execute("""
            SELECT a.*, d.name as destination_name
            FROM activities a
            LEFT JOIN destinations d ON a.destination_id = d.id
            WHERE a.id = ?
        """, (act_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Activity not found")
        updated = dict(row)
        updated["is_active"] = 1 if updated.get("is_active") is None or updated.get("is_active") == 1 else 0
    return {"success": True, "activity": updated}


@app.patch("/api/admin/activities/{act_id}/status")
def admin_toggle_activity_status(act_id: int, req: ItemStatusToggleRequest, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        cur = db.execute("SELECT is_active FROM activities WHERE id = ?", (act_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Activity not found")
        curr_status = row["is_active"] if isinstance(row, dict) else row[0]
        new_status = req.is_active if req.is_active is not None else (0 if curr_status == 1 else 1)

        db.execute("UPDATE activities SET is_active = ? WHERE id = ?", (new_status, act_id))
        db.commit()
    return {"success": True, "id": act_id, "is_active": new_status}


@app.delete("/api/admin/activities/{act_id}")
def admin_delete_activity(act_id: int, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        db.execute("UPDATE activities SET is_active = 0 WHERE id = ?", (act_id,))
        db.commit()
    return {"success": True, "message": f"Activity {act_id} deactivated", "id": act_id}


# 6. Food & Dining Management
@app.get("/api/admin/food")
def admin_list_food(
    destination_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin_id: int = Depends(require_admin_user)
):
    with DatabaseSession() as db:
        query = """
            SELECT f.*, d.name as destination_name
            FROM food_items f
            LEFT JOIN destinations d ON f.destination_id = d.id
            WHERE 1=1
        """
        params = []
        if destination_id and destination_id != "All":
            query += " AND f.destination_id = ?"
            params.append(destination_id.strip().lower())
        if status and status != "All":
            val = 1 if status.lower() == "active" else 0
            query += " AND (f.is_active = ? OR (? = 1 AND f.is_active IS NULL))"
            params.extend([val, val])
        if search and search.strip():
            term = f"%{search.strip()}%"
            query += " AND (f.name LIKE ? OR f.type LIKE ? OR f.place LIKE ? OR d.name LIKE ?)"
            params.extend([term, term, term, term])

        query += " ORDER BY f.id DESC"
        cur = db.execute(query, tuple(params))
        rows = cur.fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["is_active"] = 1 if d.get("is_active") is None or d.get("is_active") == 1 else 0
            d["priceNum"] = d.get("price_num") or 0
            d["isVeg"] = bool(d.get("is_veg", 0))
            result.append(d)
    return result


@app.post("/api/admin/food")
def admin_create_food(req: FoodSaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    with DatabaseSession() as db:
        cur = db.execute("""
            INSERT INTO food_items (destination_id, name, type, place, is_veg, image, category, price_num, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dest_id, req.name, req.type, req.place or "", 1 if req.is_veg else 0,
            req.image or "", req.category or "Standard", req.price_num or 0,
            1 if req.is_active is None or req.is_active == 1 else 0
        ))
        db.commit()
        food_id = cur.lastrowid

        cur = db.execute("""
            SELECT f.*, d.name as destination_name
            FROM food_items f
            LEFT JOIN destinations d ON f.destination_id = d.id
            WHERE f.id = ?
        """, (food_id,))
        created = dict(cur.fetchone())
        created["is_active"] = 1 if created.get("is_active") is None or created.get("is_active") == 1 else 0
        created["isVeg"] = bool(created.get("is_veg", 0))
    return {"success": True, "food": created}


@app.put("/api/admin/food/{food_id}")
def admin_update_food(food_id: int, req: FoodSaveRequest, admin_id: int = Depends(require_admin_user)):
    dest_id = req.destination_id.strip().lower()
    with DatabaseSession() as db:
        db.execute("""
            UPDATE food_items SET
                destination_id = ?, name = ?, type = ?, place = ?, is_veg = ?,
                image = ?, category = ?, price_num = ?, is_active = ?
            WHERE id = ?
        """, (
            dest_id, req.name, req.type, req.place or "", 1 if req.is_veg else 0,
            req.image or "", req.category or "Standard", req.price_num or 0,
            1 if req.is_active is None or req.is_active == 1 else 0,
            food_id
        ))
        db.commit()

        cur = db.execute("""
            SELECT f.*, d.name as destination_name
            FROM food_items f
            LEFT JOIN destinations d ON f.destination_id = d.id
            WHERE f.id = ?
        """, (food_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Food item not found")
        updated = dict(row)
        updated["is_active"] = 1 if updated.get("is_active") is None or updated.get("is_active") == 1 else 0
        updated["isVeg"] = bool(updated.get("is_veg", 0))
    return {"success": True, "food": updated}


@app.patch("/api/admin/food/{food_id}/status")
def admin_toggle_food_status(food_id: int, req: ItemStatusToggleRequest, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        cur = db.execute("SELECT is_active FROM food_items WHERE id = ?", (food_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Food item not found")
        curr_status = row["is_active"] if isinstance(row, dict) else row[0]
        new_status = req.is_active if req.is_active is not None else (0 if curr_status == 1 else 1)

        db.execute("UPDATE food_items SET is_active = ? WHERE id = ?", (new_status, food_id))
        db.commit()
    return {"success": True, "id": food_id, "is_active": new_status}


@app.delete("/api/admin/food/{food_id}")
def admin_delete_food(food_id: int, admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        db.execute("UPDATE food_items SET is_active = 0 WHERE id = ?", (food_id,))
        db.commit()
    return {"success": True, "message": f"Food item {food_id} deactivated", "id": food_id}


# ----------------- WISHLIST -----------------

@app.get("/api/wishlist")
def get_wishlist(user_id: Optional[int] = Depends(get_current_user_id)):
    if not user_id:
        return []
    with DatabaseSession() as db:
        cur = db.execute("SELECT destination_id FROM wishlist WHERE user_id = ?", (user_id,))
        result = [r["destination_id"] if isinstance(r, dict) else r[0] for r in cur.fetchall()]
    return result


@app.post("/api/wishlist/toggle")
def toggle_wishlist(req: WishlistToggleRequest, user_id: Optional[int] = Depends(get_current_user_id)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required to update wishlist. Please log in.")

    with DatabaseSession() as db:
        cur = db.execute("SELECT id FROM wishlist WHERE user_id = ? AND destination_id = ?", (user_id, req.destinationId))
        existing = cur.fetchone()
        if existing:
            wid = existing["id"] if isinstance(existing, dict) else existing[0]
            db.execute("DELETE FROM wishlist WHERE id = ?", (wid,))
            action = "removed"
        else:
            db.execute("INSERT INTO wishlist (user_id, destination_id) VALUES (?, ?)", (user_id, req.destinationId))
            action = "added"
        db.commit()

        cur = db.execute("SELECT destination_id FROM wishlist WHERE user_id = ?", (user_id,))
        updated_list = [r["destination_id"] if isinstance(r, dict) else r[0] for r in cur.fetchall()]

    return {"action": action, "wishlist": updated_list}


# ----------------- BOOKINGS -----------------

@app.get("/api/bookings")
def get_bookings(user_id: Optional[int] = Depends(get_current_user_id)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required to view bookings. Please log in.")

    with DatabaseSession() as db:
        cur = db.execute("SELECT role FROM users WHERE id = ?", (user_id,))
        u = cur.fetchone()
        if not u:
            raise HTTPException(status_code=401, detail="User account not found. Please log in again.")
        is_admin = ((u["role"] if isinstance(u, dict) else u[0]) == "admin")

        if is_admin:
            cur = db.execute("SELECT * FROM bookings ORDER BY created_at DESC")
        else:
            cur = db.execute("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC", (user_id,))

        bookings = [_format_booking(dict(r)) for r in cur.fetchall()]
    return bookings


@app.post("/api/bookings")
def create_booking(req: BookingCreateRequest, user_id: Optional[int] = Depends(get_current_user_id)):
    # STRICT GUARD 1: Require authenticated user session
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Authentication required to make a booking. Please log in first."
        )

    # STRICT GUARD 2: Validate travelers count and monetary amount
    if not isinstance(req.travelersCount, int) or req.travelersCount < 1:
        raise HTTPException(status_code=400, detail="Invalid travelers count. Must be at least 1.")
    if not isinstance(req.amount, (int, float)) or req.amount <= 0 or not math.isfinite(req.amount):
        raise HTTPException(status_code=400, detail="Invalid booking amount. A valid positive numeric price is required.")

    valid_amount = int(round(req.amount))
    booking_details_json = json.dumps(req.bookingDetails or {})

    with DatabaseSession() as db:
        # STRICT GUARD 3: Verify user exists in the database
        cur = db.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
        u = cur.fetchone()
        if not u:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user account not found in database. Please log in with a valid account."
            )
        user_row = dict(u)

        booking_id = f"BK-{secrets.randbelow(9000) + 1000}"

        # STRICT GUARD 4: Use authenticated user's ID and contact info
        traveler_name = req.travelerName.strip() if req.travelerName and req.travelerName.strip() else user_row["name"]
        traveler_email = req.travelerEmail.strip() if req.travelerEmail and req.travelerEmail.strip() else user_row["email"]
        traveler_phone = req.travelerPhone.strip() if req.travelerPhone else ""
        initial_status = req.status.strip().title() if req.status and req.status.strip() else "Pending"
        if initial_status not in {"Pending", "Confirmed", "Completed", "Cancelled"}:
            initial_status = "Pending"

        db.execute("""
            INSERT INTO bookings (id, user_id, traveler_name, traveler_email, traveler_phone, destination_id, destination_name, travel_date, travelers_count, amount, status, booking_details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            booking_id,
            user_id,
            traveler_name,
            traveler_email,
            traveler_phone,
            req.destinationId,
            req.destinationName,
            req.travelDate,
            req.travelersCount,
            valid_amount,
            initial_status,
            booking_details_json
        ))
        db.commit()

        cur = db.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,))
        created = _format_booking(dict(cur.fetchone()))

    return {"success": True, "booking": created}


@app.patch("/api/bookings/{booking_id}/status")
def update_booking_status(booking_id: str, req: StatusUpdateRequest, admin_id: int = Depends(require_admin_user)):
    normalized_status = req.status.strip().title()
    allowed_statuses = {"Pending", "Confirmed", "Cancelled", "Completed"}
    if normalized_status not in allowed_statuses:
        normalized_status = "Confirmed"

    with DatabaseSession() as db:
        db.execute("UPDATE bookings SET status = ? WHERE id = ?", (normalized_status, booking_id))
        db.commit()
        cur = db.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Booking not found")
        updated = _format_booking(dict(row))
    return updated


# ----------------- REAL ADMIN METRICS (ZERO FAKE DEFAULT VALUES) -----------------

@app.get("/api/admin/stats")
def get_admin_stats(admin_id: int = Depends(require_admin_user)):
    with DatabaseSession() as db:
        # 1. Users Count
        cur = db.execute("SELECT COUNT(*) as c FROM users")
        u_row = cur.fetchone()
        total_users = (u_row["c"] if isinstance(u_row, dict) else u_row[0]) if u_row else 0

        # 2. Destinations Count (total & active)
        cur = db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 OR is_active IS NULL THEN 1 ELSE 0 END) as active FROM destinations")
        d_row = cur.fetchone()
        total_destinations = (d_row["total"] if isinstance(d_row, dict) else d_row[0]) if d_row else 0
        active_destinations = (d_row["active"] if isinstance(d_row, dict) else d_row[1]) if d_row else 0

        # 3. Stays Count
        cur = db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 OR is_active IS NULL THEN 1 ELSE 0 END) as active FROM stays")
        s_row = cur.fetchone()
        total_stays = (s_row["total"] if isinstance(s_row, dict) else s_row[0]) if s_row else 0
        active_stays = (s_row["active"] if isinstance(s_row, dict) else s_row[1]) if s_row else 0

        # 4. Transport Count
        cur = db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 OR is_active IS NULL THEN 1 ELSE 0 END) as active FROM transport_options")
        t_row = cur.fetchone()
        total_transport = (t_row["total"] if isinstance(t_row, dict) else t_row[0]) if t_row else 0
        active_transport = (t_row["active"] if isinstance(t_row, dict) else t_row[1]) if t_row else 0

        # 5. Rentals Count
        cur = db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 OR is_active IS NULL THEN 1 ELSE 0 END) as active FROM vehicle_rentals")
        r_row = cur.fetchone()
        total_rentals = (r_row["total"] if isinstance(r_row, dict) else r_row[0]) if r_row else 0
        active_rentals = (r_row["active"] if isinstance(r_row, dict) else r_row[1]) if r_row else 0

        # 6. Activities Count
        cur = db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 OR is_active IS NULL THEN 1 ELSE 0 END) as active FROM activities")
        a_row = cur.fetchone()
        total_activities = (a_row["total"] if isinstance(a_row, dict) else a_row[0]) if a_row else 0
        active_activities = (a_row["active"] if isinstance(a_row, dict) else a_row[1]) if a_row else 0

        # 7. Food Count
        cur = db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 OR is_active IS NULL THEN 1 ELSE 0 END) as active FROM food_items")
        f_row = cur.fetchone()
        total_food = (f_row["total"] if isinstance(f_row, dict) else f_row[0]) if f_row else 0
        active_food = (f_row["active"] if isinstance(f_row, dict) else f_row[1]) if f_row else 0

        # 8. Wishlist Count
        cur = db.execute("SELECT COUNT(*) as c FROM wishlist")
        w_row = cur.fetchone()
        total_wishlist = (w_row["c"] if isinstance(w_row, dict) else w_row[0]) if w_row else 0

        # 9. Trips & Revenue
        cur = db.execute("SELECT COUNT(*) as c FROM bookings")
        b_row = cur.fetchone()
        total_trips = (b_row["c"] if isinstance(b_row, dict) else b_row[0]) if b_row else 0

        cur = db.execute("SELECT SUM(amount) as rev FROM bookings WHERE status IN ('Confirmed', 'Completed')")
        rev_row = cur.fetchone()
        total_revenue = (rev_row["rev"] if isinstance(rev_row, dict) else rev_row[0]) if rev_row and (rev_row["rev"] if isinstance(rev_row, dict) else rev_row[0]) is not None else 0

        # 10. Bookings List
        cur = db.execute("SELECT * FROM bookings ORDER BY created_at DESC")
        bookings_list = [_format_booking(dict(r)) for r in cur.fetchall()]

    return {
        "kpis": {
            "totalUsers": int(total_users or 0),
            "destinations": int(total_destinations or 0),
            "totalDestinations": int(total_destinations or 0),
            "activeDestinations": int(active_destinations or 0),
            "totalStays": int(total_stays or 0),
            "activeStays": int(active_stays or 0),
            "totalTransport": int(total_transport or 0),
            "activeTransport": int(active_transport or 0),
            "totalRentals": int(total_rentals or 0),
            "activeRentals": int(active_rentals or 0),
            "totalActivities": int(total_activities or 0),
            "activeActivities": int(active_activities or 0),
            "totalFood": int(total_food or 0),
            "activeFood": int(active_food or 0),
            "totalWishlist": int(total_wishlist or 0),
            "tripsCreated": int(total_trips or 0),
            "totalTrips": int(total_trips or 0),
            "totalRevenue": int(total_revenue or 0)
        },
        "bookings": bookings_list
    }
