@echo off
echo ========================================
echo   LuckyDraw.pk Admin Panel - Push to GitHub
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: This script must be run from the admin-panel directory!
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Check if git is initialized
if not exist ".git" (
    echo ERROR: Git repository not initialized!
    echo Run: git init
    pause
    exit /b 1
)

REM Check if remote is configured
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: GitHub remote not configured!
    echo Please run the setup script first.
    pause
    exit /b 1
)

REM Show current status
echo Current status:
git status --short
echo.

REM Ask for commit message
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update: %date% %time%

echo.
echo Committing changes...
git add .

echo.
echo Commit message: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

if %errorlevel% neq 0 (
    echo.
    echo WARNING: No changes to commit or commit failed!
    echo.
    pause
    exit /b 1
)

echo.
echo Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Code pushed to GitHub
    echo ========================================
    echo Admin Panel repository updated successfully!
) else (
    echo.
    echo ========================================
    echo   ERROR: Push failed!
    echo ========================================
    echo Please check your internet connection and try again.
)

echo.
pause

