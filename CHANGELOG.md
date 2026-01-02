# Changelog

All notable changes to the Artifact Registry project will be documented in this file.

## [0.1.7] - 2026-01-02

### Security & Permissions
- **Granular Role-Based Access Control (RBAC)**: Implemented distinct permission checks for each artifact type (Vision, Need, Use Case, Requirement, Document).
- **Frontend Permission Enforcement**:
  - Disabled "Create Artifact" buttons for users without permission.
  - Disabled generic creation wizards if user lacks specific role rights.
  - Disabled "Edit", "Duplicate", and "Delete" actions in artifact lists based on user roles.
  - Added "Access Denied" screens for unauthorized route access.
- **Password Management**:
  - Changed password reset default to `changeme` (was random string).
  - Added password visibility toggle (Eye icon) to Login page.
  - Added password visibility toggle to User Management page.
  - Enforced password change on next login for reset accounts.
- **Admin Fixes**: 
  - Resolved "Access Denied" issues for administrators by fixing role array parsing.

## [0.1.6] - 2025-12-31

### Changed
- Fixed Vision Markdown Rendering: Solved typography conflicts and enabled proper heading/list formatting in presentation mode.
- Optimized List View Layouts: Introduced "Compact MD" mode for table descriptions to maintain consistent row heights.
- Enhanced Diagram Tools: Added "Capture as PNG to Clipboard" and simplified capture UI in the Graph View.
- Improved Connection Snapping: Resized and relocated node handles for perfect edge snapping on all four sides.
- Smart Edge Elevation: Selected relationship lines now automatically jump to the front of the graph for easier editing.
- Backend Upgrade Fix: Resolved "uv add --dry-run" error, allowing dependency upgrades through the UI.
- Modernized Runtime: Upgraded project to Node.js v22.21.1.

## [0.1.5] - 2025-12-26

### Changed
- Interactive Graph Reconnection: Enabled bidirectional edge reconnection in the Artifact Graph View.
- Rich List Views: Implemented Markdown and Mermaid rendering for description fields in all list views.
- UI Polishing: Softened table borders and refined typography for a cleaner, modern look.
- System Update: Upgraded Node.js to v20.19.6 for improved performance and security.

## [0.1.4] - 2025-12-25

### Changed
- Enhanced System Stability: Relocated local PostgreSQL to port 5433 and implemented robust connection retries.
- Added Dependency Management: View and upgrade Frontend (NPM) and Backend (PyPI) packages directly from the UI.
- Interactive Architecture: Updated System Architecture diagram to be interactive with real-time status and navigation.
- Advanced Artifact Renaming: Enabled renaming artifacts across different Areas and IDs.
- UX Improvements: Graceful error handling for database connection failures.

## [0.1.3] - 2025-12-14

### Changed
- Implemented Arabic Translation support for Artifact Presentation view.
- Fixed critical crash when hovering over comments in presentation mode.
- Added database auto-migration on restore to ensure schema consistency.
- Improved database connection resilience with auto-reconnect (pool_pre_ping).

## [0.1.2] - 2025-12-12

### Changed
- Enhanced Comment Panel: Comments are now grouped by field and sorted to match the presentation order.
- Added Persistent Comment Highlighting: Clicking a field in the artifact editor highlights relevant comments.
- Improved Selection Handling: Text selection is preserved when clicking back into the same field.
- Added Comment Support for All Fields: Metadata, sites, components, and document content are now eligible for comments.

## [0.1.1] - 2025-12-10

### Changed
- Added `MarkdownDisplay` component for unified Markdown and Mermaid diagram rendering.
- Added Image Gallery and Upload functionality.
- Fixed Document artifact deletion in List View.
- Enhanced `ArtifactPresentation` to support Mermaid diagrams in all description fields.

## [0.1.0] - 2025-12-10

### Changed
- Refactored project file structure for better organization.
- Implemented "Tags" functionality for Sites.
- Added "Changelog" page.
- Separated "Security Domain" and "Tags" columns in Site Manager.
- Fixed Mermaid diagram content persistence issue.
- Fixed 500 error on Need list view due to tag deserialization.
- Moved "About" page to global route.

## [0.0.5] - 2025-12-09

### Changed
- Added initial Site Management interface.
- Implemented basic Artifact List Views.
- Added Graph View for artifact relationships.
