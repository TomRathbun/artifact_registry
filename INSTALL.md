# Installation Guide

This guide covers the setup of both the Artifact Registry Backend and Frontend.

## 📋 Prerequisites

- **Python 3.12+**
- **Node.js 22.0+** (LTS recommended)
- **PostgreSQL 16+** (Optional: the project provides a portable setup script)
- **Git**

---

## 🏗 Initial Setup (Windows)

Before starting the backend or frontend, initialize the portable PostgreSQL environment:

```powershell
# 1. Download and extract portable PostgreSQL binaries
# 2. Initialize the local database data directory
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

### 3. Database Initialization (Windows)
The project includes self-contained PostgreSQL management scripts:

```powershell
# Start the local database
.\scripts\start_db.ps1

# Apply migrations to create the schema
.\scripts\migrate_db.ps1
```

### 4. Start the Backend Server
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
By default, a seed user is created during the first database initialization:
- **Username**: `admin`
- **Password**: (Contact administrator for initial provisioning)

## 🛠 Common Maintenance Tasks

- **Create Backup**: Use the "Database" section within the application or run `.\scripts\backup_database.ps1`.
- **Restore Database**: Run `.\scripts\restore_database.ps1 <path_to_sql_file>`.
- **Reset Environment**: Run `.\scripts\drop_database.ps1` (Warning: destructive).
