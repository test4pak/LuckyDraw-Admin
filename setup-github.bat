@echo off
echo ========================================
echo   Admin Panel - GitHub Setup
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: This script must be run from the admin-panel directory!
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo This script will set up the GitHub repository for the admin panel.
echo.
echo Prerequisites:
echo 1. Create a new repository on GitHub (e.g., luckydraw-pk-admin)
echo 2. Get your GitHub Personal Access Token
echo.

set /p REPO_NAME="Enter GitHub repository name (default: LuckyDraw-Admin): "
if "%REPO_NAME%"=="" set REPO_NAME=LuckyDraw-Admin
set /p GITHUB_TOKEN="Enter your GitHub Personal Access Token: "


if "%GITHUB_TOKEN%"=="" (
    echo ERROR: GitHub token cannot be empty!
    pause
    exit /b 1
)

echo.
echo Setting up git repository...

REM Initialize git if not already done
if not exist ".git" (
    echo Initializing git repository...
    git init
)

REM Add all files
echo Adding files...
git add .

REM Create initial commit
echo Creating initial commit...
git commit -m "Initial commit: LuckyDraw.pk Admin Panel"

REM Set branch to main
git branch -M main

REM Add remote with token
echo Configuring GitHub remote...
git remote add origin https://%GITHUB_TOKEN%@github.com/test4pak/%REPO_NAME%.git 2>nul
if %errorlevel% neq 0 (
    echo Remote already exists, updating...
    git remote set-url origin https://%GITHUB_TOKEN%@github.com/test4pak/%REPO_NAME%.git
)

REM Save token to file (will be in .gitignore)
echo %GITHUB_TOKEN% > .github_token.txt

echo.
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Admin Panel pushed to GitHub
    echo ========================================
    echo Repository: https://github.com/test4pak/%REPO_NAME%
) else (
    echo.
    echo ========================================
    echo   ERROR: Push failed!
    echo ========================================
    echo Please check:
    echo 1. Repository name is correct
    echo 2. Token has correct permissions
    echo 3. Repository exists on GitHub
)

echo.
pause

