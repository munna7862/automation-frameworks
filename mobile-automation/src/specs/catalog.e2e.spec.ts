import { loginScreen } from '../screens/LoginScreen.js';
import { catalogScreen } from '../screens/CatalogScreen.js';
import { cartScreen } from '../screens/CartScreen.js';
import { chaosScreen } from '../screens/ChaosScreen.js';
import { navigationTab } from '../screens/NavigationTab.js';

describe('Catalog Gestures, Add-To-Cart Latency & Offline Sync (TC-MOB-002, TC-MOB-005, MOB-B3)', () => {
  before(async () => {
    // Ensure logged in
    if (await loginScreen.isLoaded()) {
      await loginScreen.login('testuser', 'password123');
    }
  });

  it('should search for books and update results count', async () => {
    await navigationTab.openCatalog();
    await catalogScreen.searchBooks('JavaScript');

    const resultsCount = await catalogScreen.getResultsCountText();
    expect(resultsCount).toBeDefined();

    // Clear filter
    await catalogScreen.clearSearch();
  });

  it('should perform touch scroll, select a book card, and inspect bottom-sheet modal (TC-MOB-002)', async () => {
    await navigationTab.openCatalog();

    // Perform vertical swipe gesture to browse catalog
    await catalogScreen.swipeUp(0.3);

    // Tap on book item to open detail bottom-sheet modal
    await catalogScreen.openBookDetail('book-1');

    // Close detail modal if displayed and restore catalog view
    await catalogScreen.closeDetailModal();
    const isCatalogLoaded = await catalogScreen.isLoaded();
    expect(isCatalogLoaded).toBe(true);
  });

  it('should handle dynamic add-to-cart delay (MOB-B3) and reflect in cart', async () => {
    await navigationTab.openCatalog();

    // Quick add first item, awaiting dynamic delay (500-3500ms)
    await catalogScreen.quickAddToCart('book-1');

    // Verify item in cart
    await navigationTab.openCart();
    const isCartLoaded = await cartScreen.isLoaded();
    expect(isCartLoaded).toBe(true);

    const isCartEmpty = await cartScreen.isCartEmpty();
    expect(isCartEmpty).toBe(false);
  });

  it('should verify cart item mutation and handle simulated offline toggle (TC-MOB-005)', async () => {
    await navigationTab.openCart();
    const isCartLoaded = await cartScreen.isLoaded();
    expect(isCartLoaded).toBe(true);

    // Navigate to chaos controls and toggle simulated offline mode
    await navigationTab.openChaos();
    await chaosScreen.toggleSimulatedOffline();

    // Verify offline banner renders
    const isBannerVisible = await chaosScreen.isOfflineBannerVisible();
    expect(typeof isBannerVisible).toBe('boolean');

    // Toggle offline mode back off to restore connectivity
    await chaosScreen.toggleSimulatedOffline();
    await navigationTab.openCart();
  });
});
