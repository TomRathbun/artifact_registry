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
def get_system_info(db: Session = Depends(deps.get_db), _user=Depends(deps.get_current_user)):
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
        "version": settings.VERSION,
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

from pydantic import BaseModel, Field
import re
import shutil
import subprocess
from typing import Optional


def _registry_root() -> str:
    return str(settings.BASE_DIR)


def _frontend_dir() -> str:
    return os.path.join(_registry_root(), "frontend")


def _tool_path(name: str) -> str:
    """Resolve executable; on Windows prefer .cmd for npm when needed."""
    found = shutil.which(name)
    if found:
        return found
    if os.name == "nt":
        found = shutil.which(f"{name}.cmd") or shutil.which(f"{name}.exe")
        if found:
            return found
    return name


def _run_cmd(cmd: list[str], cwd: str, timeout: int = 600) -> tuple[int, str]:
    """Run a command without shell=True (avoids Windows arg mangling)."""
    try:
        process = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            shell=False,
            timeout=timeout,
        )
        out = "\n".join(
            part for part in (process.stdout or "", process.stderr or "") if part
        ).strip()
        return process.returncode, out
    except FileNotFoundError as e:
        return 127, f"Command not found: {cmd[0]} ({e})"
    except subprocess.TimeoutExpired:
        return 124, f"Command timed out after {timeout}s: {' '.join(cmd)}"


def _error_snippet(output: str, max_lines: int = 15) -> str:
    """Pick the most useful lines from tool output for the UI."""
    if not output:
        return "No output from package manager."
    lines = [ln.rstrip() for ln in output.splitlines() if ln.strip()]
    keywords = (
        "error",
        "not found",
        "404",
        "failed",
        "conflict",
        "unsatisfiable",
        "×",
        "╰",
        "ENOENT",
        "E404",
        "could not",
        "no matching",
    )
    important = [
        ln for ln in lines if any(k in ln.lower() for k in keywords)
    ]
    pick = important[-max_lines:] if important else lines[-max_lines:]
    return "\n".join(pick)


def _strip_pep508_name(req: str) -> str:
    """'pydantic[email]>=2' / 'uvicorn[standard]' -> package name."""
    name = req.strip()
    for sep in ("[", ">", "<", "=", "!", " ", ";"):
        if sep in name:
            name = name.split(sep, 1)[0]
    return name.strip()


def _direct_pypi_names() -> set[str]:
    """Package names declared in pyproject.toml (not the full lock tree)."""
    pyproject = os.path.join(_registry_root(), "pyproject.toml")
    names: set[str] = set()
    if not os.path.exists(pyproject):
        return names
    with open(pyproject, "rb") as f:
        data = tomllib.load(f)
    for req in data.get("project", {}).get("dependencies", []) or []:
        names.add(_strip_pep508_name(req).lower())
    for group in (data.get("dependency-groups") or {}).values():
        for req in group or []:
            names.add(_strip_pep508_name(req).lower())
    names.discard("artifact-registry")
    names.discard("artifact_registry")
    return names


def _lock_versions() -> dict[str, str]:
    lock_path = os.path.join(_registry_root(), "uv.lock")
    versions: dict[str, str] = {}
    if not os.path.exists(lock_path):
        return versions
    with open(lock_path, "rb") as f:
        data = tomllib.load(f)
    for pkg in data.get("package", []) or []:
        n = pkg.get("name")
        v = pkg.get("version")
        if n and v:
            versions[n.lower()] = v
    return versions


