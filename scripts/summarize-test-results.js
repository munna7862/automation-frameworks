#!/usr/bin/env node

/**
 * BuggyBooks Test Results Summarizer
 *
 * Automatically parses Playwright results.json or Allure widgets/summary.json,
 * builds a clean Markdown summary table with failing test breakdown,
 * and appends it to $GITHUB_STEP_SUMMARY.
 *
 * Contract: Exit code 0 always (the workflow gate step owns failure enforcement).
 */

const fs = require('fs');
const path = require('path');

function resolveInputFile(argPath) {
  if (argPath && fs.existsSync(argPath)) {
    return path.resolve(argPath);
  }

  // Common fallbacks
  const candidates = [
    path.resolve(process.cwd(), 'playwright-e2e/test-results/results.json'),
    path.resolve(process.cwd(), 'test-results/results.json'),
    path.resolve(process.cwd(), 'playwright-allure-report/widgets/summary.json'),
    path.resolve(process.cwd(), 'selenium-allure-report/widgets/summary.json'),
    path.resolve(process.cwd(), 'wdio-allure-report/widgets/summary.json'),
    path.resolve(process.cwd(), 'mobile-allure-report/widgets/summary.json'),
    path.resolve(process.cwd(), 'allure-report/widgets/summary.json'),
    path.resolve(process.cwd(), 'reports/monocart-report/index.html')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function formatDuration(ms) {
  if (!ms || isNaN(ms)) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSec = (seconds % 60).toFixed(0);
  return `${minutes}m ${remainingSec}s`;
}

function parsePlaywrightResults(data) {
  const stats = data.stats || {};
  const passed = stats.expected || 0;
  const failed = stats.unexpected || 0;
  const flaky = stats.flaky || 0;
  const skipped = stats.skipped || 0;
  const total = (stats.total !== undefined) ? stats.total : (passed + failed + flaky + skipped);
  const duration = formatDuration(stats.duration);

  const failingTitles = [];

  function collectFailures(suite, suitePrefix = '') {
    const title = suite.title ? (suitePrefix ? `${suitePrefix} > ${suite.title}` : suite.title) : suitePrefix;

    if (Array.isArray(suite.specs)) {
      for (const spec of suite.specs) {
        const specTitle = title ? `${title} > ${spec.title}` : spec.title;
        const isFailed = !spec.ok || (spec.tests && spec.tests.some(t =>
          t.status === 'unexpected' ||
          (t.results && t.results.some(r => r.status === 'failed' || r.status === 'timedOut'))
        ));

        if (isFailed) {
          failingTitles.push(specTitle);
        }
      }
    }

    if (Array.isArray(suite.suites)) {
      for (const childSuite of suite.suites) {
        collectFailures(childSuite, title);
      }
    }
  }

  if (Array.isArray(data.suites)) {
    for (const rootSuite of data.suites) {
      collectFailures(rootSuite);
    }
  }

  return { total, passed, failed, flaky, skipped, duration, failingTitles };
}

function parseAllureSummary(data, filePath) {
  const stat = data.statistic || {};
  const total = stat.total || 0;
  const passed = stat.passed || 0;
  const failed = (stat.failed || 0) + (stat.broken || 0);
  const skipped = stat.skipped || 0;
  const flaky = stat.unknown || 0;
  const duration = formatDuration(data.time?.duration);

  const failingTitles = [];

  // Attempt to read sibling suites.json for failing test titles
  try {
    const suitesFile = path.join(path.dirname(filePath), 'suites.json');
    if (fs.existsSync(suitesFile)) {
      const suitesData = JSON.parse(fs.readFileSync(suitesFile, 'utf8'));

      function traverseAllure(node) {
        if (node.status === 'failed' || node.status === 'broken') {
          if (node.name) failingTitles.push(node.name);
        }
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            traverseAllure(child);
          }
        }
      }

      if (Array.isArray(suitesData.items)) {
        for (const item of suitesData.items) {
          traverseAllure(item);
        }
      }
    }
  } catch (err) {
    // Non-critical: failure titles are best effort from Allure summary
  }

  return { total, passed, failed, flaky, skipped, duration, failingTitles };
}

function main() {
  const argFile = process.argv[2];
  const targetFile = resolveInputFile(argFile);

  if (!targetFile) {
    console.log(`ℹ️ [summarize-test-results] No test results file found (searched: ${argFile || 'default locations'}).`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `### 📊 Test Execution Summary\n\n> ℹ️ No test results file was found at \`${argFile || 'test-results/results.json'}\`.\n\n`
      );
    }
    process.exit(0);
  }

  console.log(`🔍 [summarize-test-results] Reading test results from: ${targetFile}`);

  let parsedData;
  try {
    const rawContent = fs.readFileSync(targetFile, 'utf8');
    parsedData = JSON.parse(rawContent);
  } catch (err) {
    console.warn(`⚠️ [summarize-test-results] Could not parse JSON from ${targetFile}: ${err.message}`);
    process.exit(0);
  }

  let summary;
  if (parsedData.statistic) {
    summary = parseAllureSummary(parsedData, targetFile);
  } else if (parsedData.stats || parsedData.suites) {
    summary = parsePlaywrightResults(parsedData);
  } else {
    console.log('ℹ️ [summarize-test-results] Unrecognized result schema; writing default summary.');
    process.exit(0);
  }

  const { total, passed, failed, flaky, skipped, duration, failingTitles } = summary;

  let markdown = '### 📊 Test Execution Summary\n\n';
  markdown += '| Total | Passed | Failed | Flaky | Skipped | Duration |\n';
  markdown += '| :---: | :---: | :---: | :---: | :---: | :---: |\n';
  markdown += `| **${total}** | **${passed}** | **${failed}** | **${flaky}** | **${skipped}** | **${duration}** |\n\n`;

  if (failed > 0) {
    markdown += '#### ❌ Failing Tests (first 10)\n\n';
    const uniqueFailures = Array.from(new Set(failingTitles));
    const displayedFailures = uniqueFailures.slice(0, 10);
    if (displayedFailures.length > 0) {
      displayedFailures.forEach((title, idx) => {
        markdown += `${idx + 1}. \`${title}\`\n`;
      });
      if (uniqueFailures.length > 10) {
        markdown += `\n*...and ${uniqueFailures.length - 10} more failing tests. See full report artifacts for details.*\n`;
      }
    } else {
      markdown += `*${failed} test(s) failed. See report artifacts for detailed traces.*\n`;
    }
    markdown += '\n';
  } else if (total > 0) {
    markdown += '> ✅ **All tests passed cleanly!**\n\n';
  } else {
    markdown += '> ℹ️ **No tests executed.**\n\n';
  }

  console.log(markdown);

  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
      console.log('✅ Appended summary to $GITHUB_STEP_SUMMARY');
    } catch (err) {
      console.warn(`⚠️ Failed writing to $GITHUB_STEP_SUMMARY: ${err.message}`);
    }
  }

  process.exit(0);
}

main();
