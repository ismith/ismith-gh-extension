#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitInfo() {
  try {
    // Get short commit hash
    let commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();

    // Check if working directory is dirty
    const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (status) {
      commit += '+dirty';
    }

    // Get commit timestamp
    const commitTimestamp = execSync('git log -1 --format=%cI', { encoding: 'utf-8' }).trim();

    // Format to YYYY-MM-DDTHH:mm
    const commitTime = commitTimestamp.substring(0, 16);

    return { commit, commitTime };
  } catch (error) {
    console.error('Warning: Could not get git info:', error.message);
    return { commit: 'unknown', commitTime: 'unknown' };
  }
}

function generateVersionFile() {
  const { commit, commitTime } = getGitInfo();

  // Build time in YYYY-MM-DDTHH:mm format
  const now = new Date();
  const buildTime = now.toISOString().substring(0, 16);

  const versionInfo = {
    commit,
    commitTime,
    buildTime
  };

  const distPath = path.join(__dirname, '..', 'dist', 'version.json');
  fs.writeFileSync(distPath, JSON.stringify(versionInfo, null, 2));

  console.log('Generated version.json:', versionInfo);
}

generateVersionFile();
