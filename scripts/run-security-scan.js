/**
 * Local Security Scanner Runner (Phase 6 / Sprint 7.3 DX Tool)
 *
 * Runs local security audits:
 *   1. Gitleaks secret scanning (using .gitleaks.toml)
 *   2. OSV Scanner dependency vulnerability scanning (using package-lock.json)
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting BuggyBooks Local Security Scans...\n');

// 1. Check Gitleaks
console.log('--- 1. Gitleaks Secret Scanning ---');
let hasGitleaks = false;
try {
  const checkCmd = process.platform === 'win32' ? 'where gitleaks' : 'which gitleaks';
  execSync(checkCmd, { stdio: 'ignore' });
  hasGitleaks = true;
} catch {
  hasGitleaks = false;
}

if (hasGitleaks) {
  console.log('🔍 Executing gitleaks detect using .gitleaks.toml...');
  const res = spawnSync('gitleaks', ['detect', '--config=.gitleaks.toml', '--no-git', '-v'], {
    stdio: 'inherit',
    shell: true
  });
  if (res.status === 0) {
    console.log('✅ Gitleaks secret scan passed with 0 leaks detected.\n');
  } else {
    console.warn(`⚠️ Gitleaks completed with exit code ${res.status}.\n`);
  }
} else {
  console.log('ℹ️  gitleaks binary not found on local PATH.');
  console.log('   In Dev Container / CI, gitleaks is preinstalled or run via GitHub Action.');
  console.log('   To install locally: https://github.com/gitleaks/gitleaks\n');
}

// 2. OSV Scanner
console.log('--- 2. OSV Scanner Dependency Vulnerabilities ---');
let hasOsv = false;
try {
  const checkCmd = process.platform === 'win32' ? 'where osv-scanner' : 'which osv-scanner';
  execSync(checkCmd, { stdio: 'ignore' });
  hasOsv = true;
} catch {
  hasOsv = false;
}

const lockfilePath = path.resolve(__dirname, '../package-lock.json');
if (hasOsv && fs.existsSync(lockfilePath)) {
  console.log('🔍 Executing osv-scanner against package-lock.json...');
  const res = spawnSync('osv-scanner', ['scan', `--lockfile=${lockfilePath}`], {
    stdio: 'inherit',
    shell: true
  });
  if (res.status === 0) {
    console.log('✅ OSV Scanner found 0 known vulnerabilities.\n');
  } else {
    console.log(`ℹ️  OSV Scanner completed with status ${res.status}.\n`);
  }
} else {
  console.log('ℹ️  osv-scanner binary not found on local PATH.');
  console.log('   In Dev Container / CI, osv-scanner is run via GitHub Actions / preinstalled.');
  console.log(
    '   To install locally: go install github.com/google/osv-scanner/cmd/osv-scanner@latest\n'
  );
}

console.log('🏁 Local Security Scan Completed.');
