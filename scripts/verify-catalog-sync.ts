#!/usr/bin/env tsx

/**
 * ============================================================================
 * BuggyBooks — Dual-Catalog Strict Parity Verifier
 * ============================================================================
 * 
 * Verifies byte-for-byte, line-for-line parity between:
 *   1. docs/test_cases_catalog.md (Primary Central Catalog)
 *   2. playwright-e2e/test_cases_catalog.md (Playwright Duplicate Catalog)
 * 
 * In accordance with AGENTS.md Core Rule #5 (Dual-Catalog Strict Parity) and
 * Sprint 5.3 User Story US-AF-531, this automated check guarantees that any
 * documentation drift is detected immediately in local development and CI gates.
 * 
 * Usage:
 *   npm run test:verify-catalog
 *   npx tsx scripts/verify-catalog-sync.ts [--fix] [--verbose]
 * 
 * Options:
 *   --fix       Synchronize playwright-e2e/test_cases_catalog.md from docs/test_cases_catalog.md
 *   --verbose   Display detailed section and test identifier breakdown
 *   --help      Display usage instructions
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

interface DiffHunk {
  lineNum: number;
  docLine: string | null;
  playwrightLine: string | null;
}

interface VerificationResult {
  isMatch: boolean;
  totalDocLines: number;
  totalPlaywrightLines: number;
  totalDocChars: number;
  totalPlaywrightChars: number;
  testCaseCount: number;
  diffs: DiffHunk[];
  firstDiffLine: number | null;
}

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_CATALOG_PATH = path.join(ROOT_DIR, 'docs', 'test_cases_catalog.md');
const PLAYWRIGHT_CATALOG_PATH = path.join(ROOT_DIR, 'playwright-e2e', 'test_cases_catalog.md');

const args = process.argv.slice(2);
const IS_FIX = args.includes('--fix');
const IS_VERBOSE = args.includes('--verbose');
const IS_HELP = args.includes('--help') || args.includes('-h');

if (IS_HELP) {
  console.log(`
Usage: tsx scripts/verify-catalog-sync.ts [options]

Options:
  --fix        Overwrite playwright-e2e/test_cases_catalog.md with docs/test_cases_catalog.md
  --verbose    Print detailed statistics including test cases parsed
  --help, -h   Show this help message
`);
  process.exit(0);
}

function normalizeNewlines(content: string): string {
  return content.replace(/\r\n/g, '\n');
}

function verifyCatalogs(docContent: string, pwContent: string): VerificationResult {
  const normDoc = normalizeNewlines(docContent);
  const normPw = normalizeNewlines(pwContent);

  const docLines = normDoc.split('\n');
  const pwLines = normPw.split('\n');

  const maxLines = Math.max(docLines.length, pwLines.length);
  const diffs: DiffHunk[] = [];
  let firstDiffLine: number | null = null;

  for (let i = 0; i < maxLines; i++) {
    const dLine = i < docLines.length ? docLines[i] : null;
    const pLine = i < pwLines.length ? pwLines[i] : null;

    if (dLine !== pLine) {
      if (firstDiffLine === null) {
        firstDiffLine = i + 1;
      }
      diffs.push({
        lineNum: i + 1,
        docLine: dLine,
        playwrightLine: pLine,
      });
    }
  }

  // Count unique test case IDs in the primary catalog (matches | **UI_AUTH_01** | or | TC-... |)
  const testIdRegex = /\|\s*(?:\*\*)?([A-Z][A-Z0-9_-]+)(?:\*\*)?\s*\|/g;
  let testCount = 0;
  let match: RegExpExecArray | null;
  while ((match = testIdRegex.exec(normDoc)) !== null) {
    const id = match[1];
    // Exclude header rows like 'ID' or 'Total'
    if (id !== 'ID' && !id.startsWith('TOTAL')) {
      testCount++;
    }
  }

  return {
    isMatch: diffs.length === 0,
    totalDocLines: docLines.length,
    totalPlaywrightLines: pwLines.length,
    totalDocChars: normDoc.length,
    totalPlaywrightChars: normPw.length,
    testCaseCount: testCount,
    diffs,
    firstDiffLine,
  };
}

function main(): void {
  console.log('='.repeat(78));
  console.log('🔍 BuggyBooks Dual-Catalog Strict Parity Verifier');
  console.log('   Rule: AGENTS.md Core Rule #5 (Dual-Catalog Strict Parity)');
  console.log('='.repeat(78));
  console.log(`📁 Primary Catalog   : ${path.relative(ROOT_DIR, DOC_CATALOG_PATH)}`);
  console.log(`📁 Duplicate Catalog : ${path.relative(ROOT_DIR, PLAYWRIGHT_CATALOG_PATH)}`);
  console.log('-'.repeat(78));

  // Check file existence
  if (!fs.existsSync(DOC_CATALOG_PATH)) {
    console.error(`❌ ERROR: Primary catalog missing at: ${DOC_CATALOG_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(PLAYWRIGHT_CATALOG_PATH)) {
    console.error(`❌ ERROR: Playwright catalog missing at: ${PLAYWRIGHT_CATALOG_PATH}`);
    process.exit(1);
  }

  const rawDoc = fs.readFileSync(DOC_CATALOG_PATH, 'utf8');
  const rawPw = fs.readFileSync(PLAYWRIGHT_CATALOG_PATH, 'utf8');

  // If --fix was passed and they differ, synchronize immediately
  if (IS_FIX) {
    if (rawDoc !== rawPw) {
      console.log('🔧 Synchronizing playwright-e2e/test_cases_catalog.md from docs/test_cases_catalog.md...');
      fs.writeFileSync(PLAYWRIGHT_CATALOG_PATH, rawDoc, 'utf8');
      console.log('✅ Catalogs synchronized successfully!');
    } else {
      console.log('✨ Catalogs are already in exact parity. No fix needed.');
    }
  }

  // Re-read content for verification
  const currentDoc = fs.readFileSync(DOC_CATALOG_PATH, 'utf8');
  const currentPw = fs.readFileSync(PLAYWRIGHT_CATALOG_PATH, 'utf8');

  const result = verifyCatalogs(currentDoc, currentPw);

  if (result.isMatch) {
    console.log('✅ PARITY VERIFIED: Both catalogs are 100% character-for-character identical.');
    console.log(`   • Total Lines      : ${result.totalDocLines.toLocaleString()}`);
    console.log(`   • Total Characters : ${result.totalDocChars.toLocaleString()} bytes`);
    console.log(`   • Catalog Test IDs : ${result.testCaseCount} verified test cases`);
    console.log('='.repeat(78));
    process.exit(0);
  } else {
    console.error('❌ PARITY FAILURE: Catalog drift detected between central docs and Playwright copy!');
    console.error(`   • Primary Catalog Lines   : ${result.totalDocLines.toLocaleString()}`);
    console.error(`   • Playwright Copy Lines  : ${result.totalPlaywrightLines.toLocaleString()}`);
    console.error(`   • Diverging Lines Count  : ${result.diffs.length.toLocaleString()}`);
    console.error(`   • First Divergence Line  : Line ${result.firstDiffLine}`);
    console.error('-'.repeat(78));
    console.error('📋 Sample Diff (First up to 5 divergent lines):');

    const previewDiffs = result.diffs.slice(0, 5);
    for (const hunk of previewDiffs) {
      console.error(`\n  Line ${hunk.lineNum}:`);
      if (hunk.docLine !== null) {
        console.error(`    [docs] : ${hunk.docLine}`);
      } else {
        console.error('    [docs] : <EOF>');
      }
      if (hunk.playwrightLine !== null) {
        console.error(`    [pw]   : ${hunk.playwrightLine}`);
      } else {
        console.error('    [pw]   : <EOF>');
      }
    }

    if (result.diffs.length > 5) {
      console.error(`\n  ... and ${result.diffs.length - 5} more divergent line(s).`);
    }

    console.error('-'.repeat(78));
    console.error('💡 Remediation:');
    console.error('   To automatically synchronize playwright-e2e with docs, run:');
    console.error('     npx tsx scripts/verify-catalog-sync.ts --fix');
    console.error('   Or manually resolve discrepancies before merging.');
    console.error('='.repeat(78));
    process.exit(1);
  }
}

main();
