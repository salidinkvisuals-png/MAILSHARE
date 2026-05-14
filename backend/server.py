"""Mailshare backend — Email access sharing app (mock providers, JWT auth)."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Literal

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ---------------- Setup ----------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"
ACCESS_MIN = 60 * 24  # 1 day token for MVP convenience
REFRESH_DAYS = 14

app = FastAPI(title="Mailshare API")
api = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mailshare")


# ---------------- Helpers ----------------
def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MIN),
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_DAYS),
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    # cross-site cookies in iframe-style preview require SameSite=None + Secure
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=ACCESS_MIN * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=REFRESH_DAYS * 86400, path="/")


def clear_auth_cookies(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "created_at": user.get("created_at").isoformat() if isinstance(user.get("created_at"), datetime) else user.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Models ----------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = ""


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AccountIn(BaseModel):
    provider: Literal["gmail", "outlook", "yahoo", "icloud"]
    email: EmailStr
    label: str = ""


class FilterIn(BaseModel):
    name: str
    account_id: str
    from_contains: str = ""
    subject_contains: str = ""
    label: str = ""
    date_from: Optional[str] = None  # ISO
    date_to: Optional[str] = None


class ShareIn(BaseModel):
    filter_id: str
    recipient_email: EmailStr
    forward_enabled: bool = False
    forward_to_email: Optional[EmailStr] = None
    note: str = ""


# ---------------- Auth endpoints ----------------
@auth_router.post("/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name or email.split("@")[0],
        "role": "user",
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    set_auth_cookies(response, create_access_token(uid, email), create_refresh_token(uid))
    doc["_id"] = res.inserted_id
    return serialize_user(doc)


@auth_router.post("/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    set_auth_cookies(response, create_access_token(uid, email), create_refresh_token(uid))
    return serialize_user(user)


@auth_router.post("/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@auth_router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)


@auth_router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=ACCESS_MIN * 60, path="/")
        return {"ok": True}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------------- Accounts ----------------
SAMPLE_EMAILS = [
    {"from_email": "billing@stripe.com", "from_name": "Stripe", "subject": "Your invoice for January is ready", "body": "Hi, your Stripe invoice for January is now available. Total: $129.00.", "label": "Finance"},
    {"from_email": "noreply@github.com", "from_name": "GitHub", "subject": "[mailshare/api] PR #142 merged", "body": "Your pull request #142 was merged into main.", "label": "Work"},
    {"from_email": "team@figma.com", "from_name": "Figma", "subject": "Design review: Mailshare v0.3", "body": "A new design review has been requested on Mailshare v0.3.", "label": "Work"},
    {"from_email": "alerts@aws.amazon.com", "from_name": "AWS", "subject": "Billing alert: $312 this month", "body": "AWS billing has crossed $300 for the current cycle.", "label": "Finance"},
    {"from_email": "hr@company.com", "from_name": "People Ops", "subject": "Q1 performance check-in", "body": "Please complete your Q1 self-review before Friday.", "label": "HR"},
    {"from_email": "sales@hubspot.com", "from_name": "HubSpot", "subject": "New lead from your website", "body": "A new lead just filled out your pricing form.", "label": "Sales"},
    {"from_email": "newsletter@producthunt.com", "from_name": "Product Hunt", "subject": "The 5 hottest launches today", "body": "Today's top launches on Product Hunt.", "label": "Newsletter"},
    {"from_email": "support@notion.so", "from_name": "Notion", "subject": "Your weekly workspace digest", "body": "Here is your weekly workspace activity digest.", "label": "Work"},
    {"from_email": "ceo@acme.io", "from_name": "Sara (CEO)", "subject": "Board meeting prep — Thursday", "body": "Quick note to align on the board deck for Thursday.", "label": "Exec"},
    {"from_email": "billing@vercel.com", "from_name": "Vercel", "subject": "Pro plan renewed — $20", "body": "Your Vercel Pro plan was renewed for the month.", "label": "Finance"},
    {"from_email": "alerts@datadog.com", "from_name": "Datadog", "subject": "[P1] API latency spike", "body": "p95 latency on api-prod crossed 800ms.", "label": "Ops"},
    {"from_email": "candidate@gmail.com", "from_name": "John Pierce", "subject": "Application — Senior Engineer", "body": "Attaching my resume for the Senior Engineer role.", "label": "Hiring"},
]


async def seed_account_emails(account_id: str, owner_id: str):
    existing = await db.emails.count_documents({"account_id": account_id})
    if existing > 0:
        return 0
    now = datetime.now(timezone.utc)
    docs = []
    for i, s in enumerate(SAMPLE_EMAILS):
        docs.append({
            "account_id": account_id,
            "owner_id": owner_id,
            "from_email": s["from_email"],
            "from_name": s["from_name"],
            "subject": s["subject"],
            "body": s["body"],
            "label": s["label"],
            "received_at": (now - timedelta(hours=i * 7)).isoformat(),
            "read": False,
        })
    await db.emails.insert_many(docs)
    return len(docs)


@api.post("/accounts")
async def create_account(body: AccountIn, user: dict = Depends(get_current_user)):
    doc = {
        "owner_id": str(user["_id"]),
        "provider": body.provider,
        "email": body.email.lower(),
        "label": body.label or body.email,
        "status": "connected",
        "connected_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.accounts.insert_one(doc)
    aid = str(res.inserted_id)
    await seed_account_emails(aid, str(user["_id"]))
    doc["id"] = aid
    doc.pop("_id", None)
    await log_activity(str(user["_id"]), "account.connect", {"account_id": aid, "provider": body.provider, "email": body.email})
    return doc


@api.get("/accounts")
async def list_accounts(user: dict = Depends(get_current_user)):
    out = []
    async for a in db.accounts.find({"owner_id": str(user["_id"])}, {"_id": 1, "provider": 1, "email": 1, "label": 1, "status": 1, "connected_at": 1}):
        a["id"] = str(a.pop("_id"))
        out.append(a)
    return out


@api.delete("/accounts/{account_id}")
async def delete_account(account_id: str, user: dict = Depends(get_current_user)):
    a = await db.accounts.find_one({"_id": ObjectId(account_id), "owner_id": str(user["_id"])})
    if not a:
        raise HTTPException(404, "Account not found")
    await db.accounts.delete_one({"_id": ObjectId(account_id)})
    await db.emails.delete_many({"account_id": account_id})
    await db.filters.delete_many({"account_id": account_id})
    # remove shares pointing to filters of this account
    filter_ids = []
    async for f in db.filters.find({"account_id": account_id}, {"_id": 1}):
        filter_ids.append(str(f["_id"]))
    if filter_ids:
        await db.shares.delete_many({"filter_id": {"$in": filter_ids}})
    await log_activity(str(user["_id"]), "account.disconnect", {"account_id": account_id})
    return {"ok": True}


@api.get("/accounts/{account_id}/emails")
async def list_emails(account_id: str, user: dict = Depends(get_current_user)):
    a = await db.accounts.find_one({"_id": ObjectId(account_id), "owner_id": str(user["_id"])})
    if not a:
        raise HTTPException(404, "Account not found")
    out = []
    cursor = db.emails.find({"account_id": account_id}).sort("received_at", -1)
    async for e in cursor:
        e["id"] = str(e.pop("_id"))
        out.append(e)
    return out


# ---------------- Filters ----------------
def email_matches_filter(email: dict, flt: dict) -> bool:
    if flt.get("from_contains"):
        if flt["from_contains"].lower() not in (email.get("from_email", "") + " " + email.get("from_name", "")).lower():
            return False
    if flt.get("subject_contains"):
        if flt["subject_contains"].lower() not in email.get("subject", "").lower():
            return False
    if flt.get("label"):
        if flt["label"].lower() != email.get("label", "").lower():
            return False
    if flt.get("date_from"):
        if email.get("received_at", "") < flt["date_from"]:
            return False
    if flt.get("date_to"):
        if email.get("received_at", "") > flt["date_to"]:
            return False
    return True


@api.post("/filters")
async def create_filter(body: FilterIn, user: dict = Depends(get_current_user)):
    acct = await db.accounts.find_one({"_id": ObjectId(body.account_id), "owner_id": str(user["_id"])})
    if not acct:
        raise HTTPException(404, "Account not found")
    doc = body.model_dump()
    doc["owner_id"] = str(user["_id"])
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.filters.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    await log_activity(str(user["_id"]), "filter.create", {"filter_id": doc["id"], "name": body.name})
    return doc


@api.get("/filters")
async def list_filters(user: dict = Depends(get_current_user)):
    out = []
    async for f in db.filters.find({"owner_id": str(user["_id"])}):
        f["id"] = str(f.pop("_id"))
        out.append(f)
    return out


@api.delete("/filters/{filter_id}")
async def delete_filter(filter_id: str, user: dict = Depends(get_current_user)):
    f = await db.filters.find_one({"_id": ObjectId(filter_id), "owner_id": str(user["_id"])})
    if not f:
        raise HTTPException(404, "Filter not found")
    await db.filters.delete_one({"_id": ObjectId(filter_id)})
    await db.shares.delete_many({"filter_id": filter_id})
    await log_activity(str(user["_id"]), "filter.delete", {"filter_id": filter_id})
    return {"ok": True}


@api.get("/filters/{filter_id}/preview")
async def preview_filter(filter_id: str, user: dict = Depends(get_current_user)):
    f = await db.filters.find_one({"_id": ObjectId(filter_id), "owner_id": str(user["_id"])})
    if not f:
        raise HTTPException(404, "Filter not found")
    out = []
    cursor = db.emails.find({"account_id": f["account_id"]}).sort("received_at", -1)
    async for e in cursor:
        if email_matches_filter(e, f):
            e["id"] = str(e.pop("_id"))
            out.append(e)
    return out


# ---------------- Shares ----------------
@api.post("/shares")
async def create_share(body: ShareIn, user: dict = Depends(get_current_user)):
    f = await db.filters.find_one({"_id": ObjectId(body.filter_id), "owner_id": str(user["_id"])})
    if not f:
        raise HTTPException(404, "Filter not found")
    doc = {
        "filter_id": body.filter_id,
        "owner_id": str(user["_id"]),
        "account_id": f["account_id"],
        "recipient_email": body.recipient_email.lower(),
        "forward_enabled": body.forward_enabled,
        "forward_to_email": (body.forward_to_email or body.recipient_email).lower(),
        "note": body.note,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.shares.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    await log_activity(str(user["_id"]), "share.create", {"share_id": doc["id"], "recipient": body.recipient_email, "filter_id": body.filter_id})
    return doc


@api.get("/shares")
async def list_shares(user: dict = Depends(get_current_user)):
    out = []
    async for s in db.shares.find({"owner_id": str(user["_id"])}).sort("created_at", -1):
        s["id"] = str(s.pop("_id"))
        out.append(s)
    return out


@api.delete("/shares/{share_id}")
async def revoke_share(share_id: str, user: dict = Depends(get_current_user)):
    s = await db.shares.find_one({"_id": ObjectId(share_id), "owner_id": str(user["_id"])})
    if not s:
        raise HTTPException(404, "Share not found")
    await db.shares.delete_one({"_id": ObjectId(share_id)})
    await log_activity(str(user["_id"]), "share.revoke", {"share_id": share_id, "recipient": s.get("recipient_email")})
    return {"ok": True}


# ---------------- Shared with me ----------------
@api.get("/shared-with-me")
async def shared_with_me(user: dict = Depends(get_current_user)):
    out = []
    cursor = db.shares.find({"recipient_email": user["email"], "status": "active"}).sort("created_at", -1)
    async for s in cursor:
        f = await db.filters.find_one({"_id": ObjectId(s["filter_id"])})
        a = await db.accounts.find_one({"_id": ObjectId(s["account_id"])})
        owner = await db.users.find_one({"_id": ObjectId(s["owner_id"])})
        s["id"] = str(s.pop("_id"))
        s["filter"] = {
            "id": str(f["_id"]) if f else None,
            "name": f.get("name") if f else None,
            "from_contains": f.get("from_contains") if f else "",
            "subject_contains": f.get("subject_contains") if f else "",
            "label": f.get("label") if f else "",
        } if f else None
        s["account"] = {
            "email": a.get("email") if a else None,
            "provider": a.get("provider") if a else None,
            "label": a.get("label") if a else None,
        } if a else None
        s["owner"] = {"email": owner.get("email") if owner else None, "name": owner.get("name") if owner else None} if owner else None
        out.append(s)
    return out


@api.get("/shared-with-me/{share_id}/emails")
async def shared_emails(share_id: str, user: dict = Depends(get_current_user)):
    s = await db.shares.find_one({"_id": ObjectId(share_id), "recipient_email": user["email"]})
    if not s:
        raise HTTPException(404, "Share not found")
    f = await db.filters.find_one({"_id": ObjectId(s["filter_id"])})
    if not f:
        raise HTTPException(404, "Filter not found")
    out = []
    cursor = db.emails.find({"account_id": s["account_id"]}).sort("received_at", -1)
    async for e in cursor:
        if email_matches_filter(e, f):
            e["id"] = str(e.pop("_id"))
            e.pop("owner_id", None)
            out.append(e)
    await log_activity(str(user["_id"]), "shared.view", {"share_id": share_id, "count": len(out)})
    return out


# ---------------- Activity log ----------------
async def log_activity(user_id: str, action: str, meta: dict):
    await db.activity.insert_one({
        "user_id": user_id,
        "action": action,
        "meta": meta,
        "at": datetime.now(timezone.utc).isoformat(),
    })


@api.get("/activity")
async def list_activity(user: dict = Depends(get_current_user)):
    out = []
    cursor = db.activity.find({"user_id": str(user["_id"])}).sort("at", -1).limit(200)
    async for a in cursor:
        a["id"] = str(a.pop("_id"))
        out.append(a)
    return out


# ---------------- Overview ----------------
@api.get("/overview")
async def overview(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    accounts = await db.accounts.count_documents({"owner_id": uid})
    filters_count = await db.filters.count_documents({"owner_id": uid})
    shares = await db.shares.count_documents({"owner_id": uid, "status": "active"})
    emails = await db.emails.count_documents({"owner_id": uid})
    shared_with_me_count = await db.shares.count_documents({"recipient_email": user["email"], "status": "active"})
    return {
        "accounts": accounts,
        "filters": filters_count,
        "shares": shares,
        "emails": emails,
        "shared_with_me": shared_with_me_count,
    }


@api.get("/")
async def root():
    return {"ok": True, "service": "mailshare"}


# ---------------- Startup ----------------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "owner@mailshare.app").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Owner123!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Owner",
            "role": "owner",
            "created_at": datetime.now(timezone.utc),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed a viewer/recipient test user
    viewer_email = "viewer@mailshare.app"
    viewer_password = "Viewer123!"
    viewer = await db.users.find_one({"email": viewer_email})
    if not viewer:
        await db.users.insert_one({
            "email": viewer_email,
            "password_hash": hash_password(viewer_password),
            "name": "Viewer",
            "role": "user",
            "created_at": datetime.now(timezone.utc),
        })
    elif not verify_password(viewer_password, viewer["password_hash"]):
        await db.users.update_one({"email": viewer_email}, {"$set": {"password_hash": hash_password(viewer_password)}})


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.accounts.create_index("owner_id")
    await db.emails.create_index([("account_id", 1), ("received_at", -1)])
    await db.filters.create_index("owner_id")
    await db.shares.create_index("recipient_email")
    await db.shares.create_index("owner_id")
    await db.activity.create_index([("user_id", 1), ("at", -1)])
    await seed_admin()
    logger.info("Mailshare startup complete.")


# ---------------- App wire-up ----------------
app.include_router(auth_router)
app.include_router(api)

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
