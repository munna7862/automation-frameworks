import { test } from '../../../core/base/base.fixture';
import { envConfig } from '../../../config/env.config';
import { CartPage } from '../../../pages/cart.page';
import { UserFactory } from '@automationframeworks/test-data';

const BOOKS_TEST_DATA = {
  firstSearch: 'Mockingbird',
  firstBookId: 2,
  secondSearch: 'Gatsby',
  secondBookId: 1
};

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Cart Quantity & Total Adjustment', () => {
  test('UI_CART_04: Cart item addition and removal dynamically recalculates item count and order total @regression', async ({
    signUpPage,
    catalogPage,
    commonFunctions,
    page
  }) => {
    const cartPage = new CartPage(page);
    const user = UserFactory.build({ fullName: 'Cart Quantity User' });
    let initialSinglePrice = 0;

    await test.step('Register new user session', async () => {
      await catalogPage.navigateToCatalog(envConfig.baseUrl);
      await catalogPage.clickNavigateLink('Sign Up');
      await signUpPage.registerNewUser(user.fullName, user.username, user.password, user.password);
    });

    await test.step('Add first book to cart and verify single item total', async () => {
      await catalogPage.clickNavigateLink('Catalog');
      await catalogPage.searchBooks(BOOKS_TEST_DATA.firstSearch);
      await catalogPage.addBookToCart(BOOKS_TEST_DATA.firstBookId);
      await catalogPage.waitForCartStatusMessage('added to cart');

      await cartPage.openCart();
      const count = await cartPage.getCartItemsCount();
      initialSinglePrice = await cartPage.getCartTotalAmount();

      await commonFunctions.verifyValue(count, 1, 'Verifying 1 item in cart');
      await commonFunctions.verifyCondition(
        initialSinglePrice > 0,
        'Verifying non-zero initial cart total price'
      );
    });

    await test.step('Add second book to cart and verify dynamic subtotal increment', async () => {
      await catalogPage.clickNavigateLink('Catalog');
      await catalogPage.searchBooks(BOOKS_TEST_DATA.secondSearch);
      await catalogPage.addBookToCart(BOOKS_TEST_DATA.secondBookId);
      await catalogPage.waitForCartStatusMessage('added to cart');

      await cartPage.openCart();
      const updatedCount = await cartPage.getCartItemsCount();
      const updatedTotal = await cartPage.getCartTotalAmount();

      await commonFunctions.verifyValue(
        updatedCount,
        2,
        'Verifying cart item count increased to 2'
      );
      await commonFunctions.verifyCondition(
        updatedTotal > initialSinglePrice,
        'Verifying grand total updated dynamically upon adding second item'
      );
    });

    await test.step('Remove first book and verify cart total decreases dynamically', async () => {
      const totalBeforeRemove = await cartPage.getCartTotalAmount();
      await cartPage.removeFirstCartItem();

      const finalCount = await cartPage.getCartItemsCount();
      const finalTotal = await cartPage.getCartTotalAmount();

      await commonFunctions.verifyValue(finalCount, 1, 'Verifying cart item count decreased to 1');
      await commonFunctions.verifyCondition(
        finalTotal < totalBeforeRemove,
        'Verifying grand total reduced dynamically after item removal'
      );
    });
  });
});
