import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import * as path from 'path';

export const PACTS_DIR = path.resolve(__dirname, '../pacts');

/**
 * Creates a configured PactV3 consumer contract test provider instance.
 */
export function createPactProvider(): PactV3 {
  return new PactV3({
    consumer: 'buggybooks-web',
    provider: 'buggybooks-api',
    dir: PACTS_DIR,
    logLevel: 'error'
  });
}

export { MatchersV3 };
