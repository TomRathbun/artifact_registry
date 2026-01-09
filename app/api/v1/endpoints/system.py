from fastapi import APIRouter
from app.core.config import settings
import sys
import platform

router = APIRouter()

import fastapi
import platform
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps

@router.get("/info")
def get_system_info(db: Session = Depends(deps.get_db)):
    """
    Get system version information.
    """
    db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite"
    db_version = "Unknown"
    
    try:
        if db_type == "PostgreSQL":
            # Returns something like "PostgreSQL 16.1 on x86_64..."
            # We want to extract just the version number usually, but the full string is info-rich
            # Let's try to get a cleaner version
            result = db.execute(text("SHOW server_version;")).scalar()
            db_version = result
        else:
            result = db.execute(text("SELECT sqlite_version();")).scalar()
            db_version = result
    except Exception as e:
        error_msg = str(e)
        if "connection refused" in error_msg.lower():
            db_version = "Unavailable (Connection Refused - Check if DB is running)"
        else:
            db_version = f"Error: {error_msg.split(')')[0] + ')' if ')' in error_msg else error_msg[:100] + '...'}"

    node_version = "Unknown"
    try:
        import subprocess
        node_version = subprocess.check_output(["node", "-v"], text=True).strip()
    except Exception:
        pass

    return {
        "app_name": settings.PROJECT_NAME,
        "version": "0.1.0",
        "python_version": platform.python_version(),
        "node_version": node_version,
        "fastapi_version": fastapi.__version__,
        "database_type": db_type,
        "database_version": db_version,
    }
import json
import os
try:
    import tomllib
except ImportError:
    import toml as tomllib # Fallback if needed but 3.11+ has tomllib
import requests
from concurrent.futures import ThreadPoolExecutor

@router.get("/dependencies")
def get_dependencies(_auth = Depends(deps.check_permissions(["admin"]))):
    """
    Get dependency information for frontend and backend.
    """
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")) # Adjust based on depth
    # Actually simpler to use absolute paths since we know the structure
    # c:\Users\USER\registry
    registry_root = "c:\\Users\\USER\\registry"
    
    frontend_pkg = os.path.join(registry_root, "frontend", "package.json")
    backend_lock = os.path.join(registry_root, "uv.lock")
    
    frontend_deps = []
    if os.path.exists(frontend_pkg):
        with open(frontend_pkg, 'r') as f:
            data = json.load(f)
            deps = data.get('dependencies', {})
            dev_deps = data.get('devDependencies', {})
            for name, version in {**deps, **dev_deps}.items():
                frontend_deps.append({
                    "name": name,
                    "version": version.replace('^', '').replace('~', ''),
                    "source": "npm"
                })

    backend_deps = []
    if os.path.exists(backend_lock):
        with open(backend_lock, 'rb') as f:
            data = tomllib.load(f)
            packages = data.get('package', [])
            for pkg in packages:
                if pkg.get('name') != "artifact-registry": # Skip self
                    backend_deps.append({
                        "name": pkg.get('name'),
                        "version": pkg.get('version'),
                        "source": "pypi"
                    })

    # Limit to top N for performance or fetch on demand? 
    # Let's try to fetch for all but use a thread pool for speed.
    def fetch_npm_info(pkg):
        try:
            r = requests.get(f"https://registry.npmjs.org/{pkg['name']}/latest", timeout=2)
            if r.status_code == 200:
                data = r.json()
                pkg['latest'] = data.get('version')
                pkg['description'] = data.get('description')
                pkg['homepage'] = data.get('homepage')
        except:
            pass
        return pkg

    def fetch_pypi_info(pkg):
        try:
            r = requests.get(f"https://pypi.org/pypi/{pkg['name']}/json", timeout=2)
            if r.status_code == 200:
                data = r.json()
                pkg['latest'] = data.get('info', {}).get('version')
                pkg['description'] = data.get('info', {}).get('summary')
                pkg['homepage'] = data.get('info', {}).get('home_page')
        except:
            pass
        return pkg

    # Use a ThreadPool to make it faster.
    all_deps = frontend_deps + backend_deps
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for pkg in all_deps:
            if pkg['source'] == "npm":
                futures.append(executor.submit(fetch_npm_info, pkg.copy()))
            else:
                futures.append(executor.submit(fetch_pypi_info, pkg.copy()))
        
        results = [f.result() for f in futures]

    return {
        "frontend": [r for r in results if r['source'] == "npm"],
        "backend": [r for r in results if r['source'] == "pypi"]
    }

from pydantic import BaseModel
import subprocess

class UpgradeRequest(BaseModel):
    name: str
    version: str
    source: str # "npm" or "pypi"

