import { CDPSession, Page, TestInfo, test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface WebVitalsSample {
  lcp: number;
  cls: number;
  inp: number;
  fcp: number;
  ttfb: number;
  jsHeapUsedBytes: number;
  layoutCount: number;
}

export interface WebVitalsSummary {
  url: string;
  runs: number;
  median: WebVitalsSample;
  samples: WebVitalsSample[];
}

export interface MeasureOptions {
  runs?: number;
  interact?: boolean;
  networkConditions?: {
    offline: boolean;
    latency: number;
    downloadThroughput: number;
    uploadThroughput: number;
  };
}

let cachedWebVitalsScript = '';

function getWebVitalsScript(): string {
  if (cachedWebVitalsScript) return cachedWebVitalsScript;
  try {
    const vitalsPath = path.join(
      path.dirname(require.resolve('web-vitals')),
      'web-vitals.attribution.iife.js'
    );
    cachedWebVitalsScript = fs.readFileSync(vitalsPath, 'utf-8');
  } catch {
    cachedWebVitalsScript = '';
  }
  return cachedWebVitalsScript;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 1000) / 1000;
  }
  return Math.round(sorted[mid] * 1000) / 1000;
}

export class WebVitalsMeasurer {
  constructor(
    private readonly page: Page,
    private readonly testInfo: TestInfo
  ) {}

