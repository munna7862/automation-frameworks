import { test, expect } from '../../../core/base/security.fixture';
import { envConfig } from '../../../config/env.config';
import { randomBytes } from 'crypto';

test.describe('SEC-AUTHZ: Broken Object Level Authorization (BOLA/BOPLA) Suite', () => {
  test.beforeEach(async () => {
    test.skip(
      envConfig.env !== 'DOCKER',
      'Attack payloads only permitted on disposable DOCKER environment'
    );
  });

  test.afterEach(async ({ api }) => {
    await api.testControl.reset();
  });

  test('SEC-AUTHZ-01: User A token cannot read User B orders @security @owasp-api1', async ({
    securityApi
  }) => {
    const userA = `user_a_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const userB = `user_b_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'Password123!';

    const regA = await securityApi.auth.register({ username: userA, password, fullName: 'User A' });
    const regB = await securityApi.auth.register({ username: userB, password, fullName: 'User B' });
    expect(regA.status).toBe(201);
    expect(regB.status).toBe(201);

    const tokenA = regA.data.token;
    const tokenB = regB.data.token;

    // User B adds an item to cart and creates an order
    await securityApi.cart.add('1', { headers: { Authorization: `Bearer ${tokenB}` } });
    const orderRes = await securityApi.checkout.process(
      { firstName: 'Bob', lastName: 'Builder', creditCard: '4532111122223333' },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    expect(orderRes.status).toBe(200);

    // User A fetches /api/orders using Token A
    const ordersA = await securityApi.orders.list({
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    expect(ordersA.status).toBe(200);

    // Verify User A does not see User B's order
    const userAOrders = Array.isArray(ordersA.data) ? ordersA.data : [];
    const bOrderExists = userAOrders.some(
      (order: any) =>
        order.id === (orderRes.data as any)?.id || order.id === (orderRes.data as any)?.orderId
    );
    expect(bOrderExists).toBe(false);
  });

  test('SEC-AUTHZ-02: User A token cannot access User B profile @security @owasp-api1', async ({
    securityApi
  }) => {
    const userA = `user_a_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const userB = `user_b_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'Password123!';

    const regA = await securityApi.auth.register({
      username: userA,
      password,
      fullName: 'Alice Alpha'
    });
    const regB = await securityApi.auth.register({
      username: userB,
      password,
      fullName: 'Bob Beta'
    });
    expect(regA.status).toBe(201);
    expect(regB.status).toBe(201);
    const tokenA = regA.data.token;

    // User A requests profile with User A's token
    const profA = await securityApi.profile.get({
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    expect(profA.status).toBe(200);
    expect(profA.data.username).toBe(userA);
    expect(profA.data.username).not.toBe(userB);
    expect(profA.data.fullName).toBe('Alice Alpha');
  });

  test('SEC-AUTHZ-03: User A token cannot access or clear User B cart items @security @owasp-api1', async ({
    securityApi
  }) => {
    const userA = `user_a_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const userB = `user_b_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'Password123!';

    const regA = await securityApi.auth.register({ username: userA, password, fullName: 'User A' });
    const regB = await securityApi.auth.register({ username: userB, password, fullName: 'User B' });
    const tokenA = regA.data.token;
    const tokenB = regB.data.token;

    // User B adds item '1' to cart
    await securityApi.cart.add('1', { headers: { Authorization: `Bearer ${tokenB}` } });

    // User A inspects cart using Token A
    const cartA = await securityApi.cart.get({
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    expect(cartA.status).toBe(200);
    const cartAItems = Array.isArray(cartA.data) ? cartA.data : (cartA.data as any).items || [];
    expect(cartAItems.length).toBe(0);

    // User A attempts to clear cart — must not affect User B
    await securityApi.cart.clear({ headers: { Authorization: `Bearer ${tokenA}` } });

    // User B's cart must still have their item
    const cartB = await securityApi.cart.get({
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    expect(cartB.status).toBe(200);
    const cartBItems = Array.isArray(cartB.data) ? cartB.data : (cartB.data as any).items || [];
    expect(cartBItems.length).toBeGreaterThanOrEqual(1);
  });

  test('SEC-AUTHZ-04: Spoofing x-test-session-id to another user session does not leak data @security @owasp-api1', async ({
    securityApi
  }) => {
    const sessionB = `session-victim-${Date.now()}-${randomBytes(4).toString('hex')}`;
    const userB = `user_victim_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'Password123!';

    const regB = await securityApi.auth.register(
      { username: userB, password, fullName: 'Victim User' },
      { headers: { 'x-test-session-id': sessionB } }
    );
    const tokenB = regB.data.token;

    // User B adds item '2' to cart in sessionB
    await securityApi.cart.add('2', {
      headers: {
        Authorization: `Bearer ${tokenB}`,
        'x-test-session-id': sessionB
      }
    });

    // Attacker without tokenB attempts to access victim session cart
    const attackerRes = await securityApi.cart.get({
      headers: {
        'x-test-session-id': sessionB
      },
      expectStatus: [200, 401, 403]
    });

    // Without token, either 401/403 or unauthenticated session sandbox (cannot view authenticated victim items)
    if (attackerRes.status === 200) {
      const attackerItems = Array.isArray(attackerRes.data)
        ? attackerRes.data
        : (attackerRes.data as any).items || [];
      expect(attackerItems.length).toBe(0);
    } else {
      expect([401, 403]).toContain(attackerRes.status);
    }
  });

  test('SEC-AUTHZ-05: Mass assignment of administrative role during registration is rejected or ignored @security @owasp-api3', async ({
    securityApi
  }) => {
    const username = `priv_user_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'Password123!';

    // Attempt BOPLA / Mass Assignment attack injecting elevated role fields
    const regRes = await securityApi.auth.register({
      username,
      password,
      fullName: 'Privilege Escalation Tester',
      role: 'admin',
      isAdmin: true,
      permissions: ['*']
    } as any);

    expect(regRes.status).toBe(201);
    const token = regRes.data.token;

    // Verify user profile does not reflect admin role
    const profRes = await securityApi.profile.get({
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(profRes.status).toBe(200);

    const profileData = profRes.data as any;
    expect(profileData.role).not.toBe('admin');
    expect(profileData.isAdmin).not.toBe(true);
  });
});
