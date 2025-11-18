#!/usr/bin/env node

/**
 * Cross-platform deploy script for GitHub (Admin Panel)
 * Usage: node scripts/deploy.js [commit message]
 */

const { execSync } = require('child_process');
const path = require('path');

// Get commit message from command line or use default
const commitMessage = process.argv[2] || `Update: ${new Date().toISOString()}`;

console.log('🚀 Deploying Admin Panel to GitHub...\n');

try {
  // Check if git is initialized
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Error: Not a git repository!');
    console.error('   Run: git init');
    process.exit(1);
  }

  // Check if there are changes
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (!status.trim()) {
    console.log('ℹ️  No changes to commit.');
    process.exit(0);
  }

  // Add all files
  console.log('📦 Adding files...');
  execSync('git add .', { stdio: 'inherit' });

  // Commit
  console.log(`\n💾 Committing: "${commitMessage}"`);
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  // Push
  console.log('\n⬆️  Pushing to GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('\n✅ Successfully deployed to GitHub!');
} catch (error) {
  console.error('\n❌ Deployment failed!');
  console.error(error.message);
  process.exit(1);
}

