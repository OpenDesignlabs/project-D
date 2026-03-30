<#
.SYNOPSIS
Starts all Vectra development servers using the .sh scripts in their respective folders.
#>

$workingDir = $PSScriptRoot

function Start-DevServer {
    param([string]$folder)
    Write-Host "Starting dev server for $folder..." -ForegroundColor Cyan
    $scriptDir = Join-Path -Path $workingDir -ChildPath $folder
    
    # Start the dev process natively with PowerShell
    Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd $folder; pnpm run dev"
}

# Add a slight delay between starts if needed, but otherwise start them all concurrently
Start-DevServer "vectra-types"
Start-Sleep -Seconds 2  # Give types a moment to start up

Start-DevServer "vectra-server"
Start-DevServer "vectra-marketplace"
Start-DevServer "vectra-studio"

Write-Host "All development servers started in the background." -ForegroundColor Green
Write-Host "NOTE: To stop them, you may need to kill the node/bash processes or close the terminal." -ForegroundColor Yellow
