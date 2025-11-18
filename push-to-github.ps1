# LuckyDraw.pk Admin Panel - Push to GitHub (PowerShell Script)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LuckyDraw.pk Admin Panel - Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: This script must be run from the admin-panel directory!" -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Git repository not initialized!" -ForegroundColor Red
    Write-Host "Run: git init" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if remote is configured
try {
    $remoteUrl = git remote get-url origin 2>$null
    if (-not $remoteUrl) {
        throw "No remote configured"
    }
} catch {
    Write-Host "ERROR: GitHub remote not configured!" -ForegroundColor Red
    Write-Host "Please run the setup script first." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Show current status
Write-Host "Current status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Check if there are changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

# Ask for commit message
$commitMsg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Commit message: $commitMsg" -ForegroundColor Cyan
git commit -m $commitMsg

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "WARNING: Commit failed or no changes to commit!" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Code pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Admin Panel repository updated successfully!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR: Push failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Please check your internet connection and try again." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"

