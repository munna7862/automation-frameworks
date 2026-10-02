const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, '..', 'docs', 'portal', reqPath);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = ext === '.html' ? 'text/html' : (ext === '.json' ? 'application/json' : 'text/plain');
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8099, async () => {
  try {
    const browser = await chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage();
    const errors = [];
    page.on('console', msg => {
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
