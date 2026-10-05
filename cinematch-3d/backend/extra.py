"""Authentication, media library, recommendations, history, and notifications."""
import os, psycopg2, hmac, hashlib, time, shutil, secrets, math
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from typing import Literal

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "")
MEDIA = "media"
SECRET = (os.getenv("SECRET_KEY") or secrets.token_urlsafe(32)).encode()
router = APIRouter(prefix="/api")

class Conn:
    """Small PostgreSQL wrapper accepting the existing question-mark placeholders."""
    def __init__(self):
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is required. Set it in backend/.env or Render environment variables.")
        self.c = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    def execute(self, sql, args=None):
        cur = self.c.cursor(); cur.execute(sql.replace("?", "%s"), args); return cur
    def executescript(self, script):
        for s in script.split(";"):
            if s.strip(): self.execute(s)
    def __enter__(self): return self
    def __exit__(self, t, v, tb):
        (self.c.rollback if t else self.c.commit)(); self.c.close()

def db(): return Conn()

def hash_pw(pw, salt=None):
    salt = salt or secrets.token_hex(8)
    return salt + "$" + hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 100_000).hex()

def check_pw(pw, stored):
    return hmac.compare_digest(hash_pw(pw, stored.split("$")[0]), stored)

def make_token(uid):
    body = f"{uid}.{int(time.time()) + 7*86400}"
    return body + "." + hmac.new(SECRET, body.encode(), hashlib.sha256).hexdigest()

def current_user(authorization: str = Header(None)):
    try:
        uid, exp, sig = authorization.split(" ")[1].split(".")
        ok = hmac.compare_digest(sig, hmac.new(SECRET, f"{uid}.{exp}".encode(), hashlib.sha256).hexdigest())
        if not ok or int(exp) < time.time(): raise ValueError
    except Exception:
        raise HTTPException(401, "Please log in")
    with db() as c:
        u = c.execute("SELECT id,name,email,role,age,media_types,preferences,username,preferences_set FROM users WHERE id=?", (uid,)).fetchone()
    if not u: raise HTTPException(401, "User not found")
    user = dict(u)
    user["media_types"] = [v for v in (user.get("media_types") or "movie,music").split(",") if v]
    user["preferences"] = [v for v in (user.get("preferences") or "").split(",") if v]
    user["preferences_set"] = bool(user["preferences_set"])
    return user

def admin_only(u=Depends(current_user)):
    if u["role"] != "admin": raise HTTPException(403, "Admins only")
    return u

