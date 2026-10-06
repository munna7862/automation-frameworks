/**
 * Playwright Global Teardown — Testcontainers Mode (Sprint 7.3 DX)
 *
 * Automatically stops and removes ephemeral containers when they were started
 * by Testcontainers during global-setup.ts.
 */
export default async function globalTeardown(): Promise<void> {
  const startedEnv = (globalThis as any).__TESTCONTAINERS_ENV__;
  const wasStarted = (globalThis as any).__TESTCONTAINERS_STARTED__;

  if (startedEnv && wasStarted) {
    console.log('\n🛑 [Testcontainers] Stopping ephemeral BuggyBooks containers...');
    try {
      await startedEnv.down({ removeVolumes: true });
      console.log('🧹 [Testcontainers] Ephemeral environment stopped and volumes purged.\n');
    } catch (err: any) {
      console.warn(`⚠️ [Testcontainers] Teardown warning: ${err?.message || err}`);
    } finally {
      (globalThis as any).__TESTCONTAINERS_ENV__ = undefined;
      (globalThis as any).__TESTCONTAINERS_STARTED__ = false;
    }
  }
}
