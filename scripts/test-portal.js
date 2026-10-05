const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const portalDir = path.resolve(__dirname, '..', 'docs', 'portal');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, 'http://127.0.0.1');
  const pathname = parsedUrl.pathname;

  if (pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Strict static whitelist to eliminate any path traversal / uncontrolled path expression
  let targetFile = null;
  if (pathname === '/' || pathname === '/index.html') {
    targetFile = 'index.html';
  } else if (pathname === '/portal-data.json') {
    targetFile = 'portal-data.json';
  }

  if (!targetFile) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const safeFilePath = path.join(portalDir, targetFile);
  const ext = path.extname(safeFilePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(safeFilePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(8099, async () => {
  try {
    const browser = await chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (msg) => {
      console.log('BROWSER LOG:', msg.type(), msg.text());
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:8099/');
    await page.waitForTimeout(600);

    const kpiTotal = await page.locator('#kpi-total-tests').textContent();
    const commit = await page.locator('#kpi-commit').textContent();
    console.log('HTTP Test - KPI Total:', kpiTotal);
    console.log('HTTP Test - Commit:', commit);
    console.log('HTTP Test - Error count:', errors.length);

    // Test filter tab click
    await page.click('button[data-filter="web"]');
    await page.waitForTimeout(200);
    const visibleCards = await page.locator('.framework-card:visible').count();
    console.log('Visible cards under Web filter:', visibleCards);

    // Test reset filter
    await page.click('button[data-filter="all"]');
    await page.waitForTimeout(200);
    const allCards = await page.locator('.framework-card:visible').count();
    console.log('Visible cards under All filter:', allCards);

    // Test mobile viewport responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    const mobileCardsCount = await page.locator('.framework-card:visible').count();
    console.log('Mobile Viewport Cards Count:', mobileCardsCount);

    await browser.close();
    server.close();

    if (errors.length > 0 || allCards !== 6 || visibleCards === 0 || mobileCardsCount !== 6) {
      console.error('Portal validation failed!');
      process.exit(1);
    } else {
      console.log('Portal validation PASSED completely across desktop and mobile!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
});
