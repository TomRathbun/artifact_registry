# tests/test_need_filter.py
import pytest
from app.db.models.need import Need
from app.utils.id_generator import generate_artifact_id


# NEW: create_need using db_session directly
def create_need(db_session, title, description, area, status, owner="admin"):
    aid = generate_artifact_id(db_session, Need, area)
    need = Need(
        aid=aid,
        title=title,
        description=description,
        area=area,
        status=status,
        owner=owner
    )
    db_session.add(need)
    db_session.commit()
    db_session.refresh(need)
    return aid





@pytest.fixture
def sample_needs(db_session, auth_token):  # Use db_session
    aids = []
    try:
        aids.append(create_need(db_session, "Login Flow", "User must log in", "MCK", "PROPOSED"))
        aids.append(create_need(db_session, "Logout Flow", "User must log out", "MCK", "PROPOSED"))
        aids.append(create_need(db_session, "Data Export", "Export to CSV", "MCK", "VERIFIED"))
        aids.append(create_need(db_session, "Backup", "Nightly backup", "OTHER", "PROPOSED"))
        aids.append(create_need(db_session, "Legacy UI", "Keep old UI", "MCK", "REJECTED"))
        yield aids
    finally:
        # Clean up
        for aid in aids:
            need = db_session.query(Need).filter(Need.aid == aid).first()
            if need:
                db_session.delete(need)
        db_session.commit()


def test_filter_needs_by_area(client, db_session, sample_needs, auth_token):
    resp = client.get("/needs?area=MCK", headers={"Authorization": f"Bearer {auth_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 4
    assert all(n["area"] == "MCK" for n in data)


# Repeat for other tests (same signature)
def test_filter_needs_by_status(client, db_session, sample_needs, auth_token):
    resp = client.get("/needs?status=PROPOSED",
                      headers={"Authorization": f"Bearer {auth_token}"})  # <-- STRING OK for query
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    for n in data:
        print(n)
    assert all(n["status"] == "proposed" for n in data)  # <-- LOWERCASE


def test_filter_needs_by_area_and_status(client, db_session, sample_needs, auth_token):
    resp = client.get("/needs?area=MCK&status=VERIFIED", headers={"Authorization": f"Bearer {auth_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["title"] == "Data Export"
    assert data[0]["status"] == "verified"  # <-- LOWERCASE


def test_no_filter_returns_all_needs(client, db_session, sample_needs, auth_token):
    resp = client.get("/needs", headers={"Authorization": f"Bearer {auth_token}"})
    assert resp.status_code == 200
    assert len(resp.json()) >= 5