def init():
    os.makedirs(MEDIA + "/files", exist_ok=True)
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, pw TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user');
        ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS media_types TEXT NOT NULL DEFAULT 'movie,music';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences TEXT NOT NULL DEFAULT '';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences_set BOOLEAN NOT NULL DEFAULT FALSE;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(lower(username)) WHERE username IS NOT NULL;
        CREATE TABLE IF NOT EXISTS media(id SERIAL PRIMARY KEY, title TEXT NOT NULL, type TEXT NOT NULL, genres TEXT NOT NULL DEFAULT '', file TEXT NOT NULL, poster TEXT, created DOUBLE PRECISION NOT NULL);
        CREATE TABLE IF NOT EXISTS views(user_id INT NOT NULL, media_id INT NOT NULL, ts DOUBLE PRECISION NOT NULL);
        CREATE TABLE IF NOT EXISTS notifications(id SERIAL PRIMARY KEY, user_id INT NOT NULL, text TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT FALSE, ts DOUBLE PRECISION NOT NULL);
        CREATE INDEX IF NOT EXISTS idx_views_user ON views(user_id);
        """)

@router.get("/dashboard")
def dashboard(u=Depends(current_user)):
    with db() as c:
        totals = c.execute("SELECT (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM media) AS media, (SELECT COUNT(*) FROM views) AS views").fetchone()
        kinds = c.execute("SELECT type, COUNT(*) AS total FROM media GROUP BY type").fetchall()
    return {**totals, "by_type": {item["type"]: item["total"] for item in kinds}}

@router.get("/user/history")
def user_history(u=Depends(current_user)):
    with db() as c:
        rows = c.execute("SELECT m.id, m.title, m.type, m.genres, v.ts FROM views v JOIN media m ON m.id=v.media_id WHERE v.user_id=? ORDER BY v.ts DESC LIMIT 50", (u["id"],)).fetchall()
    return [{"id": item["id"], "title": item["title"], "type": item["type"], "genres": [g for g in item["genres"].split(",") if g], "viewed_at": item["ts"]} for item in rows]

def mount(app):
    app.mount("/media/files", StaticFiles(directory=MEDIA + "/files"), name="media")

def row(m):
    return {"id": m["id"], "title": m["title"], "type": m["type"], "genres": [g for g in m["genres"].split(",") if g],
            "poster": m["poster"] or f"https://picsum.photos/seed/{m['id']}/300/450", "url": "/media/files/" + m["file"]}

class Signup(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str
    age: int
    media_types: list[str] = []
    preferences: list[str] = []

class Login(BaseModel):
    email: str
    password: str
    role: Literal["user", "admin"] = "user"

class AdminSignup(BaseModel):
    name: str
    username: str
    email: str
    password: str
    confirm_password: str
    admin_key: str

class PreferencesUpdate(BaseModel):
    media_types: list[str]
    preferences: list[str]

def auth_result(user):
    return {
        "token": make_token(user["id"]),
        "user": {
            "id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"],
            "username": user.get("username"), "age": user.get("age"),
            "media_types": [v for v in (user.get("media_types") or "movie,music").split(",") if v],
            "preferences": [v for v in (user.get("preferences") or "").split(",") if v],
            "preferences_set": bool(user.get("preferences_set", False)),
        },
    }

@router.post("/auth/signup")
def signup(b: Signup):
    if b.age < 13 or b.age > 120: raise HTTPException(400, "Age must be between 13 and 120")
    if len(b.password) < 8: raise HTTPException(400, "Password must be at least 8 characters")
    if b.password != b.confirm_password: raise HTTPException(400, "Passwords do not match")
    allowed_media = {"movie", "music"}
    if not b.media_types or not set(b.media_types) <= allowed_media: raise HTTPException(400, "Choose movies, music, or both")
    try:
        with db() as c:
            user = c.execute("INSERT INTO users(name,email,pw,age,media_types,preferences) VALUES(?,?,?,?,?,?) RETURNING id,name,email,role,username,age,media_types,preferences,preferences_set",
                             (b.name.strip(), b.email.strip().lower(), hash_pw(b.password), b.age, ",".join(b.media_types), ",".join(b.preferences))).fetchone()
    except psycopg2.IntegrityError:
        raise HTTPException(400, "Email already registered")
    return auth_result(user)

@router.post("/auth/admin/signup")
def admin_signup(b: AdminSignup):
    configured_key = os.getenv("ADMIN_SIGNUP_KEY", "")
    if not configured_key:
        raise HTTPException(503, "Admin signup is not configured. Set ADMIN_SIGNUP_KEY in backend/.env.")
    if not hmac.compare_digest(b.admin_key, configured_key):
        raise HTTPException(403, "Invalid admin invite key")
    email = b.email.strip().lower()
    username = b.username.strip()
    if not username: raise HTTPException(400, "Username is required")
    if len(b.password) < 8: raise HTTPException(400, "Password must be at least 8 characters")
    if b.password != b.confirm_password: raise HTTPException(400, "Passwords do not match")
    with db() as c:
        if c.execute("SELECT 1 FROM users WHERE email=?", (email,)).fetchone():
            raise HTTPException(400, "Email already registered")
        if c.execute("SELECT 1 FROM users WHERE lower(username)=lower(?)", (username,)).fetchone():
            raise HTTPException(400, "Username already taken")
    try:
        with db() as c:
            user = c.execute("INSERT INTO users(name,username,email,pw,role) VALUES(?,?,?,?,'admin') RETURNING id,name,username,email,role,age,media_types,preferences,preferences_set",
                             (b.name.strip(), username, email, hash_pw(b.password))).fetchone()
    except psycopg2.IntegrityError:
        raise HTTPException(400, "Email or username already registered")
    return auth_result(user)

@router.post("/auth/preferences")
def save_preferences(b: PreferencesUpdate, u=Depends(current_user)):
    allowed_media = {"movie", "music"}
    allowed_preferences = {"Sad", "Feel-good", "Beautiful", "Action", "Thriller", "Horror"}
    if u["role"] != "user": raise HTTPException(403, "User preferences are only available for user accounts")
    if not b.media_types or not set(b.media_types) <= allowed_media: raise HTTPException(400, "Choose movies, music, or both")
    if not b.preferences or not set(b.preferences) <= allowed_preferences: raise HTTPException(400, "Choose at least one mood")
    with db() as c:
        user = c.execute("UPDATE users SET media_types=?,preferences=?,preferences_set=TRUE WHERE id=? RETURNING id,name,email,role,username,age,media_types,preferences,preferences_set",
                         (",".join(b.media_types), ",".join(b.preferences), u["id"])).fetchone()
    return auth_result(user)

@router.post("/auth/login")
def login(b: Login):
    with db() as c:
        u = c.execute("SELECT * FROM users WHERE email=?", (b.email.lower(),)).fetchone()
    if not u or not check_pw(b.password, u["pw"]): raise HTTPException(401, "Wrong email or password")
    if u["role"] != b.role: raise HTTPException(403, f"This account is registered as {u['role']}")
    return auth_result(u)

@router.get("/media")
def list_media(q: str = "", type: str = "", genre: str = "", page: int = 1, size: int = 24):
    sql, args = "SELECT * FROM media WHERE title ILIKE ?", [f"%{q}%"]
    if type: sql += " AND type=?"; args.append(type)
    if genre: sql += " AND genres ILIKE ?"; args.append(f"%{genre}%")
    with db() as c:
        rows = c.execute(sql + " ORDER BY created DESC LIMIT ? OFFSET ?", args + [max(1, min(size, 100)), max(0, (page - 1) * size)]).fetchall()
    return [row(r) for r in rows]

@router.get("/media/recommend")
def recommend_me(method: Literal["content", "collab", "svd", "hybrid"] = "hybrid", u=Depends(current_user)):
    """Rank unseen SQL-backed media from saved preferences and viewing patterns."""
    with db() as c:
        seen = c.execute("SELECT m.* FROM views v JOIN media m ON m.id=v.media_id WHERE v.user_id=?", (u["id"],)).fetchall()
        type_slots = ",".join("?" for _ in u["media_types"])
        allm = c.execute(f"SELECT * FROM media WHERE type IN ({type_slots})", tuple(u["media_types"])).fetchall()
        view_rows = c.execute("SELECT user_id,media_id FROM views").fetchall() if method in {"collab", "svd", "hybrid"} else []
    ids = {s["id"] for s in seen}
    genre_weights = defaultdict(int)
    for s in seen:
        for genre in s["genres"].split(","): genre_weights[genre.strip().casefold()] += 1
    mood_genres = {
        "sad": {"drama"}, "feel-good": {"comedy", "romance"}, "beautiful": {"romance", "sci-fi", "drama"},
        "action": {"action"}, "thriller": {"thriller", "mystery", "action", "horror"}, "horror": {"horror"},
    }
    moods = set().union(*(mood_genres.get(value.casefold(), {value.casefold()}) for value in u["preferences"]))
    user_views = defaultdict(set)
    for item in view_rows:
        user_views[item["user_id"]].add(item["media_id"])
    collaborative = defaultdict(float)
    target_views = user_views[u["id"]]
    for other_id, other_views in user_views.items():
        if other_id == u["id"] or not target_views:
            continue
        similarity = len(target_views & other_views) / math.sqrt(len(target_views) * len(other_views))
        for media_id in other_views - ids:
            collaborative[media_id] += similarity
    def score(media):
        genres = {genre.strip().casefold() for genre in media["genres"].split(",") if genre.strip()}
        affinity = len(moods & genres) + sum(genre_weights[genre] for genre in genres)
        neighbor_score = collaborative[media["id"]]
        if method == "content": return affinity
        if method == "collab": return neighbor_score
        if method == "svd": return affinity + neighbor_score
        return (2 * affinity) + neighbor_score
    unseen = [m for m in allm if m["id"] not in ids]
    unseen.sort(key=lambda m: (score(m), m["created"]), reverse=True)
    return [row(m) for m in unseen[:20]]

@router.get("/media/{mid}")
def get_media(mid: int):
    with db() as c: m = c.execute("SELECT * FROM media WHERE id=?", (mid,)).fetchone()
    if not m: raise HTTPException(404, "Not found")
    return row(m)

@router.post("/media/{mid}/view")
def log_view(mid: int, u=Depends(current_user)):
    with db() as c: c.execute("INSERT INTO views VALUES(?,?,?)", (u["id"], mid, time.time()))
    return {"ok": True}

@router.get("/media/{mid}/download")
def download(mid: int):
    with db() as c: m = c.execute("SELECT * FROM media WHERE id=?", (mid,)).fetchone()
    if not m: raise HTTPException(404, "Not found")
    return FileResponse(f"{MEDIA}/files/{m['file']}", filename=m["title"] + os.path.splitext(m["file"])[1])

def save(f: UploadFile):
    name = secrets.token_hex(6) + os.path.splitext(f.filename)[1].lower()
    with open(f"{MEDIA}/files/{name}", "wb") as out: shutil.copyfileobj(f.file, out)
    return name

@router.post("/media")
def add_media(title: str = Form(...), type: str = Form("movie"), genres: str = Form(""), file: UploadFile = File(...),
              poster: UploadFile = File(None), u=Depends(admin_only)):
    fname = save(file); pname = save(poster) if poster else None
    with db() as c:
        new_id = c.execute("INSERT INTO media(title,type,genres,file,poster,created) VALUES(?,?,?,?,?,?) RETURNING id",
                           (title, type, genres, fname, "/media/files/" + pname if pname else None, time.time())).fetchone()["id"]
        for r in c.execute("SELECT id FROM users WHERE role='user'").fetchall():
            c.execute("INSERT INTO notifications(user_id,text,ts) VALUES(?,?,?)", (r["id"], f"New {type} added: {title}", time.time()))
    return {"id": new_id}

@router.delete("/media/{mid}")
def del_media(mid: int, u=Depends(admin_only)):
    with db() as c: c.execute("DELETE FROM media WHERE id=?", (mid,))
    return {"ok": True}

@router.get("/notifications")
def notes(u=Depends(current_user)):
    with db() as c: r = c.execute("SELECT * FROM notifications WHERE user_id=? ORDER BY ts DESC LIMIT 20", (u["id"],)).fetchall()
    return [dict(x) for x in r]

@router.post("/notifications/read")
def read_notes(u=Depends(current_user)):
    with db() as c: c.execute("UPDATE notifications SET read=TRUE WHERE user_id=?", (u["id"],))
    return {"ok": True}
