#!/usr/bin/env tsx

/**
 * ============================================================================
 * BuggyBooks — API Endpoint Coverage Gate & Reporting Script
 * ============================================================================
 *
 * Verifies 100% routed-endpoint coverage by comparing defined backend routes
 * (from docs/api/routes.json) against:
 *   1. Automated test specs under playwright-e2e/src/tests/api/
 *   2. Optional Playwright test execution results JSON (--results <path>)
 *
 * Usage:
 *   npx tsx scripts/api-coverage.ts [--results <path>] [--verbose]
 *   npm run test:api-coverage
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

interface RouteDefinition {
  method: string;
  path: string;
  description: string;
  authRequired: boolean;
}

interface CoverageEntry {
  route: RouteDefinition;
  covered: boolean;
  specFiles: string[];
  testCount: number;
}

const ROOT_DIR = path.resolve(__dirname, '..');
const ROUTES_PATH = path.join(ROOT_DIR, 'docs', 'api', 'routes.json');
const API_TESTS_DIR = path.join(ROOT_DIR, 'playwright-e2e', 'src', 'tests', 'api');

// Map endpoints to client method patterns or raw URL signatures
const ENDPOINT_PATTERNS: Record<string, RegExp[]> = {
  'GET /api/books': [/\.books\.list/, /\/api\/books(?:\?|['"`]|\s)/, /GET.*\/api\/books/i],
  'GET /api/books/:id': [/\.books\.getById/, /\/api\/books\/\$\{?/, /GET.*\/api\/books\/:?id/i],
  'POST /api/register': [/\.auth\.register/, /\/api\/register/, /POST.*\/api\/register/i],
  'POST /api/login': [/\.auth\.login/, /\/api\/login/, /POST.*\/api\/login/i],
  'POST /api/logout': [/\.auth\.logout/, /\/api\/logout/, /POST.*\/api\/logout/i],
  'POST /api/auth/refresh': [
    /\.auth\.refresh/,
    /\/api\/auth\/refresh/,
    /POST.*\/api\/auth\/refresh/i
  ],
  'GET /api/cart': [/\.cart\.get/, /GET.*\/api\/cart/i],
  'POST /api/cart': [/\.cart\.add/, /POST.*\/api\/cart/i],
  'DELETE /api/cart': [/\.cart\.clear/, /DELETE.*\/api\/cart(?![\/:])/i],
  'DELETE /api/cart/:bookId': [
    /\.cart\.remove/,
    /\/api\/cart\/\$\{?/,
    /DELETE.*\/api\/cart\/:?bookId/i
  ],
  'POST /api/checkout/process': [
    /\.checkout\.process/,
    /\/api\/checkout\/process/,
    /POST.*\/api\/checkout/i
  ],
  'GET /api/orders': [/\.orders\.list/, /\/api\/orders/, /GET.*\/api\/orders/i],
  'GET /api/inventory/report': [
    /\.inventory\.report/,
    /\/api\/inventory\/report/,
    /GET.*\/api\/inventory/i
  ],
  'GET /api/health': [/\.system\.health/, /\/api\/health/, /GET.*\/api\/health/i],
  'GET /api/metrics': [/\.system\.metrics/, /\/api\/metrics/, /GET.*\/api\/metrics/i],
  'GET /api/profile': [
    /\.profile\.get/,
    /\.auth\.me/,
    /\/api\/profile(?![\/:])/,
    /GET.*\/api\/profile/i
  ],
  'POST /api/profile/upload': [
    /\.profile\.uploadAvatar/,
    /\/api\/profile\/upload/,
    /POST.*\/api\/profile\/upload/i
  ],
  'GET /api/csrf-token': [/\.system\.csrfToken/, /\/api\/csrf-token/, /GET.*\/api\/csrf-token/i],
  'GET /api/test/config': [/\.testControl\.getConfig/, /GET.*\/api\/test\/config/i],
  'POST /api/test/config': [/\.testControl\.setConfig/, /POST.*\/api\/test\/config/i],
  'POST /api/test/reset': [/\.testControl\.reset/, /POST.*\/api\/test\/reset/i],
  'POST /api/test/books/:id/stock': [
    /\.testControl\.setStock/,
    /\/api\/test\/books\/.*\/stock/,
    /POST.*\/api\/test\/books/i
  ],
  'DELETE /api/test/session/:id': [
    /\.testControl\.deleteSession/,
    /\/api\/test\/session/,
    /DELETE.*\/api\/test\/session/i
  ]
};

function getAllFiles(dir: string, ext = '.spec.ts'): string[] {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

export function evaluateApiCoverage(resultsPath?: string): {
  totalRoutes: number;
  coveredRoutes: number;
  coveragePercent: number;
  entries: CoverageEntry[];
} {
  if (!fs.existsSync(ROUTES_PATH)) {
    throw new Error(`Routes definition file not found: ${ROUTES_PATH}`);
  }

  const routes: RouteDefinition[] = JSON.parse(fs.readFileSync(ROUTES_PATH, 'utf-8'));
  const specFiles = getAllFiles(API_TESTS_DIR);

  const fileContents = specFiles.map((file) => ({
    file: path.relative(ROOT_DIR, file),
    content: fs.readFileSync(file, 'utf-8')
  }));

  // Optional execution results inspection
  let resultsContent = '';
  if (resultsPath) {
    const resolvedResults = path.isAbsolute(resultsPath)
      ? resultsPath
      : path.resolve(process.cwd(), resultsPath);
    if (fs.existsSync(resolvedResults)) {
      resultsContent = fs.readFileSync(resolvedResults, 'utf-8');
    }
  }

  const entries: CoverageEntry[] = routes.map((route) => {
    const key = `${route.method} ${route.path}`;
    const patterns = ENDPOINT_PATTERNS[key] || [
      new RegExp(route.path.replace(/:[a-zA-Z]+/g, '.*'))
    ];

    const matchingFiles: string[] = [];
    let matchCount = 0;

    for (const { file, content } of fileContents) {
      const isMatch = patterns.some((p) => p.test(content));
      if (isMatch) {
        matchingFiles.push(file);
        // Estimate occurrences
        for (const p of patterns) {
          const globalP = new RegExp(p.source, 'g');
          const m = content.match(globalP);
          if (m) matchCount += m.length;
        }
      }
    }

    if (resultsContent) {
      const resultsMatch = patterns.some((p) => p.test(resultsContent));
      if (resultsMatch && matchCount === 0) {
        matchCount = 1;
      }
    }

    return {
      route,
      covered: matchingFiles.length > 0 || matchCount > 0,
      specFiles: matchingFiles,
      testCount: matchCount
    };
  });

  const totalRoutes = entries.length;
  const coveredRoutes = entries.filter((e) => e.covered).length;
  const coveragePercent =
    totalRoutes > 0 ? Number(((coveredRoutes / totalRoutes) * 100).toFixed(1)) : 0;

  return { totalRoutes, coveredRoutes, coveragePercent, entries };
}

function main() {
  const args = process.argv.slice(2);
  let resultsArg: string | undefined;
  const resultsIdx = args.indexOf('--results');
  if (resultsIdx !== -1 && args[resultsIdx + 1]) {
    resultsArg = args[resultsIdx + 1];
  }

  console.log('==============================================================================');
  console.log('📊 BuggyBooks API Route Coverage Gate');
  console.log('==============================================================================');

  const { totalRoutes, coveredRoutes, coveragePercent, entries } = evaluateApiCoverage(resultsArg);

  console.log(`Route Inventory : ${ROUTES_PATH}`);
  console.log(`Spec Directory  : ${API_TESTS_DIR}`);
  console.log('------------------------------------------------------------------------------');
  console.log(
    `${'STATUS'.padEnd(8)} | ${'METHOD'.padEnd(6)} | ${'ROUTE'.padEnd(32)} | ${'SPECS'.padEnd(6)} | DESCRIPTION`
  );
  console.log('------------------------------------------------------------------------------');

  for (const entry of entries) {
    const statusIcon = entry.covered ? '✅ PASS' : '❌ FAIL';
    const method = entry.route.method.padEnd(6);
    const routePath = entry.route.path.padEnd(32);
    const specs = String(entry.specFiles.length).padEnd(6);
    console.log(`${statusIcon} | ${method} | ${routePath} | ${specs} | ${entry.route.description}`);
  }

  console.log('==============================================================================');
  console.log(
    `Coverage Summary: ${coveredRoutes}/${totalRoutes} routes covered (${coveragePercent}%)`
  );
  console.log('==============================================================================');

  if (coveredRoutes < totalRoutes) {
    const uncovered = entries
      .filter((e) => !e.covered)
      .map((e) => `${e.route.method} ${e.route.path}`);
    console.error(
      `\n❌ Error: ${uncovered.length} route(s) uncovered:\n  • ${uncovered.join('\n  • ')}\n`
    );
    process.exit(1);
  }

  console.log('\n✅ Quality Gate Passed: 100% of API endpoints are covered by automated specs.\n');
  process.exit(0);
}

if (require.main === module) {
  main();
}
