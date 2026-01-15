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
SECRET_KEY=your-super-secret-key-here

# Relative paths to the sibling registry-data directory
UPLOAD_DIR=../registry-data/uploads
BACKUP_DIR=../registry-data/db_backups
```

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

### 4. Start the Backend Server (Windows)
Run the following batch wrapper in the root directory:
```cmd
.\win_run_backend.bat
```
*Note: This script automatically handles reload optimizations (excluding .venv) and PowerShell execution policy bypass.*

### 5. Manual Start (Non-Windows)
If not on Windows, run:
```bash
uv run uvicorn artifact_registry:app --reload --port 8000
```

---

## 🎨 Frontend Setup (React)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API Endpoint
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

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
