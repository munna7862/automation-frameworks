#!/usr/bin/env node
/**
 * Cross-Framework Allure Environment Properties Generator
 * Standardizes metadata across Playwright, Selenium, WebdriverIO, and Mobile automation frameworks.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const frameworkConfigs = {
  playwright: {
    name: 'Playwright',
    targetDir: path.join(rootDir, 'playwright-e2e', 'allure-results'),
    browser: 'Google Chrome (channel: chrome)',
    driverVersion: '^1.58.0'
  },
  selenium: {
    name: 'Selenium WebDriver (TypeScript + Mocha)',
    targetDir: path.join(rootDir, 'selenium-e2e', 'allure-results'),
    browser: 'Google Chrome (ChromeDriver)',
    driverVersion: '^4.43.0'
  },
  wdio: {
    name: 'WebdriverIO (TypeScript + Mocha)',
    targetDir: path.join(rootDir, 'wdio-e2e', 'allure-results'),
    browser: 'Google Chrome (DevTools/WebDriver)',
    driverVersion: '^9.0.0'
  },
  mobile: {
    name: 'Appium 2.x + WebdriverIO Mobile',
    targetDir: path.join(rootDir, 'mobile-automation', 'allure-results'),
    browser: 'UiAutomator2 (Android Emulator - Pixel 6)',
    driverVersion: '^2.16.1'
  }
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    framework: null,
    all: false,
    output: null
  };

  for (const arg of args) {
    if (arg === '--all') {
      options.all = true;
    } else if (arg.startsWith('--framework=')) {
      options.framework = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    }
  }

  return options;
}

function generateProperties(frameworkKey) {
  const config = frameworkConfigs[frameworkKey] || {
    name: frameworkKey,
    browser: 'Google Chrome',
    driverVersion: 'Unknown'
  };

  const env = process.env.ENVIRONMENT || process.env.ENV || 'STAGING';
  const baseUrl = process.env.BASE_URL || 'https://buggy-books-fe.onrender.com/';
  const apiBaseUrl = process.env.API_BASE_URL || 'https://buggy-books.onrender.com';
  const headless = process.env.HEADLESS !== undefined ? process.env.HEADLESS : 'true';
  const ciRunner = process.env.CI
    ? `GitHub Actions (Run #${process.env.GITHUB_RUN_NUMBER || 'CI'}, Ref: ${process.env.GITHUB_REF || 'unknown'})`
    : 'Local Workstation';

  const properties =
    [
      `# Allure Environment Metadata - Generated ${new Date().toISOString()}`,
      `Framework=${config.name}`,
      `Framework.Version=${config.driverVersion}`,
      `Test.Environment=${env}`,
      `Base.URL=${baseUrl}`,
      `API.Base.URL=${apiBaseUrl}`,
      `Browser.Target=${config.browser}`,
      `Headless.Mode=${headless}`,
      `Operating.System=${process.platform} (${process.arch})`,
      `Node.Version=${process.version}`,
      `CI.Runner=${ciRunner}`,
      `Timestamp=${new Date().toISOString()}`
    ].join('\n') + '\n';

  return properties;
}

function writeEnvironmentFile(targetDir, properties) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, 'environment.properties');
  fs.writeFileSync(filePath, properties, 'utf-8');
  console.log(`[Allure Environment] Generated metadata at: ${filePath}`);
}

function main() {
  const options = parseArgs();

  if (options.output) {
    const frameworkKey = options.framework || 'playwright';
    const props = generateProperties(frameworkKey);
    const targetDir = path.isAbsolute(options.output)
      ? options.output
      : path.resolve(process.cwd(), options.output);
    writeEnvironmentFile(targetDir, props);
    return;
  }

  if (options.all) {
    for (const key of Object.keys(frameworkConfigs)) {
      const props = generateProperties(key);
      writeEnvironmentFile(frameworkConfigs[key].targetDir, props);
    }
    return;
  }

  if (options.framework && frameworkConfigs[options.framework]) {
    const props = generateProperties(options.framework);
    writeEnvironmentFile(frameworkConfigs[options.framework].targetDir, props);
    return;
  }

  // Default: detect from current working directory or generate for playwright
  const cwd = process.cwd();
  if (cwd.includes('selenium-e2e')) {
    writeEnvironmentFile(frameworkConfigs.selenium.targetDir, generateProperties('selenium'));
  } else if (cwd.includes('wdio-e2e')) {
    writeEnvironmentFile(frameworkConfigs.wdio.targetDir, generateProperties('wdio'));
  } else if (cwd.includes('mobile-automation')) {
    writeEnvironmentFile(frameworkConfigs.mobile.targetDir, generateProperties('mobile'));
  } else if (cwd.includes('playwright-e2e')) {
    writeEnvironmentFile(frameworkConfigs.playwright.targetDir, generateProperties('playwright'));
  } else {
    // Monorepo root default: generate for all
    console.log(
      '[Allure Environment] No specific framework specified, generating for all frameworks...'
    );
    for (const key of Object.keys(frameworkConfigs)) {
      writeEnvironmentFile(frameworkConfigs[key].targetDir, generateProperties(key));
    }
  }
}

main();
