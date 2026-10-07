import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { redactHeaders, redactString } from '@automationframeworks/playwright-utils';
import { envConfig } from '../src/config/env.config';

async function recordAndRedactHar() {
  const outputDir = path.resolve(__dirname, '../src/test-data/ui/har');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const finalHarPath = path.resolve(outputDir, 'catalog-happy-path.har');
  const tempHarPath = path.resolve(outputDir, 'temp-record.har');

  console.log(`[HAR:Record] Launching browser to record HAR against ${envConfig.baseUrl}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordHar: {
      path: tempHarPath,
      mode: 'minimal',
      content: 'embed',
      urlFilter: '**/api/books**'
    }
  });

  const page = await context.newPage();
  try {
    await page.goto(envConfig.baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.catalog-book-cover', { timeout: 30000 });
    console.log('[HAR:Record] Catalog loaded successfully, closing context to flush HAR...');
  } catch (err) {
    console.warn('[HAR:Record] Warning during navigation or wait:', err);
  } finally {
    await context.close();
    await browser.close();
  }

  if (!fs.existsSync(tempHarPath)) {
    throw new Error(`Temp HAR was not generated at: ${tempHarPath}`);
  }

  console.log('[HAR:Record] Scrubbing and redacting sensitive data from HAR...');
  const rawHarContent = fs.readFileSync(tempHarPath, 'utf-8');
  const har = JSON.parse(rawHarContent);

  if (har.log && Array.isArray(har.log.entries)) {
    har.log.entries = har.log.entries.filter(
      (entry: any) => entry.request && entry.request.url && entry.request.url.includes('/api/books')
    );
    for (const entry of har.log.entries) {
      if (entry.request) {
        if (Array.isArray(entry.request.headers)) {
          entry.request.headers = entry.request.headers.map(
            (h: { name: string; value: string }) => {
              const lowerName = h.name.toLowerCase();
              if (['authorization', 'cookie', 'x-api-key', 'x-csrf-token'].includes(lowerName)) {
                return { name: h.name, value: '[REDACTED]' };
              }
              return h;
            }
          );
        }
        if (Array.isArray(entry.request.cookies)) {
          entry.request.cookies = entry.request.cookies.map((c: any) => ({
            ...c,
            value: '[REDACTED]'
          }));
        }
        if (entry.request.postData && typeof entry.request.postData.text === 'string') {
          entry.request.postData.text = redactString(entry.request.postData.text);
        }
      }

      if (entry.response) {
        if (Array.isArray(entry.response.headers)) {
          entry.response.headers = entry.response.headers.map(
            (h: { name: string; value: string }) => {
              const lowerName = h.name.toLowerCase();
              if (['set-cookie', 'authorization'].includes(lowerName)) {
                return { name: h.name, value: '[REDACTED]' };
              }
              return h;
            }
          );
        }
        if (Array.isArray(entry.response.cookies)) {
          entry.response.cookies = entry.response.cookies.map((c: any) => ({
            ...c,
            value: '[REDACTED]'
          }));
        }
        if (entry.response.content && typeof entry.response.content.text === 'string') {
          entry.response.content.text = redactString(entry.response.content.text);
        }
      }
    }
  }

  fs.writeFileSync(finalHarPath, JSON.stringify(har, null, 2), 'utf-8');
  if (fs.existsSync(tempHarPath)) {
    fs.unlinkSync(tempHarPath);
  }
  console.log(`[HAR:Record] Successfully saved sanitized HAR to ${finalHarPath}`);
}

recordAndRedactHar().catch((err) => {
  console.error('[HAR:Record] Error recording HAR:', err);
  process.exit(1);
});
