# app/enums.py – Final Phase 2 version
from enum import StrEnum

class Status(StrEnum):
    DRAFT = "Draft"
    READY_FOR_REVIEW = "Ready_for_Review"
    IN_REVIEW = "In_Review"
    APPROVED = "Approved"
    DEFERRED = "Deferred"
    REJECTED = "Rejected"
    SUPERSEDED = "Superseded"
    RETIRED = "Retired"

class ReqLevel(StrEnum):
    STK = "stk"
    SYS = "sys"
    SUB = "sub"

class EarsType(StrEnum):
    UBIQUITOUS = "ubiquitous"
    EVENT_DRIVEN = "event-driven"
    UNWANTED_BEHAVIOR = "unwanted"
    STATE_DRIVEN = "state-driven"
    OPTIONAL_FEATURE = "optional"
    COMPLEX = "complex"

class LinkType(StrEnum):
    DERIVES_FROM = "derives_from"
    SATISFIES = "satisfies"
    REFINES = "refines"
    VERIFIES = "verifies"
    PARENT = "parent"

class NeedLevel(StrEnum):
    MISSION = "Mission"
    ENTERPRISE = "Enterprise"
    TECHNICAL = "Technical"
