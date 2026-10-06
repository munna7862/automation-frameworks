#!/usr/bin/env tsx

/**
 * ============================================================================
 * BuggyBooks — Pact Consumer Contracts Runner
 * ============================================================================
 *
 * Runs consumer contract specifications (CT-PACT-001 through CT-PACT-007)
 * modeling client interactions from the frontend application against the
 * Pact V3 Mock Service.
 *
 * Outputs:
 *   playwright-e2e/contract-tests/pacts/buggybooks-web-buggybooks-api.json
 *
 * Usage:
 *   npx tsx contract-tests/consumer/run-consumer-tests.ts
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { runBooksConsumerTests } from './books.consumer.spec';
import { runAuthConsumerTests } from './auth.consumer.spec';
import { runCartConsumerTests } from './cart.consumer.spec';
import { runCheckoutConsumerTests } from './checkout.consumer.spec';
import { PACTS_DIR } from './pact.setup';

async function main(): Promise<void> {
  console.log('='.repeat(78));
  console.log('🤝 BuggyBooks Pact Consumer Contract Test Suite');
  console.log('   Consumer: buggybooks-web | Provider: buggybooks-api');
  console.log('='.repeat(78));

  // Ensure output directory exists and stale pact is purged
  if (!fs.existsSync(PACTS_DIR)) {
    fs.mkdirSync(PACTS_DIR, { recursive: true });
  }
  const pactFilePath = path.join(PACTS_DIR, 'buggybooks-web-buggybooks-api.json');
  if (fs.existsSync(pactFilePath)) {
    fs.unlinkSync(pactFilePath);
  }

  const startTime = Date.now();

  try {
    await runBooksConsumerTests();
    await runAuthConsumerTests();
    await runCartConsumerTests();
    await runCheckoutConsumerTests();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const pactFilePath = path.join(PACTS_DIR, 'buggybooks-web-buggybooks-api.json');

    console.log('-'.repeat(78));
    console.log(`✅ All Pact consumer contract tests completed successfully in ${duration}s!`);
    if (fs.existsSync(pactFilePath)) {
      const stats = fs.statSync(pactFilePath);
      console.log(`📁 Pact Contract Generated: ${pactFilePath} (${stats.size} bytes)`);
    } else {
      console.warn(`⚠️ Warning: Expected pact file not found at ${pactFilePath}`);
    }
    console.log('='.repeat(78));
    process.exit(0);
  } catch (error) {
    console.error('-'.repeat(78));
    console.error('❌ Pact consumer contract execution failed:');
    console.error((error as Error).message || error);
    console.error('='.repeat(78));
    process.exit(1);
  }
}

main();
