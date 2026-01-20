#
# IHateWork Complete Uninstaller for Windows
#
# Usage:
#   Right-click and "Run with PowerShell"
#
# Or from PowerShell:
#   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
#   .\uninstall-windows.ps1
#

$ErrorActionPreference = "SilentlyContinue"

$APP_NAME = "IHW-ZoZ"

Write-Host "╔════════════════════════════════════════╗"
Write-Host "║  IHateWork Uninstaller for Windows     ║"
Write-Host "╚════════════════════════════════════════╝"
Write-Host ""

$removed = 0

function Remove-IfExists {
    param([string]$Path)
    if (Test-Path $Path) {
        Remove-Item -Path $Path -Recurse -Force
        Write-Host "[uninstall] Removed: $Path"
        $script:removed++
    }
}

Write-Host "[uninstall] Removing application data..."

# Roaming AppData
Remove-IfExists "$env:APPDATA\$APP_NAME"
Remove-IfExists "$env:APPDATA\ihw-zoz"

# Local AppData
Remove-IfExists "$env:LOCALAPPDATA\$APP_NAME"
Remove-IfExists "$env:LOCALAPPDATA\ihw-zoz"
Remove-IfExists "$env:LOCALAPPDATA\ihw-zoz-updater"

# Program Files (for per-machine installation)
Remove-IfExists "$env:ProgramFiles\$APP_NAME"
Remove-IfExists "${env:ProgramFiles(x86)}\$APP_NAME"

# Per-user installation location
Remove-IfExists "$env:LOCALAPPDATA\Programs\$APP_NAME"
Remove-IfExists "$env:LOCALAPPDATA\Programs\ihw-zoz"

# Desktop shortcuts
Remove-IfExists "$env:USERPROFILE\Desktop\IHW-ZoZ.lnk"
Remove-IfExists "$env:USERPROFILE\Desktop\IHateWork.lnk"

# Start Menu
Remove-IfExists "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\$APP_NAME"
Remove-IfExists "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\IHateWork"

# Try Winget uninstall
Write-Host "[uninstall] Checking Winget installation..."
try {
    $wingetList = winget list maplex18.IHateWork 2>$null
    if ($LASTEXITCODE -eq 0) {
        winget uninstall maplex18.IHateWork --silent
        Write-Host "[uninstall] Removed Winget installation"
        $removed++
    }
} catch {
    # Winget not available or app not installed
}

# Try to run the NSIS uninstaller if it exists
$uninstallers = @(
    "$env:LOCALAPPDATA\Programs\$APP_NAME\Uninstall $APP_NAME.exe",
    "$env:ProgramFiles\$APP_NAME\Uninstall $APP_NAME.exe"
)

foreach ($uninstaller in $uninstallers) {
    if (Test-Path $uninstaller) {
        Write-Host "[uninstall] Running NSIS uninstaller..."
        Start-Process -FilePath $uninstaller -ArgumentList "/S" -Wait
        $removed++
        break
    }
}

Write-Host ""
Write-Host "[uninstall] Complete! Removed $removed items."
Write-Host ""
Write-Host "Note: Some registry entries may remain. You can use Windows Settings > Apps to fully uninstall."

# Keep window open
Read-Host -Prompt "Press Enter to exit"
