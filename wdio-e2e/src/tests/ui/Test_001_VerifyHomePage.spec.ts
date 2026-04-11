import { BaseTest } from '@core/base/base.test';
import { HomePage } from '@pages/home.page';

async function runWithBase(title: string, testBody: (base: BaseTest) => Promise<void>) {
  const base = new BaseTest();

  try {
    await base.setup();
    await testBody(base);
    await base.teardown({ title, passed: true });
  } catch (error) {
    await base.teardown({ title, passed: false });
    throw error;
  }
}

describe('Home Page Tests', () => {
  it('Testcase 1: Verify Home page loads', async () => {
    await runWithBase('Testcase 1: Verify Home page loads', async () => {
      const home = new HomePage();
      await home.verifyLandingPage();
    });
  });

  it('Testcase 2: Verify Home page loads 2', async () => {
    await runWithBase('Testcase 2: Verify Home page loads 2', async () => {
      const home = new HomePage();
      await home.verifyLandingPage();
    });
  });
});
