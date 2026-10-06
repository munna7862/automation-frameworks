import { test } from '../../../core/base/base.fixture';
import { envConfig } from '../../../config/env.config';
import { ProfilePage } from '../../../pages/profile.page';
import { UserFactory, ApiSeeder, createPlaywrightAdapter } from '@automationframeworks/test-data';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Profile Summary and Order History', () => {
  test('UI_PROF_01: Verify user account profile summary and avatar preview render correctly @smoke @regression', async ({
    signUpPage,
    catalogPage,
    commonFunctions,
    page
  }) => {
    const profilePage = new ProfilePage(page);
    const user = UserFactory.build({ fullName: 'Profile Test User' });
    const pageHttp = createPlaywrightAdapter(page.request, envConfig.apiBaseUrl);
    const seeder = new ApiSeeder(pageHttp);

    await test.step('Seed user account and order state via API seeder', async () => {
      await seeder.createUser(user);
      const session = await seeder.login(user);
      await seeder.addToCart(session, '1');
      await seeder.placeOrder(session);
    });

    await test.step('Log in with seeded user credentials and open Profile', async () => {
      await catalogPage.navigateToCatalog(envConfig.baseUrl);
      await catalogPage.clickNavigateLink('Login');
      await signUpPage.login(user.username, user.password);
      await profilePage.openProfile();
    });

    await test.step('Verify profile summary contains account full name, username, and avatar preview', async () => {
      const profileInfoText = await profilePage.getProfileInfoText();
      const avatarSrc = await profilePage.getAvatarPreviewSrc();

      const nameMatch = profileInfoText.includes(user.fullName);
      const usernameMatch = profileInfoText.includes(user.username);
      const avatarValid = avatarSrc.length > 0;

      await commonFunctions.verifyCondition(
        nameMatch && usernameMatch && avatarValid,
        'Verifying profile page renders registered full name, username, and avatar preview'
      );
    });
  });
});
