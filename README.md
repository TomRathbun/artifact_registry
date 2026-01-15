# Artifact Registry

A comprehensive System Engineering and Enterprise Architecture artifact management platform. Designed for managing the lifecycle of project definitions, requirements, and traceability across complex system architectures.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=Artifact+Registry+Dashboard)

## 🚀 Key Features

- **Multi-Project Management**: Organize artifacts into distinct projects with dedicated dashboards.
- **Traceability Engine**: Create semantic linkages (Derives, Satisfies, Refines) between any artifact types.
- **Architecture Visualization**: 
  - **Artifact Graphs**: Interactive visualization of traceability networks.
  - **Component Diagrams**: Drag-and-drop architecture layout using React Flow.
  - **Sequence Diagrams**: Integrated Mermaid.js support for dynamic flow modeling.
- **Advanced Export/Import**:
  - Full project backup and restore via JSON.
  - Clean Markdown and Microsoft Word (DOCX) exports for documentation.
- **Database Administration**: Integrated tools for database health, backups, restoration, and real-time schema inspection.
- **Rich Media Support**: Integrated image gallery for managing system screenshots and diagrams.

## 🛠 Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Database**: PostgreSQL with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Package Management**: [uv](https://github.com/astral-sh/uv)

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: Tailwind CSS
- **Visuals**: [React Flow](https://reactflow.dev/), [Mermaid.js](https://mermaid.js.org/), [Lucide Icons](https://lucide.dev/)

---

## 🏗 Project Structure

- `app/`: Backend FastAPI application logic.
- `frontend/`: React application using Vite.
- `migrations/`: Alembic database migration scripts.
- `scripts/`: Utility scripts for database management and setup.
- `docs/`: Technical documentation and guides.
- `win_install.bat`: One-click Windows installer.

## 🚀 Getting Started (Windows)

The repository includes automated scripts for Windows:

1. Clone the repository.
2. Double-click `win_install.bat` in the root directory to install.
3. Once installed, use the following wrappers to manage the application:
   - `win_run_backend.bat`: Start the API server.
   - `win_start_db.bat`: Start the local database.
   - `win_stop_db.bat`: Stop the local database.
4. Follow the on-screen instructions for each script.

For manual installation or non-Windows systems, see the [Installation Guide](INSTALL.md).

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Created by the **Thomas Rathbun**