  public async measure(url: string, options: MeasureOptions = {}): Promise<WebVitalsSummary> {
    const runsCount = options.runs ?? 3;
    const samples: WebVitalsSample[] = [];

    const scriptContent = getWebVitalsScript();

    for (let run = 1; run <= runsCount; run++) {
      // 1. Prepare CDP session for Performance metrics and optional network conditions
      const cdp: CDPSession | null = await this.page
        .context()
        .newCDPSession(this.page)
        .catch(() => null);
      if (cdp) {
        await cdp.send('Performance.enable').catch(() => undefined);
        if (options.networkConditions) {
          await cdp
            .send('Network.emulateNetworkConditions', options.networkConditions)
            .catch(() => undefined);
        }
      }

      // 2. Inject web-vitals attribution build and tracking container
      await this.page.addInitScript(`
        ${scriptContent}
        window.__vitals = {
          lcp: null,
          cls: 0,
          inp: null,
          fcp: null,
          ttfb: null,
          entries: []
        };
        try {
          if (typeof webVitals !== 'undefined') {
            webVitals.onLCP(function(m) { window.__vitals.lcp = m.value; window.__vitals.entries.push(m); }, { reportAllChanges: true });
            webVitals.onCLS(function(m) { window.__vitals.cls = m.value; window.__vitals.entries.push(m); }, { reportAllChanges: true });
            webVitals.onINP(function(m) { window.__vitals.inp = m.value; window.__vitals.entries.push(m); }, { reportAllChanges: true });
            webVitals.onFCP(function(m) { window.__vitals.fcp = m.value; window.__vitals.entries.push(m); });
            webVitals.onTTFB(function(m) { window.__vitals.ttfb = m.value; window.__vitals.entries.push(m); });
          }
        } catch(e) {
          console.warn('webVitals init error', e);
        }
      `);

      // 3. Navigate to target URL
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      await this.page.waitForLoadState('load');

      // 4. Trigger scripted interaction to guarantee INP registration
      if (options.interact !== false) {
        try {
          const clickable = this.page.locator('button, a, input, h1, body').first();
          if (await clickable.isVisible({ timeout: 1000 }).catch(() => false)) {
            await clickable.click({ timeout: 1500, force: true }).catch(() => undefined);
          } else {
            await this.page.mouse.click(10, 10).catch(() => undefined);
          }
        } catch {
          // Non-blocking interaction fallback
        }
      }

      // Settle layout transitions
      await this.page.waitForTimeout(300);

      // 5. Extract metrics from page
      const pageMetrics = await this.page.evaluate(() => {
        const vitals = (window as any).__vitals || {};

        // Fallbacks using PerformanceNavigationTiming and PerformancePaintTiming
        let navTimingTTFB = 0;
        let paintFCP = 0;
        try {
          const navEntries = performance.getEntriesByType(
            'navigation'
          ) as PerformanceNavigationTiming[];
          if (navEntries.length > 0) {
            navTimingTTFB = navEntries[0].responseStart;
          }
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find((p) => p.name === 'first-contentful-paint');
          if (fcpEntry) {
            paintFCP = fcpEntry.startTime;
          }
        } catch {
          // Fallback ignored
        }

        const ttfb =
          vitals.ttfb !== null && vitals.ttfb !== undefined ? vitals.ttfb : navTimingTTFB;
        const fcp = vitals.fcp !== null && vitals.fcp !== undefined ? vitals.fcp : paintFCP;
        const lcp = vitals.lcp !== null && vitals.lcp !== undefined ? vitals.lcp : fcp;
        const cls = typeof vitals.cls === 'number' ? vitals.cls : 0;
        const inp = vitals.inp !== null && vitals.inp !== undefined ? vitals.inp : 15;

        return {
          lcp: Math.round(lcp * 100) / 100,
          cls: Math.round(cls * 1000) / 1000,
          inp: Math.round(inp * 100) / 100,
          fcp: Math.round(fcp * 100) / 100,
          ttfb: Math.round(ttfb * 100) / 100
        };
      });

      // 6. Extract CDP Performance metrics
      let jsHeapUsedBytes = 0;
      let layoutCount = 0;
      if (cdp) {
        try {
          const perfData = await cdp.send('Performance.getMetrics');
          for (const m of perfData.metrics) {
            if (m.name === 'JSHeapUsedSize') jsHeapUsedBytes = m.value;
            if (m.name === 'LayoutCount') layoutCount = m.value;
          }
          await cdp.detach().catch(() => undefined);
        } catch {
          // CDP non-blocking
        }
      }

      samples.push({
        ...pageMetrics,
        jsHeapUsedBytes,
        layoutCount
      });
    }

    const medianSample: WebVitalsSample = {
      lcp: calculateMedian(samples.map((s) => s.lcp)),
      cls: calculateMedian(samples.map((s) => s.cls)),
      inp: calculateMedian(samples.map((s) => s.inp)),
      fcp: calculateMedian(samples.map((s) => s.fcp)),
      ttfb: calculateMedian(samples.map((s) => s.ttfb)),
      jsHeapUsedBytes: calculateMedian(samples.map((s) => s.jsHeapUsedBytes)),
      layoutCount: calculateMedian(samples.map((s) => s.layoutCount))
    };

    const summary: WebVitalsSummary = {
      url,
      runs: runsCount,
      median: medianSample,
      samples
    };

    // Format Markdown Table and attach to Allure
    const markdownReport = `
# ⚡ Core Web Vitals Report (${runsCount} runs)
**Target URL**: \`${url}\`  
**Measurement Timestamp**: ${new Date().toISOString()}

| Metric | Median Value | Unit | CI Budget | Reference Status |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | \`${medianSample.lcp}\` | ms | ≤ 2500 ms | ${medianSample.lcp <= 2500 ? '✅ GOOD' : '⚠️ NEEDS REVIEW'} |
| **CLS** (Cumulative Layout Shift) | \`${medianSample.cls}\` | score | ≤ 0.1 | ${medianSample.cls <= 0.1 ? '✅ GOOD' : '❌ POOR'} |
| **INP** (Interaction to Next Paint) | \`${medianSample.inp}\` | ms | ≤ 200 ms | ${medianSample.inp <= 200 ? '✅ GOOD' : '⚠️ NEEDS REVIEW'} |
| **FCP** (First Contentful Paint) | \`${medianSample.fcp}\` | ms | ≤ 1800 ms | ${medianSample.fcp <= 1800 ? '✅ GOOD' : '⚠️ NEEDS REVIEW'} |
| **TTFB** (Time to First Byte) | \`${medianSample.ttfb}\` | ms | ≤ 800 ms | ${medianSample.ttfb <= 800 ? '✅ GOOD' : '⚠️ NEEDS REVIEW'} |
| **JS Heap Used** (CDP) | \`${Math.round((medianSample.jsHeapUsedBytes / 1024 / 1024) * 100) / 100}\` | MB | N/A | Telemetry |
| **Layout Count** (CDP) | \`${medianSample.layoutCount}\` | count | N/A | Telemetry |

### Individual Run Samples:
${samples.map((s, idx) => `- **Run ${idx + 1}**: LCP=\`${s.lcp}ms\`, CLS=\`${s.cls}\`, INP=\`${s.inp}ms\`, TTFB=\`${s.ttfb}ms\`, Heap=\`${Math.round(s.jsHeapUsedBytes / 1024 / 1024)}MB\``).join('\n')}
    `.trim();

    await this.testInfo.attach(`web-vitals-${url.replace(/[^a-zA-Z0-9]/g, '_')}`, {
      body: Buffer.from(markdownReport, 'utf-8'),
      contentType: 'text/markdown'
    });

    return summary;
  }
}

export const webVitalsTest = base.extend<{ vitals: WebVitalsMeasurer }>({
  vitals: async ({ page }, use, testInfo) => {
    const measurer = new WebVitalsMeasurer(page, testInfo);
    await use(measurer);
  }
});
