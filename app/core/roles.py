# app/core/roles.py
from enum import Enum
from typing import List, Dict

class Role(str, Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    
    # Granular Roles/Permissions
    VISION_CREATE = "vision_create"
    VISION_EDIT = "vision_edit"
    VISION_DELETE = "vision_delete"
    
    NEED_CREATE = "need_create"
    NEED_EDIT = "need_edit"
    NEED_DELETE = "need_delete"
    
    UC_CREATE = "uc_create"
    UC_EDIT = "uc_edit"
    UC_DELETE = "uc_delete"
    
    REQ_CREATE = "req_create"
    REQ_EDIT = "req_edit"
    REQ_DELETE = "req_delete"
    
    DOC_CREATE = "doc_create"
    DOC_EDIT = "doc_edit"
    DOC_DELETE = "doc_delete"
    
    COMMENT_CREATE = "comment_create"
    COMMENT_RESOLVE = "comment_resolve"
    
    VIEWER = "viewer"

ROLE_PERMISSIONS: Dict[str, List[str]] = {
    Role.ADMIN: ["*"],
    Role.OPERATOR: ["db:backup", "db:restore", "db:status"],
    
    Role.VISION_CREATE: ["vision:create"],
    Role.VISION_EDIT: ["vision:edit"],
    Role.VISION_DELETE: ["vision:delete"],
    
    Role.NEED_CREATE: ["need:create"],
    Role.NEED_EDIT: ["need:edit"],
    Role.NEED_DELETE: ["need:delete"],
    
    Role.UC_CREATE: ["use_case:create"],
    Role.UC_EDIT: ["use_case:edit"],
    Role.UC_DELETE: ["use_case:delete"],
    
    Role.REQ_CREATE: ["requirement:create"],
    Role.REQ_EDIT: ["requirement:edit"],
    Role.REQ_DELETE: ["requirement:delete"],
    
    Role.DOC_CREATE: ["document:create"],
    Role.DOC_EDIT: ["document:edit"],
    Role.DOC_DELETE: ["document:delete"],
    
    Role.COMMENT_CREATE: ["comment:create"],
    Role.COMMENT_RESOLVE: ["comment:resolve", "comment:unresolve"],
    
    Role.VIEWER: [],
    
    # Legacy/Group roles (for backward compatibility if needed)
    "vision_editor": ["vision:create", "vision:edit", "vision:delete", "comment:create"],
    "need_editor": ["need:create", "need:edit", "need:delete", "comment:create"],
    "uc_editor": ["use_case:create", "use_case:edit", "use_case:delete", "comment:create"],
    "req_editor": ["requirement:create", "requirement:edit", "requirement:delete", "comment:create"],
}
