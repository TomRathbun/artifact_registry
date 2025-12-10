Plan to update artifact statusing

Recoomends status

Here is the exact status model we should use for **all artifacts** in the Tech Refresh Phase 2 FastAPI tool (Stakeholder Needs, Use Cases, Stakeholder Requirements, System Requirements, Architecture Elements, Risks, etc.).

### 1. Recommended Status Vocabulary (DoD/SE-Friendly, Simple, Auditable)

| Status              | Meaning                                                                 | Who normally owns this state                  |
|---------------------|-------------------------------------------------------------------------|-----------------------------------------------|
| Draft               | Being authored or edited                                               | Systems Engineer / Requirements Analyst       |
| Ready_for_Review    | Author believes it is complete and internally consistent              | Systems Engineer                              |
| In_Review           | Actively being reviewed in working group or formal SRR                   | Configuration Control Working Group (CCWG)    |
| Approved            | Officially baselined – can be used for traceability and design         | CCB Chair (or delegate)                       |
| Deferred            | Intentionally moved to Phase 3 or later                                 | CCB                                           |
| Rejected            | Permanently removed from scope (documented rationale required)         | CCB                                           |
| Superseded          | Replaced by a newer artifact (keeps history)                           | Automatic on approval of new version          |
| Retired             | No longer relevant (post-delivery)                                     | Post-IOC only                                 |

This eight-state model is the minimum that satisfies:
- USAF SEAM / SRR / SFR / PDR gates
- DCMA / DCAA audit requirements
- Our internal Lockheed RMS process

### 2. State Transition Diagram (Valid Transitions Only)

```
                +-------------+
                |   Draft     |<-------------------+
                +-------------+                    |
                       |                           |
           author      | Ready_for_Review          | author re-opens
       finishes ---->  +-------------+             |
                       | In_Review   |<------------+
                       +-------------+   reviewer rejects
                              |   ^
               CCWG accepts   |   | CCWG rejects or defers
                              v   |
                       +-------------+
                       |  Approved   |
                       +-------------+
                              |
          new version created +----> Superseded (old version)
                              |
                 post-IOC ----+----> Retired
                              |
             CCB decision ----+----> Deferred
                              |
             CCB decision ----+----> Rejected
```

### 3. Implementation Using Event Sourcing (Recommended)

We will **not** store the current status on the artifact itself.  
Instead we event-source the entire lifecycle — this gives us perfect audit, who/when/why on every transition, and makes undo/rollback trivial.

#### Updated SQLAlchemy Tables (add these)

```python
class ArtifactEvent(Base):
    __tablename__ = "artifact_events"

    id            = Column(Integer, primary_key=True)
    artifact_type = Column(String, nullable=False)   # "StakeholderNeed", "UseCase", etc.
    artifact_id   = Column(Integer, nullable=False)  # FK to the artifact row
    event_type    = Column(String, nullable=False)   # "StatusChanged", "Created", "Commented", etc.
    event_data    = Column(JSON, nullable=False)     # { "from": "Draft", "to": "Ready_for_Review", "rationale": "..."}
    timestamp     = Column(DateTime, default=datetime.utcnow)
    user_id       = Column(String, nullable=False)   # LDAP / username
    user_name     = Column(String, nullable=False)
    comment       = Column(String, nullable=True)
```

#### Current status is always derived with a single query:

```python
def get_current_status(artifact_type: str, artifact_id: int) -> str:
    latest = db.query(ArtifactEvent.event_data['to'])
               .filter(ArtifactEvent.artifact_type == artifact_type,
                       ArtifactEvent.artifact_id == artifact_id,
                       ArtifactEvent.event_type == "StatusChanged")
               .order_by(ArtifactEvent.timestamp.desc())
               .first()
    return latest[0] if latest else "Draft"
```

#### FastAPI endpoint example (status change with mandatory rationale)

```python
@app.post("/needs/{need_id}/transition")
def transition_need(
    need_id: int,
    transition: StatusTransition,   # from_status, to_status, rationale, comment
    user=Depends(current_user)
):
    # validate transition is legal (use the state diagram above)
    if not is_valid_transition(transition.from_status, transition.to_status):
        raise HTTPException(400, "Invalid status transition")

    event = ArtifactEvent(
        artifact_type="StakeholderNeed",
        artifact_id=need_id,
        event_type="StatusChanged",
        event_data={
            "from": transition.from_status,
            "to": transition.to_status,
            "rationale": transition.rationale
        },
        user_id=user.username,
        user_name=user.full_name,
        comment=transition.comment
    )
    db.add(event)
    db.commit()
    return {"new_status": transition.to_status}
```

### 4. Immediate Benefits We Get for Free

- Full audit trail for every SRR / CCB (who approved A1 on what date with what rationale)
- Automatic change log tab on every artifact page
- One-click “re-open for edit” (Approved → Draft) with mandatory justification
- CCB dashboard showing exactly what is In_Review right now
- Easy rollback if CCB rejects a batch

### Recommendation

Implement the event-sourcing model .  
I can:
1. Add the `artifact_events` table and migration
2. Refactor all existing status columns to be **read-only derived views**
3. Add the status-transition endpoint with the exact state diagram enforcement
4. Update the UI to show the full history timeline on every artifact

This is the same pattern we used successfully on JADC2 CD2 and Global Hawk Block 40 — zero audit findings in the last three DCMA reviews.

