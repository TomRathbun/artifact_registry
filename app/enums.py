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
    # === Existing vertical traceability (keep forever) ===
    DERIVES_FROM = "derives_from"   # Use Case derives_from Need, Req derives_from UC, etc.
    SATISFIES    = "satisfies"      # Req satisfies Need, Test verifies Req
    REFINES      = "refines"        # Lower-level artifact refines higher-level
    VERIFIES     = "verifies"       # Test Case verifies Requirement
    PARENT       = "parent"         # Tree hierarchy (e.g., parent Need)

    # === New generalized lateral/supporting links (ADD THESE) ===
    TRACES_TO        = "traces_to"        # Mission Need → Technical Need, Need → Vision (inverse of derives_from)
    DEPENDS_ON       = "depends_on"       # Need A depends_on Need B (risk chaining)
    ILLUSTRATED_BY   = "illustrated_by"   # Need/Req → Diagram, Confluence page, OnePager
    DOCUMENTED_IN    = "documented_in"    # Need/Req → CONOPS, ICD, MOSA Plan, BOM
    ALLOCATED_TO     = "allocated_to"     # Requirement → System Component (Network Stack, VDI, etc.)
    RELATED_TO       = "related_to"       # Catch-all for peer relationships

class NeedLevel(StrEnum):
    MISSION = "Mission"
    ENTERPRISE = "Enterprise"
    TECHNICAL = "Technical"
