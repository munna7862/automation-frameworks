import AxeBuilder from '@axe-core/playwright';
import { Page, TestInfo, test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface A11yScanOptions {
  include?: string | string[];
  exclude?: string | string[];
  disableRules?: string[];
}

export interface A11yViolationSummary {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodesCount: number;
}

export interface A11yPageReport {
  page: string;
  scannedAt: string;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  violations: A11yViolationSummary[];
}

export interface A11ySummaryFile {
  lastUpdated: string;
  totalPagesScanned: number;
  totalViolations: number;
  criticalViolations: number;
  seriousViolations: number;
  pages: Record<string, A11yPageReport>;
}

const SUMMARY_FILE_PATHS = [
  path.resolve(process.cwd(), 'reports/a11y-summary.json'),
  path.resolve(process.cwd(), 'playwright-e2e/reports/a11y-summary.json')
];

function persistA11ySummary(pageName: string, report: A11yPageReport): void {
  for (const summaryPath of SUMMARY_FILE_PATHS) {
    try {
      const dir = path.dirname(summaryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let summary: A11ySummaryFile = {
        lastUpdated: new Date().toISOString(),
        totalPagesScanned: 0,
        totalViolations: 0,
        criticalViolations: 0,
        seriousViolations: 0,
        pages: {}
      };

      if (fs.existsSync(summaryPath)) {
        try {
          const raw = fs.readFileSync(summaryPath, 'utf-8');
          summary = JSON.parse(raw);
        } catch {
          // Reset corrupted file
        }
      }

      summary.pages[pageName] = report;
      summary.lastUpdated = new Date().toISOString();
      summary.totalPagesScanned = Object.keys(summary.pages).length;

      let totalV = 0;
      let critV = 0;
      let serV = 0;
      for (const p of Object.values(summary.pages)) {
        totalV += p.totalViolations;
        critV += p.criticalCount;
        serV += p.seriousCount;
      }
      summary.totalViolations = totalV;
      summary.criticalViolations = critV;
      summary.seriousViolations = serV;

      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    } catch {
      // Non-blocking file persistence
    }
  }
}

export class A11yScanner {
  constructor(
    private readonly page: Page,
    private readonly testInfo: TestInfo
  ) {}

  public async scan(name: string, options?: A11yScanOptions) {
    const builder = new AxeBuilder({ page: this.page }).withTags([
      'wcag2a',
      'wcag2aa',
      'wcag21aa',
      'wcag22aa'
    ]);

    if (options?.include) {
      const includes = Array.isArray(options.include) ? options.include : [options.include];
      for (const inc of includes) {
        builder.include(inc);
      }
    }

    if (options?.exclude) {
      const excludes = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
      for (const exc of excludes) {
        builder.exclude(exc);
      }
    }

    if (options?.disableRules && options.disableRules.length > 0) {
      builder.disableRules(options.disableRules);
    }

    const results = await builder.analyze();

    // Attach raw JSON results to Allure / report
    await this.testInfo.attach(`a11y-scan-${name}`, {
      body: Buffer.from(JSON.stringify(results, null, 2), 'utf-8'),
      contentType: 'application/json'
    });

    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    const seriousViolations = results.violations.filter((v) => v.impact === 'serious');
    const moderateViolations = results.violations.filter((v) => v.impact === 'moderate');
    const minorViolations = results.violations.filter((v) => v.impact === 'minor');

    const pageReport: A11yPageReport = {
      page: name,
      scannedAt: new Date().toISOString(),
      totalViolations: results.violations.length,
      criticalCount: criticalViolations.length,
      seriousCount: seriousViolations.length,
      moderateCount: moderateViolations.length,
      minorCount: minorViolations.length,
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact || 'unknown',
        description: v.description,
        helpUrl: v.helpUrl,
        nodesCount: v.nodes.length
      }))
    };

    persistA11ySummary(name, pageReport);

    // Fail strictly on critical or serious violations
    const severeViolations = [...criticalViolations, ...seriousViolations];
    if (severeViolations.length > 0) {
      const formattedErrors = severeViolations
        .map((v) => {
          const targets = v.nodes.map((n) => n.target.join(' ')).join('; ');
          return `  • [${(v.impact || 'SEVERE').toUpperCase()}] Rule: ${v.id} - ${v.help}\n    Selector(s): ${targets}\n    Help URL: ${v.helpUrl}`;
        })
        .join('\n\n');

      throw new Error(
        `[A11Y Quality Gate] ${severeViolations.length} critical/serious accessibility violation(s) detected on "${name}":\n\n${formattedErrors}\n`
      );
    }

    return results;
  }
}

export const a11yTest = base.extend<{ a11y: A11yScanner }>({
  a11y: async ({ page }, use, testInfo) => {
    const scanner = new A11yScanner(page, testInfo);
    await use(scanner);
  }
});
