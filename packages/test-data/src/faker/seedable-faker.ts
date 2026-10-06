import { faker } from '@faker-js/faker';

let currentSeed: number | undefined = undefined;

/**
 * Initialize seed from TEST_DATA_SEED environment variable if present.
 */
function initSeedFromEnv(): void {
  const envSeed = process.env.TEST_DATA_SEED;
  if (envSeed !== undefined && envSeed.trim() !== '') {
    const parsed = parseInt(envSeed, 10);
    if (!isNaN(parsed)) {
      setSeed(parsed);
    }
  }
}

/**
 * Set a deterministic seed for faker to ensure reproducible test runs.
 * Logs the seed to stdout for diagnostic and report traceability.
 */
export function setSeed(seed: number): void {
  currentSeed = seed;
  faker.seed(seed);
  if (process.env.NODE_ENV !== 'test-silent') {
    console.info(`[test-data] Active Faker seed: ${seed}`);
  }
}

/**
 * Get the currently active seed, or undefined if random.
 */
export function getSeed(): number | undefined {
  return currentSeed;
}

/**
 * Reset seed to unseeded random state.
 */
export function resetSeed(): void {
  currentSeed = undefined;
  // Re-seed with a fresh time-based seed
  faker.seed(Date.now() ^ (Math.random() * 0x10000000));
}

// Auto-initialize on module load
initSeedFromEnv();

export { faker };
