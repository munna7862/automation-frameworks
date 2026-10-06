import http from 'http';
import * as path from 'path';

/**
 * Probes whether an HTTP endpoint is online and responding with a non-5xx status.
 */
function isEndpointResponding(url: string, timeoutMs: number = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname,
          method: 'GET',
          timeout: timeoutMs
        },
        (res) => {
          resolve((res.statusCode ?? 500) < 500);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

/**
 * Playwright Global Setup — Testcontainers Mode (Sprint 7.3 DX)
 *
 * Automatically spins up ephemeral BuggyBooks containers via Testcontainers when:
 *   1. ENV === 'DOCKER'
 *   2. BUGGYBOOKS_AUTOSTART === 'true'
 *   3. Running locally (!process.env.CI)
 *
 * Reuses existing running containers if ports 4000 & 5173 are already responding.
 */
export default async function globalSetup(): Promise<void> {
  const isCI = Boolean(process.env.CI);
  const env = (process.env.ENV || '').toUpperCase();
  const autoStart =
    process.env.BUGGYBOOKS_AUTOSTART === 'true' || process.env.BUGGYBOOKS_AUTOSTART === '1';

  // 1. Strict CI guard: CI relies exclusively on the composite action (.github/actions/buggybooks-up)
  if (isCI) {
    return;
  }

  // 2. Only proceed if local DOCKER mode is targeted and autostart was requested
  if (env !== 'DOCKER' || !autoStart) {
    return;
  }

  // 3. Probe whether BuggyBooks services are already running locally (e.g., via `task env:up`)
  const [backendAlive, frontendAlive] = await Promise.all([
    isEndpointResponding('http://127.0.0.1:4000/api/health'),
    isEndpointResponding('http://127.0.0.1:5173/')
  ]);

  if (backendAlive && frontendAlive) {
    console.log(
      '⚡ [Testcontainers] BuggyBooks services are already responding on ports 4000 & 5173. Reusing existing stack.'
    );
    (globalThis as any).__TESTCONTAINERS_STARTED__ = false;
    return;
  }

  console.log(
    '🐳 [Testcontainers] BUGGYBOOKS_AUTOSTART=true detected. Starting ephemeral BuggyBooks stack via Testcontainers...'
  );

  const composeFilePath = path.resolve(__dirname, '../../../infra');
  const composeFile = 'docker-compose.test.yml';

  try {
    const { DockerComposeEnvironment, Wait } = await import('testcontainers');

    const environment = new DockerComposeEnvironment(composeFilePath, composeFile)
      .withEnvironment({
        BUGGYBOOKS_TAG: process.env.BUGGYBOOKS_TAG || 'latest',
        BUGGYBOOKS_FE_TAG: process.env.BUGGYBOOKS_FE_TAG || 'ci-localhost',
        JWT_SECRET: process.env.JWT_SECRET || 'ci-test-secret'
      })
      .withWaitStrategy('backend', Wait.forHttp('/api/health', 4000).forStatusCode(200))
      .withWaitStrategy('frontend', Wait.forHttp('/', 80).forStatusCode(200));

    const startedEnv = await environment.up();
    (globalThis as any).__TESTCONTAINERS_ENV__ = startedEnv;
    (globalThis as any).__TESTCONTAINERS_STARTED__ = true;

    console.log(
      '✅ [Testcontainers] Ephemeral BuggyBooks containers are online and healthy on ports 4000 & 5173.'
    );
  } catch (error: any) {
    console.error(
      '\n❌ [Testcontainers] Failed to launch BuggyBooks containers via Testcontainers.'
    );
    console.error(
      '   Note: BUGGYBOOKS_AUTOSTART=true requires Docker Desktop or Docker Engine to be running.'
    );
    console.error(
      '   On Windows: Ensure Docker Desktop is running and WSL2 integration is enabled.'
    );
    console.error(`   Error details: ${error?.message || error}\n`);
    throw error;
  }
}