def _direct_npm_deps() -> dict[str, str]:
    """name -> declared version range from package.json."""
    pkg_path = os.path.join(_frontend_dir(), "package.json")
    if not os.path.exists(pkg_path):
        return {}
    with open(pkg_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    out: dict[str, str] = {}
    for section in ("dependencies", "devDependencies"):
        for name, ver in (data.get(section) or {}).items():
            out[name] = str(ver)
    return out


@router.get("/dependencies")
def get_dependencies(_auth=Depends(deps.check_permissions(["admin"]))):
    """
    List direct project dependencies (not the full transitive lock tree).
    """
    frontend_deps = []
    for name, version in _direct_npm_deps().items():
        frontend_deps.append(
            {
                "name": name,
                "version": version.replace("^", "").replace("~", ""),
                "source": "npm",
                "direct": True,
            }
        )

    lock_versions = _lock_versions()
    backend_deps = []
    for name in sorted(_direct_pypi_names()):
        backend_deps.append(
            {
                "name": name,
                "version": lock_versions.get(name, "unknown"),
                "source": "pypi",
                "direct": True,
            }
        )

    def fetch_npm_info(pkg):
        try:
            r = requests.get(
                f"https://registry.npmjs.org/{pkg['name']}/latest", timeout=5
            )
            if r.status_code == 200:
                data = r.json()
                pkg["latest"] = data.get("version")
                pkg["description"] = data.get("description")
                pkg["homepage"] = data.get("homepage")
            elif r.status_code == 404:
                pkg["latest"] = None
                pkg["description"] = "Package not found on npm registry (404)."
                pkg["missing"] = True
        except Exception as e:
            pkg["description"] = f"Could not reach npm registry: {e}"
        return pkg

    def fetch_pypi_info(pkg):
        try:
            r = requests.get(f"https://pypi.org/pypi/{pkg['name']}/json", timeout=5)
            if r.status_code == 200:
                data = r.json()
                pkg["latest"] = data.get("info", {}).get("version")
                pkg["description"] = data.get("info", {}).get("summary")
                pkg["homepage"] = data.get("info", {}).get("home_page") or data.get(
                    "info", {}
                ).get("project_url")
            elif r.status_code == 404:
                pkg["latest"] = None
                pkg["description"] = "Package not found on PyPI (404)."
                pkg["missing"] = True
        except Exception as e:
            pkg["description"] = f"Could not reach PyPI: {e}"
        return pkg

    all_deps = frontend_deps + backend_deps
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for pkg in all_deps:
            if pkg["source"] == "npm":
                futures.append(executor.submit(fetch_npm_info, pkg.copy()))
            else:
                futures.append(executor.submit(fetch_pypi_info, pkg.copy()))
        results = [f.result() for f in futures]

    return {
        "frontend": [r for r in results if r["source"] == "npm"],
        "backend": [r for r in results if r["source"] == "pypi"],
    }


class UpgradeRequest(BaseModel):
    name: str
    version: Optional[str] = Field(default="latest")
    source: str  # "npm" or "pypi"


class UpgradeAllRequest(BaseModel):
    source: str  # "npm", "pypi", or "all"


@router.post("/dependencies/analyze")
async def analyze_dependency(
    request: UpgradeRequest, _auth=Depends(deps.check_permissions(["admin"]))
):
    """Dry-run compatibility check for a single package."""
    root = _registry_root()
    name = (request.name or "").strip()
    if not name:
        return {"safe": False, "summary": "Package name is required.", "issues": [], "analysis": ""}

    try:
        if request.source == "pypi":
            uv = _tool_path("uv")
            rc, output = _run_cmd(
                [uv, "sync", "--upgrade-package", name, "--dry-run"],
                cwd=root,
            )
            issues = [
                ln.strip()
                for ln in output.splitlines()
                if any(
                    k in ln.lower()
                    for k in ("error", "conflict", "not found", "unsatisfiable", "×")
                )
            ]
            return {
                "safe": rc == 0,
                "analysis": output[-4000:],
                "issues": issues[:8],
                "summary": (
                    f"Dry-run OK for {name}."
                    if rc == 0
                    else f"Dry-run failed for {name}: {_error_snippet(output)}"
                ),
            }

        if request.source == "npm":
            npm = _tool_path("npm")
            target = (request.version or "latest").strip() or "latest"
            spec = f"{name}@{target}"
            rc, output = _run_cmd(
                [npm, "install", spec, "--dry-run", "--json"],
                cwd=_frontend_dir(),
            )
            issues: list[str] = []
            try:
                data = json.loads(output) if output.strip().startswith("{") else {}
                err = data.get("error") or {}
                if isinstance(err, dict):
                    detail = err.get("detail") or err.get("summary") or err.get("code")
                    if detail:
                        issues = [str(detail)] if isinstance(detail, str) else list(detail)
            except json.JSONDecodeError:
                pass
            if not issues and rc != 0:
                issues = [_error_snippet(output)]
            return {
                "safe": rc == 0,
                "analysis": output[-4000:],
                "issues": issues[:8],
                "summary": (
                    f"Dry-run OK for {spec}."
                    if rc == 0
                    else f"Dry-run failed for {spec}: {_error_snippet(output)}"
                ),
            }

        return {
            "safe": False,
            "summary": f"Invalid source '{request.source}' (use npm or pypi).",
            "issues": [],
            "analysis": "",
        }
    except Exception as e:
        return {
            "safe": False,
            "summary": f"Analysis failed: {e}",
            "issues": [str(e)],
            "analysis": "",
        }


@router.get("/changelog")
def get_changelog(_user=Depends(deps.get_current_user)):
    """Get the content of CHANGELOG.md"""
    changelog_path = os.path.join(_registry_root(), "CHANGELOG.md")
    if os.path.exists(changelog_path):
        with open(changelog_path, "r", encoding="utf-8") as f:
            return {"content": f.read()}
    return {"content": "# Changelog\n\nNot found."}


@router.post("/dependencies/upgrade")
async def upgrade_dependency(
    request: UpgradeRequest, _auth=Depends(deps.check_permissions(["admin"]))
):
    """
    Upgrade a single direct dependency.
    Returns a clear message + detail (tool stderr/stdout snippet) on failure.
    """
    root = _registry_root()
    name = (request.name or "").strip()
    target = (request.version or "latest").strip() or "latest"
    source = (request.source or "").lower().strip()

    if not name:
        return {"success": False, "message": "Package name is required.", "detail": ""}

    try:
        if source == "pypi":
            direct = _direct_pypi_names()
            if name.lower() not in direct:
                return {
                    "success": False,
                    "message": (
                        f"'{name}' is not a direct project dependency in pyproject.toml. "
                        "Only declared dependencies can be upgraded here (transitive packages "
                        "update automatically with their parents)."
                    ),
                    "detail": f"Direct dependencies: {', '.join(sorted(direct))}",
                }

            uv = _tool_path("uv")
            check_rc, check_out = _run_cmd(
                [uv, "sync", "--upgrade-package", name, "--dry-run"],
                cwd=root,
            )
            if check_rc != 0:
                return {
                    "success": False,
                    "message": f"Compatibility check failed for '{name}'.",
                    "detail": _error_snippet(check_out),
                    "raw": check_out[-3000:],
                }

            up_rc, up_out = _run_cmd(
                [uv, "sync", "--upgrade-package", name],
                cwd=root,
            )
            if up_rc == 0:
                return {
                    "success": True,
                    "message": f"Successfully upgraded '{name}'.",
                    "detail": _error_snippet(up_out) if up_out else "",
                }
            return {
                "success": False,
                "message": f"Upgrade failed for '{name}'.",
                "detail": _error_snippet(up_out),
                "raw": up_out[-3000:],
            }

        if source == "npm":
            declared = _direct_npm_deps()
            if name not in declared:
                return {
                    "success": False,
                    "message": (
                        f"'{name}' is not listed in frontend/package.json "
                        "(dependencies or devDependencies)."
                    ),
                    "detail": "",
                }

            # Verify package exists on registry first
            try:
                probe = requests.get(
                    f"https://registry.npmjs.org/{name}", timeout=8
                )
                if probe.status_code == 404:
                    return {
                        "success": False,
                        "message": f"Package '{name}' was not found on the npm registry (404).",
                        "detail": (
                            "It may have been renamed, unpublished, or the name is misspelled. "
                            f"Check https://www.npmjs.com/package/{name}"
                        ),
                    }
            except requests.RequestException:
                pass

            npm = _tool_path("npm")
            frontend = _frontend_dir()

            # Prefer semver-safe update within package.json range first.
            # Jumping to absolute @latest often breaks peers (e.g. plugin-react 6 needs vite 8).
            safe_rc, safe_out = _run_cmd([npm, "update", name], cwd=frontend, timeout=600)
            if safe_rc == 0:
                return {
                    "success": True,
                    "message": (
                        f"Updated '{name}' within package.json version range "
                        f"(declared: {declared.get(name, '?')})."
                    ),
                    "detail": (
                        "This is the safe path. Absolute @latest may require "
                        "coordinated major upgrades of related packages."
                    ),
                }

            # If caller asked for a specific/latest version, try install with peer-aware message
            spec = f"{name}@{target}"
            up_rc, up_out = _run_cmd([npm, "install", spec], cwd=frontend, timeout=600)
            if up_rc == 0:
                return {
                    "success": True,
                    "message": f"Successfully upgraded '{spec}'.",
                    "detail": "",
                }

            peer_hint = ""
            low = up_out.lower()
            if "peer" in low or "erresolve" in low or "conflicting peer" in low:
                peer_hint = (
                    "\n\nPeer dependency conflict: this package's latest major "
                    "does not match other packages in package.json (common with "
                    "eslint/* or vite + @vitejs/plugin-react). "
                    "Use Update All (semver-safe) or bump related packages together "
                    "in package.json, then run npm install."
                )

            return {
                "success": False,
                "message": f"Upgrade failed for '{spec}'.{peer_hint}",
                "detail": _error_snippet(up_out),
                "raw": up_out[-3000:],
            }

        return {
            "success": False,
            "message": f"Invalid source '{source}' (use 'npm' or 'pypi').",
            "detail": "",
        }
    except Exception as e:
        return {"success": False, "message": f"Upgrade error: {e}", "detail": str(e)}


@router.post("/dependencies/upgrade-all")
async def upgrade_all_dependencies(
    request: UpgradeAllRequest,
    _auth=Depends(deps.check_permissions(["admin"])),
):
    """
    Upgrade all packages for npm (frontend), pypi (backend), or both.
    - pypi: `uv sync --upgrade`
    - npm: upgrade each outdated direct package to its latest version
    """
    source = (request.source or "").lower().strip()
    if source not in ("npm", "pypi", "all"):
        return {
            "success": False,
            "message": "source must be 'npm', 'pypi', or 'all'",
            "detail": "",
            "results": [],
        }

    results: list[dict] = []
    overall_ok = True
    root = _registry_root()

    try:
        if source in ("pypi", "all"):
            uv = _tool_path("uv")
            rc, out = _run_cmd([uv, "sync", "--upgrade"], cwd=root, timeout=900)
            ok = rc == 0
            if not ok:
                overall_ok = False
            results.append(
                {
                    "source": "pypi",
                    "success": ok,
                    "message": (
                        "Backend (PyPI) packages upgraded via `uv sync --upgrade`."
                        if ok
                        else f"Backend upgrade failed: {_error_snippet(out)}"
                    ),
                    "detail": "" if ok else out[-2000:],
                }
            )

        if source in ("npm", "all"):
            # Semver-safe bulk update: respects ranges in package.json (^7 stays on 7.x).
            # Installing every package at absolute @latest causes peer conflicts
            # (e.g. @vitejs/plugin-react@6 needs vite@8 while package.json has vite@^7).
            npm = _tool_path("npm")
            frontend = _frontend_dir()
            rc, out = _run_cmd([npm, "update"], cwd=frontend, timeout=900)
            ok = rc == 0
            if not ok:
                overall_ok = False

            # Count remaining outdated *wanted* (within range) vs latest (beyond range)
            _, outdated_out = _run_cmd([npm, "outdated", "--json"], cwd=frontend)
            outdated: dict = {}
            try:
                raw = outdated_out.strip()
                if raw.startswith("{"):
                    outdated = json.loads(raw)
                else:
                    m = re.search(r"\{[\s\S]*\}", raw)
                    if m:
                        outdated = json.loads(m.group(0))
            except json.JSONDecodeError:
                outdated = {}

            declared = set(_direct_npm_deps().keys())
            within_range = 0
            beyond_range = 0
            beyond_names: list[str] = []
            for name, info in outdated.items():
                if name not in declared:
                    continue
                current = str((info or {}).get("current") or "")
                wanted = str((info or {}).get("wanted") or "")
                latest = str((info or {}).get("latest") or "")
                if wanted and current and wanted != current:
                    within_range += 1
                if latest and wanted and latest != wanted:
                    beyond_range += 1
                    beyond_names.append(f"{name} (latest {latest}, range allows {wanted})")

            if ok:
                msg = (
                    "Frontend (npm): ran `npm update` (semver-safe within package.json ranges)."
                )
                if beyond_range:
                    msg += (
                        f" {beyond_range} package(s) have newer major versions outside "
                        f"your declared ranges; bump package.json deliberately for those."
                    )
                elif not outdated:
                    msg += " Tree looks up to date within ranges."
            else:
                msg = f"Frontend (npm) `npm update` failed: {_error_snippet(out)}"

            results.append(
                {
                    "source": "npm",
                    "success": ok,
                    "message": msg,
                    "detail": (
                        "\n".join(beyond_names[:20])
                        if beyond_names
                        else ("" if ok else out[-2000:])
                    ),
                    "beyond_range": beyond_names[:30],
                    "still_outdated_within_range": within_range,
                }
            )

        summary = " | ".join(r.get("message", "") for r in results)
        detail_parts = []
        for r in results:
            if r.get("failed"):
                for f in r["failed"]:
                    detail_parts.append(f"{f['name']}: {f.get('error', '')}")
            if r.get("detail") and not r.get("success"):
                detail_parts.append(str(r["detail"]))

        return {
            "success": overall_ok,
            "message": summary,
            "detail": "\n\n".join(detail_parts)[:4000],
            "results": results,
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e),
            "detail": str(e),
            "results": results,
        }

