#!/usr/bin/env tsx

/**
 * ============================================================================
 * BuggyBooks — Performance Dataset Generator
 * ============================================================================
 *
 * Generates synchronized, deterministic test datasets for both performance engines:
 *   1. JMeter: jmeter/TestData/users.csv (CSV format)
 *   2. k6:     k6-performance/data/users.json (JSON format)
 *
 * Usage:
 *   npm run data:perf
 *   npx tsx packages/test-data/scripts/generate-perf-datasets.ts [--count 25] [--seed 42]
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { setSeed, UserFactory, UserData } from '../src';

const ROOT_DIR = path.resolve(__dirname, '../../..');
const JMETER_CSV_PATH = path.join(ROOT_DIR, 'jmeter', 'TestData', 'users.csv');
const K6_DATA_DIR = path.join(ROOT_DIR, 'k6-performance', 'data');
const K6_JSON_PATH = path.join(K6_DATA_DIR, 'users.json');

// Parse CLI args
const args = process.argv.slice(2);
let count = 20;
let seed = 42;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--count' && args[i + 1]) {
    count = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--seed' && args[i + 1]) {
    seed = parseInt(args[i + 1], 10);
    i++;
  }
}

// Override seed with environment variable if present
if (process.env.TEST_DATA_SEED) {
  const envSeed = parseInt(process.env.TEST_DATA_SEED, 10);
  if (!isNaN(envSeed)) {
    seed = envSeed;
  }
}

console.log('='.repeat(78));
console.log('📊 BuggyBooks Performance Dataset Generator');
console.log(`   • Seed:  ${seed} (reproducible generation)`);
console.log(`   • Count: ${count} users`);
console.log('='.repeat(78));

setSeed(seed);

// Standard seed admin user always included first
const adminUser: UserData = {
  username: 'admin',
  password: 'password123',
  fullName: 'Administrator',
  email: 'admin@buggybooks.internal'
};

const generatedUsers: UserData[] = [adminUser];
for (let i = 1; i <= count; i++) {
  generatedUsers.push(
    UserFactory.build({
      username: `perf_user_${i.toString().padStart(3, '0')}`,
      password: 'Password123!'
    })
  );
}

// 1. Write JMeter CSV: username,password
const csvHeader = 'username,password\n';
const csvRows = generatedUsers.map((u) => `${u.username},${u.password}`).join('\n');
const csvContent = csvHeader + csvRows + '\n';

const jmeterDir = path.dirname(JMETER_CSV_PATH);
if (!fs.existsSync(jmeterDir)) {
  fs.mkdirSync(jmeterDir, { recursive: true });
}
fs.writeFileSync(JMETER_CSV_PATH, csvContent, 'utf-8');
console.log(
  `✅ JMeter CSV written: ${path.relative(ROOT_DIR, JMETER_CSV_PATH)} (${generatedUsers.length} rows)`
);

// 2. Write k6 JSON: [{ username, password, fullName, email }]
if (!fs.existsSync(K6_DATA_DIR)) {
  fs.mkdirSync(K6_DATA_DIR, { recursive: true });
}
fs.writeFileSync(K6_JSON_PATH, JSON.stringify(generatedUsers, null, 2) + '\n', 'utf-8');
console.log(
  `✅ k6 JSON written:    ${path.relative(ROOT_DIR, K6_JSON_PATH)} (${generatedUsers.length} entries)`
);

console.log('='.repeat(78));
console.log('✨ Datasets generated successfully from @automationframeworks/test-data!');
