"""Mailshare backend API tests — auth, accounts, filters, shares, shared-with-me, activity."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

OWNER_EMAIL = "owner@mailshare.app"
OWNER_PASS = "Owner123!"
VIEWER_EMAIL = "viewer@mailshare.app"
VIEWER_PASS = "Viewer123!"


def _session_login(email, password):
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return s, r.json()


@pytest.fixture(scope="session")
def owner():
    s, user = _session_login(OWNER_EMAIL, OWNER_PASS)
    return {"s": s, "user": user}


@pytest.fixture(scope="session")
def viewer():
    s, user = _session_login(VIEWER_EMAIL, VIEWER_PASS)
    return {"s": s, "user": user}


# ---------------- Auth ----------------
class TestAuth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_login_owner(self):
        s, u = _session_login(OWNER_EMAIL, OWNER_PASS)
        assert u["email"] == OWNER_EMAIL
        # httpOnly cookies present
        cookies = {c.name: c for c in s.cookies}
        assert "access_token" in cookies
        assert "refresh_token" in cookies

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me(self, owner):
        r = owner["s"].get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == OWNER_EMAIL

    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_register_and_logout(self):
        email = f"test_{uuid.uuid4().hex[:8]}@mailshare.app"
        s = requests.Session()
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "Passw0rd!", "name": "T"}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["email"] == email
        # me works
        r2 = s.get(f"{API}/auth/me", timeout=15)
        assert r2.status_code == 200
        # logout clears cookies
        r3 = s.post(f"{API}/auth/logout", timeout=15)
        assert r3.status_code == 200
        # subsequent me should 401
        s2 = requests.Session()
        r4 = s2.get(f"{API}/auth/me", timeout=15)
        assert r4.status_code == 401

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={"email": OWNER_EMAIL, "password": "Passw0rd!"}, timeout=15)
        assert r.status_code == 400

    def test_refresh(self, owner):
        r = owner["s"].post(f"{API}/auth/refresh", timeout=15)
        assert r.status_code == 200


# ---------------- Accounts + emails ----------------
class TestAccounts:
    def test_create_list_account_with_seed(self, owner):
        s = owner["s"]
        r = s.post(f"{API}/accounts", json={"provider": "gmail", "email": "owner.work@gmail.com", "label": "Work"}, timeout=20)
        assert r.status_code == 200, r.text
        acct = r.json()
        assert "id" in acct
        assert acct["provider"] == "gmail"
        assert acct["status"] == "connected"
        pytest.account_id = acct["id"]

        # List
        r = s.get(f"{API}/accounts", timeout=15)
        assert r.status_code == 200
        ids = [a["id"] for a in r.json()]
        assert acct["id"] in ids

        # Emails seeded
        r = s.get(f"{API}/accounts/{acct['id']}/emails", timeout=15)
        assert r.status_code == 200
        emails = r.json()
        assert len(emails) >= 12
        assert all("from_email" in e and "subject" in e for e in emails)

    def test_viewer_cannot_access_owner_account(self, viewer):
        # viewer trying to access owner's account
        r = viewer["s"].get(f"{API}/accounts/{pytest.account_id}/emails", timeout=15)
        assert r.status_code == 404


# ---------------- Filters ----------------
class TestFilters:
    def test_create_filter_and_preview(self, owner):
        s = owner["s"]
        r = s.post(f"{API}/filters", json={
            "name": "Finance mails",
            "account_id": pytest.account_id,
            "from_contains": "",
            "subject_contains": "",
            "label": "Finance",
        }, timeout=15)
        assert r.status_code == 200, r.text
        flt = r.json()
        assert flt["name"] == "Finance mails"
        pytest.filter_id = flt["id"]

        # list filters
        r = s.get(f"{API}/filters", timeout=15)
        assert r.status_code == 200
        assert any(f["id"] == pytest.filter_id for f in r.json())

        # preview - should only return Finance label
        r = s.get(f"{API}/filters/{pytest.filter_id}/preview", timeout=15)
        assert r.status_code == 200
        prev = r.json()
        assert len(prev) >= 1
        assert all(e["label"].lower() == "finance" for e in prev)

    def test_preview_from_contains(self, owner):
        s = owner["s"]
        r = s.post(f"{API}/filters", json={
            "name": "Stripe only",
            "account_id": pytest.account_id,
            "from_contains": "stripe",
        }, timeout=15)
        assert r.status_code == 200
        fid = r.json()["id"]
        r = s.get(f"{API}/filters/{fid}/preview", timeout=15)
        assert r.status_code == 200
        prev = r.json()
        assert len(prev) >= 1
        assert all("stripe" in (e["from_email"] + e.get("from_name", "")).lower() for e in prev)


# ---------------- Shares ----------------
class TestShares:
    def test_create_share_with_viewer(self, owner):
        s = owner["s"]
        r = s.post(f"{API}/shares", json={
            "filter_id": pytest.filter_id,
            "recipient_email": VIEWER_EMAIL,
            "forward_enabled": False,
            "note": "Finance emails for viewer",
        }, timeout=15)
        assert r.status_code == 200, r.text
        share = r.json()
        assert share["recipient_email"] == VIEWER_EMAIL
        pytest.share_id = share["id"]

        r = s.get(f"{API}/shares", timeout=15)
        assert r.status_code == 200
        assert any(sh["id"] == pytest.share_id for sh in r.json())

    def test_viewer_sees_shared(self, viewer):
        r = viewer["s"].get(f"{API}/shared-with-me", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert any(it["id"] == pytest.share_id for it in items)

    def test_viewer_shared_emails(self, viewer):
        r = viewer["s"].get(f"{API}/shared-with-me/{pytest.share_id}/emails", timeout=15)
        assert r.status_code == 200
        emails = r.json()
        assert len(emails) >= 1
        assert all(e["label"].lower() == "finance" for e in emails)
        # owner_id stripped
        assert all("owner_id" not in e for e in emails)

    def test_other_user_cannot_view_share(self, owner):
        # owner is not a recipient of their own share
        r = owner["s"].get(f"{API}/shared-with-me/{pytest.share_id}/emails", timeout=15)
        assert r.status_code == 404


# ---------------- Activity + Overview ----------------
class TestActivityOverview:
    def test_activity_log(self, owner):
        r = owner["s"].get(f"{API}/activity", timeout=15)
        assert r.status_code == 200
        actions = [a["action"] for a in r.json()]
        # should include earlier events from this run
        assert "account.connect" in actions
        assert "filter.create" in actions
        assert "share.create" in actions

    def test_overview_owner(self, owner):
        r = owner["s"].get(f"{API}/overview", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ("accounts", "filters", "shares", "emails", "shared_with_me"):
            assert k in d
        assert d["accounts"] >= 1
        assert d["filters"] >= 1
        assert d["shares"] >= 1
        assert d["emails"] >= 12

    def test_overview_viewer(self, viewer):
        r = viewer["s"].get(f"{API}/overview", timeout=15)
        assert r.status_code == 200
        assert r.json()["shared_with_me"] >= 1


# ---------------- Cleanup (revoke share, delete filter & account) ----------------
class TestCleanup:
    def test_revoke_share(self, owner):
        r = owner["s"].delete(f"{API}/shares/{pytest.share_id}", timeout=15)
        assert r.status_code == 200

    def test_delete_account_cascade(self, owner):
        r = owner["s"].delete(f"{API}/accounts/{pytest.account_id}", timeout=15)
        assert r.status_code == 200
        # verify deletion
        r = owner["s"].get(f"{API}/accounts/{pytest.account_id}/emails", timeout=15)
        assert r.status_code == 404