@router.post("/dependencies/analyze")
async def analyze_dependency(request: UpgradeRequest, _auth = Depends(deps.check_permissions(["admin"]))):
    """
    Perform a detailed dry-run check to identify potential compatibility issues.
    """
    registry_root = "c:\\Users\\USER\\registry"
    
    try:
        if request.source == "pypi":
            # uv sync --upgrade-package <package> --dry-run --verbose
            cmd = ["uv", "sync", "--upgrade-package", f"{request.name}", "--dry-run"]
            process = subprocess.run(cmd, cwd=registry_root, capture_output=True, text=True, shell=True)
            
            output = process.stderr if process.stderr else process.stdout
            is_safe = process.returncode == 0
            
            # Simple heuristic for compatibility issues
            issues = []
            if not is_safe:
                issues = [line.strip() for line in output.split('\n') if 'error' in line.lower() or 'conflict' in line.lower()]
            
            return {
                "safe": is_safe,
                "analysis": output,
                "issues": issues[:5], # Return first few issues
                "summary": "No major conflicts detected in dependency tree." if is_safe else "Found resolution conflicts with other packages."
            }

        elif request.source == "npm":
            frontend_dir = os.path.join(registry_root, "frontend")
            # npm install <package>@latest --dry-run
            cmd = ["npm", "install", f"{request.name}@latest", "--dry-run", "--json"]
            process = subprocess.run(cmd, cwd=frontend_dir, capture_output=True, text=True, shell=True)
            
            try:
                data = json.loads(process.stdout)
                is_safe = process.returncode == 0
                return {
                    "safe": is_safe,
                    "analysis": "Analyzed via npm dry-run",
                    "issues": data.get('error', {}).get('detail', []) if not is_safe else [],
                    "summary": f"Targeting {request.version}. Dry-run completed successfully." if is_safe else "NPM detected peer dependency or resolution conflicts."
                }
            except:
                return {
                    "safe": process.returncode == 0,
                    "analysis": process.stderr or process.stdout,
                    "issues": [],
                    "summary": "Dry-run check completed."
                }

        return {"safe": False, "summary": "Invalid source."}
    except Exception as e:
        return {"safe": False, "summary": f"Analysis failed: {str(e)}"}

@router.get("/changelog")
def get_changelog():
    """
    Get the content of CHANGELOG.md
    """
    registry_root = "c:\\Users\\USER\\registry"
    changelog_path = os.path.join(registry_root, "CHANGELOG.md")
    
    if os.path.exists(changelog_path):
        with open(changelog_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {"content": content}
    return {"content": "# Changelog\n\nNot found."}


@router.post("/dependencies/upgrade")
async def upgrade_dependency(request: UpgradeRequest, _auth = Depends(deps.check_permissions(["admin"]))):
    """
    Perform a dry-run compatibility check and then upgrade if safe.
    """
    registry_root = "c:\\Users\\USER\\registry"
    
    try:
        if request.source == "pypi":
            # Use uv to check compatibility first (dry-run)
            # uv sync --upgrade-package <package> --dry-run
            check_cmd = ["uv", "sync", "--upgrade-package", f"{request.name}", "--dry-run"]
            check_process = subprocess.run(check_cmd, cwd=registry_root, capture_output=True, text=True, shell=True)
            
            if check_process.returncode != 0:
                return {
                    "success": False,
                    "message": f"Compatibility check failed: {check_process.stderr or check_process.stdout}"
                }
            
            # If check passes, perform the actual upgrade
            upgrade_cmd = ["uv", "sync", "--upgrade-package", f"{request.name}"]
            upgrade_process = subprocess.run(upgrade_cmd, cwd=registry_root, capture_output=True, text=True, shell=True)
            
            if upgrade_process.returncode == 0:
                return {"success": True, "message": f"Successfully upgraded {request.name}."}
            else:
                return {"success": False, "message": f"Upgrade failed: {upgrade_process.stderr}"}

        elif request.source == "npm":
            frontend_dir = os.path.join(registry_root, "frontend")
            # For npm, we can use --dry-run as well
            check_cmd = ["npm", "install", f"{request.name}@latest", "--dry-run"]
            check_process = subprocess.run(check_cmd, cwd=frontend_dir, capture_output=True, text=True, shell=True)

            if check_process.returncode != 0:
                return {
                    "success": False,
                    "message": f"Compatibility check failed: {check_process.stderr or check_process.stdout}"
                }

            # Perform actual upgrade
            upgrade_cmd = ["npm", "install", f"{request.name}@latest"]
            upgrade_process = subprocess.run(upgrade_cmd, cwd=frontend_dir, capture_output=True, text=True, shell=True)

            if upgrade_process.returncode == 0:
                return {"success": True, "message": f"Successfully upgraded {request.name}."}
            else:
                return {"success": False, "message": f"Upgrade failed: {upgrade_process.stderr}"}

        return {"success": False, "message": "Invalid source."}
    except Exception as e:
        return {"success": False, "message": str(e)}
