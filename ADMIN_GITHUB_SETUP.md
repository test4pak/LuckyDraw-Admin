# Admin Panel GitHub Setup

## Repository Name
**LuckyDraw-Admin**

## Quick Setup

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `LuckyDraw-Admin`
3. Choose **Private** (recommended for admin panels)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Step 2: Get Your GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it "LuckyDraw Admin Panel"
4. Check the `repo` scope
5. Click "Generate token"
6. **Copy the token immediately**

### Step 3: Run Setup Script
```bash
cd admin-panel
setup-github.bat
```

When prompted:
- Repository name: Press Enter (defaults to `LuckyDraw-Admin`)
- GitHub token: Paste your token

The script will:
- Initialize git (if needed)
- Add all files
- Create initial commit
- Configure remote with token
- Push to GitHub

## After Setup

To push updates, simply run:
```bash
cd admin-panel
push-to-github.bat
```

Or use PowerShell:
```powershell
cd admin-panel
.\push-to-github.ps1
```

## Manual Setup (Alternative)

If you prefer to set up manually:

```bash
cd admin-panel
git init
git add .
git commit -m "Initial commit: LuckyDraw.pk Admin Panel"
git branch -M main
git remote add origin https://YOUR_TOKEN@github.com/test4pak/LuckyDraw-Admin.git
git push -u origin main
```

Replace `YOUR_TOKEN` with your GitHub Personal Access Token.

