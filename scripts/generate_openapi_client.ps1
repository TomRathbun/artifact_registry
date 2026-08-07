# Generate frontend OpenAPI TypeScript client from the live FastAPI app schema.
# Usage (from repo root):  .\scripts\generate_openapi_client.ps1
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host "Exporting OpenAPI schema from FastAPI app..." -ForegroundColor Cyan
$env:TESTING = "1"
$env:DATABASE_URL = "sqlite://"
$env:SECRET_KEY = "codegen-only-not-for-runtime"
$env:ALLOW_INSECURE_DEFAULTS = "true"

uv run python -c @"
from artifact_registry import app
import json
from pathlib import Path
schema = app.openapi()
out = Path('frontend/openapi.json')
out.write_text(json.dumps(schema, indent=2), encoding='utf-8')
print(f'Wrote {out} ({len(schema.get(\"paths\", {}))} paths)')
"@

Write-Host "Running openapi-typescript-codegen..." -ForegroundColor Cyan
Push-Location frontend
if (-not (Test-Path "node_modules/openapi-typescript-codegen")) {
    npm install -D openapi-typescript-codegen
}
npx openapi-typescript-codegen --input ./openapi.json --output ./src/client --client axios

# Re-apply compatibility aliases at end of index.ts if missing
$index = "src/client/index.ts"
$content = Get-Content $index -Raw
$aliasBlock = @"

// Compatibility aliases (path-flatten + historical names)
export { ComponentsService as ComponentService } from './services/ComponentsService';
export { SitesService as SiteService } from './services/SitesService';
export { EventsService as ArtifactEventsService } from './services/EventsService';
export { VisionsService as VisionService } from './services/VisionsService';
export { UseCasesService as UseCaseService } from './services/UseCasesService';
export { NeedsService as NeedService } from './services/NeedsService';
export { RequirementsService as RequirementService } from './services/RequirementsService';
export { LinkagesService as LinkageService } from './services/LinkagesService';
"@
if ($content -notmatch "as ComponentService") {
    Add-Content -Path $index -Value $aliasBlock
    Write-Host "Appended compatibility aliases to index.ts" -ForegroundColor Yellow
}

# Re-apply 401 session-clearing hook if missing
$req = "src/client/core/request.ts"
$reqText = Get-Content $req -Raw
if ($reqText -notmatch "clear session so AuthGuard") {
    $reqText = $reqText -replace `
        '(export const catchErrorCodes = \(options: ApiRequestOptions, result: ApiResult\): void => \{\r?\n)(    const errors:)', `
        "`$1    // On 401, clear session so AuthGuard / login flow can recover`r`n    // (hand-maintained after openapi-typescript-codegen regeneration)`r`n    if (result.status === 401 && typeof window !== 'undefined') {`r`n        try {`r`n            localStorage.removeItem('token');`r`n            localStorage.removeItem('user');`r`n            if (!window.location.pathname.startsWith('/login')) {`r`n                window.location.href = '/login';`r`n            }`r`n        } catch {`r`n            // ignore storage errors`r`n        }`r`n    }`r`n`r`n`$2"
    Set-Content -Path $req -Value $reqText -NoNewline
    Write-Host "Re-applied 401 handler to request.ts" -ForegroundColor Yellow
}

Pop-Location
Write-Host "OpenAPI client regeneration complete." -ForegroundColor Green
