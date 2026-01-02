# User's Guide: Artifact Registry

Welcome to the Artifact Registry. This guide helps you navigate the platform and manage your architectural artifacts.

## 🏁 Getting Started

1. **Create a Project**: On the main dashboard, click **Add Project** to start a new architectural workspace.
2. **Project Dashboard**: Click on a project to enter its dedicated management view. You'll see high-level statistics and navigation icons.

## 📂 Managing Artifacts

The system supports several artifact types, organized by architectural layer:

- **Visions**: High-level strategic goals and mission statements.
- **Needs**: Stakeholder requirements and operational "needs" (Mission, Enterprise, or Technical levels).
- **Use Cases**: Behavioral descriptions of how actors interact with the system.
- **Requirements**: Technical specifications (Functional, Performance, Interface, etc.).
- **Documents**: Supporting documentation, images, or reference files.

### Creating an Artifact
1. Select an artifact type from the left sidebar.
2. Click the **Add** button (e.g., "Add Need").
3. Fill in the required fields. 
   - *Tip: Use the Markdown editor for rich descriptions.*
4. Click **Save**.

## 🔗 Traceability & Linkages

One of the registry's core strengths is "traceability." You can link any two artifacts together to show derivation or satisfaction.

1. **Add Linkage**: In the List View, use the **Actions** menu or the dedicated **Linkages** sidebar.
2. **Relationship Types**:
   - **Refines**: Detailed artifact elaborates on a higher-level one.
   - **Satisfies**: Requirement confirms a Need is met.
   - **Derives**: New requirement emerges from an existing one.

## 📊 Visualizing the Architecture

- **Artifact Graph**: View the "Tracing View" to see a live network graph of how all your requirements and needs are connected.
- **Component Diagrams**: Use the "Component Diagram" feature to visually map out system blocks. You can drag components and draw connecting lines to represent interfaces.
- **Sequence Diagrams**: For Use Cases, you can define sequence diagrams using Mermaid.js syntax for clear behavioral modeling.

## 📤 Exporting Data

You can export your work at any time:
- **JSON**: Full database-compatible export for backups.
- **Markdown**: Formatted text files suitable for GitHub/GitLab.
- **Word (DOCX)**: Professional documents formatted for stakeholders, including embedded diagrams.

## 🔐 Security & Permissions

Access to artifacts and features is controlled by a Role-Based Access Control (RBAC) system.

### User Roles
Your account is assigned specific roles that determine what you can do:
- **Viewer**: Read-only access to all public projects.
- **Editor**: Can create and edit artifacts but cannot delete them.
- **Operator**: Can manage operational aspects.
- **Admin**: Full access to all system features, including user management.

### Artifact-Specific Permissions
Permissions are granular for each artifact type (Vision, Need, Use Case, etc.):
- **Create**: You see "Create" buttons and can add new items.
- **Edit**: "Edit" buttons are enabled for existing items.
- **Delete**: "Delete" (trash icon) is enabled.

If a button is grayed out, hover over it to see a tooltip explaining the missing permission (e.g., *"You don't have permission to delete this artifact"*).

### Password Management
- **Reset**: Administrators can reset your password to a default temporary password.
- **Change**: You will be prompted to change your password upon first login or after a reset.
- **Visibility**: Toggle the "Eye" icon in password fields to reveal what you are typing.

## ⚙️ Database Management

Accessed via the "Database" link in the sidebar:
- **Backups**: Create named snapshots of your project.
- **Notes**: Add descriptive notes to backups (e.g., "Pre-Workshop Revision").
- **Restore**: Revert a project to a previous state using a backup file.
- **Schema**: Browse table definitions and view sample data to verify content.

---
For technical support or feature requests, please contact the **SECL MBSE Team**.
