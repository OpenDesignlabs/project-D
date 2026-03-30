<#
.SYNOPSIS
Builds all Vectra folders utilizing their respective .sh scripts.
#>

$workingDir = $PSScriptRoot

function Run-Build {
    param([string]$folder)
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Building $folder..." -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    
    # Use native PowerShell to build sequentially
    # Sequential is safer to ensure types build before server/studio/marketplace.
    $process = Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd $folder; pnpm run build" -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -ne 0) {
        Write-Error "Build failed for $folder! Exit code: $($process.ExitCode)"
        exit $process.ExitCode
    }
    Write-Host "Successfully built $folder.`n" -ForegroundColor Green
}

# Sequence is important: Build types first, so others can consume the latest types.
Run-Build "vectra-types"
Run-Build "vectra-server"
Run-Build "vectra-marketplace"
Run-Build "vectra-studio"

Write-Host "All projects built successfully!" -ForegroundColor Green
