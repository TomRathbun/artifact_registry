# tests/test_requirement_filters.py
import pytest
from app.db.models.requirement import Requirement
from app.utils.id_generator import generate_artifact_id

def create_req(db_session, short_name, text, area, level):
    aid = generate_artifact_id(db_session, Requirement, area)
    req = Requirement(aid=aid, short_name=short_name, text=text, area=area, level=level)
    db_session.add(req)
    db_session.commit()
    db_session.refresh(req)
    return aid

@pytest.fixture
def sample_requirements(db_session):
    aids = []
    aids.append(create_req(db_session, "SYS-01", "system shall login", "MCK", "SYS"))
    aids.append(create_req(db_session, "SYS-02", "system shall logout", "MCK", "SYS"))
    aids.append(create_req(db_session, "STK-01", "stakeholder shall approve", "MCK", "STK"))
    aids.append(create_req(db_session, "STK-02", "stakeholder shall reject", "MCK", "STK"))
    aids.append(create_req(db_session, "OTHER", "other area", "OTHER", "SYS"))
    yield aids
    for aid in aids:
        req = db_session.query(Requirement).filter(Requirement.aid == aid).first()
        if req:
            db_session.delete(req)
    db_session.commit()

def test_filter_by_area(client, db_session, sample_requirements, auth_token):
    resp = client.get("/requirements?area=MCK", headers={"Authorization": f"Bearer {auth_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 4
    assert all(r["area"] == "MCK" for r in data)

def test_filter_by_level(client, db_session, sample_requirements, auth_token):
    resp = client.get("/requirements?level=SYS", headers={"Authorization": f"Bearer {auth_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    assert all(r["level"] == "SYS" for r in data)

def test_filter_by_area_and_level(client, db_session, sample_requirements, auth_token):
    resp = client.get("/requirements?area=MCK&level=STK", headers={"Authorization": f"Bearer {auth_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert all(r["area"] == "MCK" and r["level"] == "STK" for r in data)

def test_no_filter_returns_all(client, db_session, sample_requirements, auth_token):
    resp = client.get("/requirements", headers={"Authorization": f"Bearer {auth_token}"})
    assert resp.status_code == 200
    assert len(resp.json()) >= 5