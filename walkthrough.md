# Enhanced Navigation and Artifact Management Walkthrough

This walkthrough guides you through the verification of the new navigation system, artifact editor, and management views.

## 1. Navigation and Layout
- **Navigate to a Project**: Go to `/project/:projectId` (e.g., select a project from the dashboard).
- **Verify Sidebar**: Check the new sidebar with links to:
  - **Artifacts**: Visions, Needs, Use Cases, Requirements.
  - **Management**: Actors, Stakeholders, Areas.
- **Verify Layout**: Ensure the sidebar persists across different views and the main content area updates correctly.
- **Verify Vision Header**: Check if the project's vision statement is displayed at the top of relevant pages (except the Vision list itself).

## 2. Artifact List Views
- **Navigate to "Needs"**: Click on "Needs" in the sidebar.
- **Verify Filters**:
  - **Search**: Type a keyword and verify the list updates.
  - **Area**: Filter by area code (e.g., "MCK").
  - **Status**: Filter by status (e.g., "proposed").
- **Verify List Items**: Check that items display their ID, title/short name, and status badge.
- **Repeat**: Verify similar functionality for Use Cases and Requirements.

## 3. Artifact Editor
- **Edit an Artifact**: Click on an artifact in the list (e.g., a Need).
- **Verify Editor**:
  - Ensure the form loads with existing data.
  - Modify the title or description.
  - Change the status.
  - Click **Save**.
- **Verify Redirect**: Ensure you are redirected back to the list view.
- **Verify Update**: Check if the changes are reflected in the list.

## 4. Management Views (Metadata)
- **Navigate to "Actors"**: Click on "Actors" in the sidebar.
- **Add Actor**:
  - Click **Add Actor**.
  - Fill in Name, Complexity, Description.
  - Click **Save**.
  - Verify the new actor appears in the list.
- **Edit Actor**:
  - Click the **Edit** (pencil) icon.
  - Change the complexity.
  - Click **Save**.
  - Verify the change.
- **Delete Actor**:
  - Click the **Delete** (trash) icon.
  - Confirm deletion.
  - Verify the actor is removed.
- **Repeat**: Perform similar CRUD operations for **Stakeholders** (People) and **Areas**.

## 5. Backend Verification
- The backend has been updated with:
  - **Filtering**: `project_id`, `search`, `status` filters for all artifact lists.
  - **Metadata CRUD**: `PUT` and `DELETE` endpoints for Areas, People, and Actors.
- These are exercised automatically by the frontend views above.
