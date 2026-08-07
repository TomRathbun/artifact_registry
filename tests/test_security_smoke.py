"""Smoke tests for auth hardening and path safety."""
from pathlib import Path

from app.utils.paths import sanitize_filename, safe_join
from fastapi import HTTPException
import pytest


def test_login_success(client):
    resp = client.post(
        "/token",
        data={"username": "admin", "password": "seclpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_rejects_bad_password(client):
    resp = client.post(
        "/token",
        data={"username": "admin", "password": "wrong"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 400


def test_projects_require_auth(client):
    resp = client.get("/api/v1/projects/")
    assert resp.status_code == 401


def test_projects_list_with_auth(client, auth_headers):
    resp = client.get("/api/v1/projects/", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_me_endpoint(client, auth_headers):
    resp = client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["username"] == "admin"


def test_sanitize_filename_rejects_traversal():
    # Traversal segments collapse to basename (safe) rather than escaping
    assert sanitize_filename("../etc/passwd") == "passwd"
    with pytest.raises(HTTPException):
        sanitize_filename("")
    with pytest.raises(HTTPException):
        sanitize_filename("..")
    assert sanitize_filename("ok.png") == "ok.png"
    assert sanitize_filename("path/to/ok.png") == "ok.png"


def test_safe_join_blocks_escape(tmp_path: Path):
    base = tmp_path / "uploads"
    base.mkdir()
    # basename of ../secret is "secret" so join stays under base if we only pass basename
    target = safe_join(base, "file.txt")
    assert target.parent == base.resolve()
    with pytest.raises(HTTPException):
        # craft a part that resolves outside after resolve (symlink-like via parent)
        safe_join(base, "..", "outside.txt")
