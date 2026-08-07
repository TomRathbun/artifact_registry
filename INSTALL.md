# Installation Guide

This guide covers the setup of both the Artifact Registry Backend and Frontend.

## 📋 Prerequisites

- **Python 3.12+**
- **Node.js 22.0+** (LTS recommended)
- **PostgreSQL 16+** (Optional: the project provides a portable setup script)
- **Git**

---

## 🏗 Automated Installation (Recommended)

The easiest way to set up the environment is to use the automated installation script. This script handles database initialization, folder creation, environment files, and dependency installation.

### Windows (One-Click)
1. Open your terminal in the project root.
2. Run the batch wrapper:
   ```cmd
   .\win_install.bat
   ```
   *Note: This wrapper automatically bypasses PowerShell execution policies for the installation session.*

### 🔧 Manual Setup (Optional)
If you prefer manual control, follow these steps:

Before starting the backend or frontend, initialize the portable PostgreSQL environment:

```powershell
# Initialize the local database data directory
.\scripts\setup_db.ps1

# 3. Create the data storage directory (sibling to the registry folder)
# This folder stores your uploads and database backups securely
mkdir ../registry-data
mkdir ../registry-data/uploads
mkdir ../registry-data/db_backups
```

## 🔧 Backend Setup (Python)

We recommend using [uv](https://github.com/astral-sh/uv) for high-performance dependency management.

### 1. Environment Configuration
Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://admin@127.0.0.1:5433/registry
# Required: use a long random string in any shared/networked install
SECRET_KEY=your-super-secret-key-here

# Relative paths to the sibling registry-data directory
# (absolute paths also work, e.g. C:/Users/YOU/dev/registry-data/uploads)
UPLOAD_DIR=../registry-data/uploads
BACKUP_DIR=../registry-data/db_backups
DATA_ARCHIVE_DIR=../registry-data/data_archives
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Default admin (seeded on first start if no users exist): username `admin`, password `seclpass` (forced password change).

### 2. Install Dependencies
```bash
uv sync
```

### 3. Database Initialization & Management (Windows)
The project includes self-contained PostgreSQL management scripts. For a seamless experience on Windows, use the batch wrappers:

```cmd
# Start the local database
.\win_start_db.bat

# Stop the local database
.\win_stop_db.bat
```

To apply migrations manually:
```powershell
# Apply migrations to create the schema
.\scripts\migrate_db.ps1
```

### 4. Start everything (Windows)
From the repo root:
```cmd
.\win_start_all.bat
```
This starts PostgreSQL (if portable binaries exist), the API on port **8000**, and the Vite UI on port **5173** in separate windows.

Or start pieces individually:
```cmd
.\win_start_db.bat
.\win_run_backend.bat
cd frontend && npm run dev
```

### 5. Manual Start (Non-Windows)
```bash
# Database: use your local PostgreSQL on the port in .env (default 5433)

# Backend
uv run uvicorn artifact_registry:app --reload --port 8000

# Frontend (second terminal)
cd frontend && npm install && npm run dev
```

API: http://127.0.0.1:8000/docs  
UI: http://127.0.0.1:5173

### Flat API routes
Artifact routes no longer use double prefixes. Examples:

| Resource | Path |
|----------|------|
| Visions | `/api/v1/visions/` |
| Needs | `/api/v1/needs/` |
| Use cases | `/api/v1/use-cases/` |
| Requirements | `/api/v1/requirements/` |
| Linkages | `/api/v1/linkages/` |
| Metadata areas | `/api/v1/metadata/areas` |

Regenerate the TypeScript client after API changes:
```powershell
.\scripts\generate_openapi_client.ps1
```

---

## 🐳 Initial Login
By default, a seed user is created during the first database initialization. 

To manually create an administrative user, you can use the provided script:

```powershell
# Add a new admin user interactively
python scripts/add_admin.py

# Or via command line arguments
python scripts/add_admin.py --username your_name --email your@email.com --password your_password
```

## 🛠 Common Maintenance Tasks

- **Create Backup**: Use the "Database" section within the application or run `.\scripts\backup_database.ps1`.
- **Restore Database**: Run `.\scripts\restore_database.ps1 <path_to_sql_file>`.
- **Reset Environment**: Run `.\scripts\drop_database.ps1` (Warning: destructive).
