import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  setSeed,
  resetSeed,
  getSeed,
  faker,
  UserFactory,
  CheckoutDetailsFactory,
  UserBuilder,
  CleanupRegistry,
  ApiSeeder,
  HttpLike,
  HttpResponse,
  TEST_CARD_NUMBERS,
  KNOWN_BOOK_IDS,
  INVALID_INPUTS,
  validateEnvConfig,
  EnvConfigValidationError,
  createExpiredToken,
  createWrongSignatureToken,
  createMalformedToken,
  createValidToken,
  createNoneAlgorithmToken,
  createKidTamperedToken,
  createTamperedPayloadToken
} from './index';

describe('@automationframeworks/test-data Package Unit Tests', () => {
  describe('Seedable Faker & Deterministic Replay', () => {
    it('should set and retrieve active seed', () => {
      setSeed(12345);
      assert.strictEqual(getSeed(), 12345);
      const val1 = faker.string.alphanumeric(8);

      // Re-seed with same seed
      setSeed(12345);
      const val2 = faker.string.alphanumeric(8);
      assert.strictEqual(val1, val2, 'Seeded faker must generate deterministic values');

      resetSeed();
      assert.strictEqual(getSeed(), undefined);
    });
  });

  describe('UserFactory & UserBuilder', () => {
    it('should generate valid UserData complying with policies', () => {
      const user = UserFactory.build();
      assert.ok(user.username.length > 0);
      assert.ok(user.username.length <= 30, 'Username must not exceed 30 characters');
      assert.ok(user.password.length >= 8, 'Password must be >= 8 characters');
      assert.ok(/[A-Z]/.test(user.password), 'Password must have uppercase');
      assert.ok(/[0-9]/.test(user.password), 'Password must have numeric');
      assert.ok(user.fullName.length > 0);
      assert.ok(user.email.includes('@buggybooks.internal'));
    });

    it('should generate unique users across multiple calls', () => {
      resetSeed();
      const users = UserFactory.buildList(10);
      const usernames = new Set(users.map((u) => u.username));
      assert.strictEqual(usernames.size, 10, 'All 10 generated usernames must be distinct');
    });

    it('should support overrides in UserFactory', () => {
      const user = UserFactory.build({
        username: 'custom_user_99',
        password: 'CustomPassword123!'
      });
      assert.strictEqual(user.username, 'custom_user_99');
      assert.strictEqual(user.password, 'CustomPassword123!');
    });

    it('should build user with cart items using UserBuilder', () => {
      const userWithCart = new UserBuilder()
        .withFullName('Builder Test User')
        .addCartItem('1', 2)
        .addCartItem('2', 1)
        .build();

      assert.strictEqual(userWithCart.fullName, 'Builder Test User');
      assert.strictEqual(userWithCart.cart.length, 2);
      assert.strictEqual(userWithCart.cart[0].bookId, '1');
      assert.strictEqual(userWithCart.cart[0].qty, 2);
      assert.strictEqual(userWithCart.cart[1].bookId, '2');
      assert.strictEqual(userWithCart.cart[1].qty, 1);
    });
  });

  describe('CheckoutDetailsFactory & Shared Constants', () => {
    it('should generate checkout details with synthetic test card numbers only', () => {
      const checkout = CheckoutDetailsFactory.build();
      assert.strictEqual(checkout.creditCard, TEST_CARD_NUMBERS.VALID_VISA);
      assert.strictEqual(checkout.cardNumber, TEST_CARD_NUMBERS.VALID_VISA);
      assert.strictEqual(checkout.shippingAddress, '123 Buggy Lane');
      assert.strictEqual(checkout.city, 'Stack City');
    });

    it('should build invalid checkout details for negative testing', () => {
      const invalidCheckout = CheckoutDetailsFactory.buildInvalid();
      assert.strictEqual(invalidCheckout.creditCard, TEST_CARD_NUMBERS.INVALID_NUMBER);
    });

    it('should export all known constants and invalid inputs', () => {
      assert.ok(KNOWN_BOOK_IDS.length === 15);
      assert.strictEqual(INVALID_INPUTS.SQL_INJECTION, "' OR '1'='1' --");
      assert.ok(INVALID_INPUTS.XSS_SCRIPT.includes('<script>'));
      assert.strictEqual(INVALID_INPUTS.OVERSIZE_500.length, 500);
    });
  });

  describe('CleanupRegistry', () => {
    it('should execute registered tasks in LIFO order', async () => {
      const order: number[] = [];
      const registry = new CleanupRegistry();

      registry.register(() => {
        order.push(1);
      });
      registry.register(() => {
        order.push(2);
      });
      registry.register(() => {
        order.push(3);
      });

      assert.strictEqual(registry.count, 3);
      await registry.executeAll();

      assert.deepStrictEqual(order, [3, 2, 1], 'Cleanup tasks must run in LIFO order');
      assert.strictEqual(registry.count, 0);
    });

    it('should contain errors and continue executing remaining tasks', async () => {
      const executed: number[] = [];
      const warnings: string[] = [];
      const registry = new CleanupRegistry((msg) => warnings.push(msg));

      registry.register(() => {
        executed.push(1);
      });
      registry.register(() => {
        throw new Error('Teardown task 2 exploded');
      });
      registry.register(() => {
        executed.push(3);
      });

      const errors = await registry.executeAll();

      assert.strictEqual(errors.length, 1);
      assert.deepStrictEqual(executed, [3, 1], 'Tasks before and after failure must execute');
      assert.strictEqual(warnings.length, 1);
      assert.ok(warnings[0].includes('Teardown task 2 exploded'));
    });
  });

  describe('ApiSeeder With Mock HttpLike', () => {
    it('should coordinate createUser, login, addToCart, placeOrder, and setStock', async () => {
      const callLog: string[] = [];
      const mockHttp: HttpLike = {
        async get<T>(url: string): Promise<HttpResponse<T>> {
          callLog.push(`GET ${url}`);
          return { status: 200, ok: true, data: {} as T, headers: {} };
        },
        async post<T>(url: string, data?: any): Promise<HttpResponse<T>> {
          callLog.push(`POST ${url}`);
          if (url === '/api/login') {
            return {
              status: 200,
              ok: true,
              data: { token: 'mock-jwt-token' } as T,
              headers: { 'set-cookie': 'session_id=12345' }
            };
          }
          return { status: 200, ok: true, data: { success: true, ...data } as T, headers: {} };
        },
        async put<T>(url: string, data?: any): Promise<HttpResponse<T>> {
          callLog.push(`PUT ${url}`);
          return { status: 200, ok: true, data: data as T, headers: {} };
        },
        async delete<T>(url: string): Promise<HttpResponse<T>> {
          callLog.push(`DELETE ${url}`);
          return { status: 200, ok: true, data: {} as T, headers: {} };
        }
      };

      const seeder = new ApiSeeder(mockHttp);
      const { user } = await seeder.createUser({ username: 'seeder_test_user' });
      assert.strictEqual(user.username, 'seeder_test_user');

      const session = await seeder.login(user);
      assert.strictEqual(session.token, 'mock-jwt-token');
      assert.strictEqual(session.headers['Authorization'], 'Bearer mock-jwt-token');

      await seeder.addToCart(session, [{ bookId: '1', qty: 2 }]);
      const { order } = await seeder.placeOrder(session);
      assert.strictEqual(order.creditCard, TEST_CARD_NUMBERS.VALID_VISA);

      await seeder.setStock('1', 50);

      assert.deepStrictEqual(callLog, [
        'POST /api/register',
        'POST /api/login',
        'POST /api/cart',
        'POST /api/cart',
        'POST /api/checkout/process',
        'POST /api/test/config'
      ]);
    });
  });

  describe('Typed Zod Configuration & Fast Fail', () => {
    it('should validate valid DOCKER environment configuration', () => {
      const config = validateEnvConfig(
        {
          TARGET_ENV: 'DOCKER',
          BASE_URL: 'http://localhost:5173',
          API_BASE_URL: 'http://localhost:4000'
        },
        { exitOnError: false }
      );

      assert.strictEqual(config.ENV, 'DOCKER');
      assert.strictEqual(config.baseUrl, 'http://localhost:5173');
      assert.strictEqual(config.apiBaseUrl, 'http://localhost:4000');
    });

    it('should fail fast on invalid ENV=BOGUS with readable error', () => {
      assert.throws(
        () => {
          validateEnvConfig(
            {
              ENV: 'BOGUS',
              BASE_URL: 'http://localhost:5173',
              API_BASE_URL: 'http://localhost:4000'
            },
            { exitOnError: false }
          );
        },
        (err: any) => {
          assert.ok(err instanceof EnvConfigValidationError);
          assert.ok(err.message.includes("Invalid environment 'BOGUS'"));
          return true;
        }
      );
    });

    it('should require credentials when targeting ENV=STAGING without defaults', () => {
      assert.throws(
        () => {
          validateEnvConfig(
            {
              ENV: 'STAGING',
              E2E_USER_NAME: '',
              USER_NAME: '',
              E2E_USER_PASSWORD: '',
              PASSWORD: ''
            },
            { exitOnError: false }
          );
        },
        (err: any) => {
          assert.ok(err instanceof EnvConfigValidationError);
          assert.ok(err.message.includes('required when targeting ENV=STAGING'));
          return true;
        }
      );
    });
  });

  describe('JWT Token Helpers', () => {
    it('should generate expired, wrong-signature, and malformed tokens', async () => {
      const expired = await createExpiredToken('alice');
      assert.ok(typeof expired === 'string' && expired.split('.').length === 3);

      const wrongSig = await createWrongSignatureToken('bob');
      assert.ok(typeof wrongSig === 'string' && wrongSig.split('.').length === 3);

      const malformed = createMalformedToken();
      assert.ok(typeof malformed === 'string' && malformed.includes('corrupted_payload'));

      const valid = await createValidToken('carol');
      assert.ok(typeof valid === 'string' && valid.split('.').length === 3);

      const noneAlg = createNoneAlgorithmToken('dave');
      assert.ok(typeof noneAlg === 'string' && noneAlg.endsWith('.'));

      const kidTampered = await createKidTamperedToken('eve');
      assert.ok(typeof kidTampered === 'string' && kidTampered.split('.').length === 3);

      const tamperedPayload = createTamperedPayloadToken(valid, { username: 'mallory' });
      assert.ok(typeof tamperedPayload === 'string' && tamperedPayload.split('.').length === 3);
    });
  });
});
