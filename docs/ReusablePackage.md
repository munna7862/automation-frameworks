# Reusable Shared Packages Architecture

This document details the shared, reusable packages architected within the `AutomationFrameworks` monorepo:
1. **`@automationframeworks/playwright-utils`**: Base page objects, Winston logger, and test utilities.
2. **`@automationframeworks/test-data`**: Test data factories, builders, API seeders, cleanup registry, and typed Zod configuration.

---

## 1. `@automationframeworks/test-data` Package

The `@automationframeworks/test-data` workspace provides unified test data generation and state management across all test automation frameworks (Playwright, Selenium, WDIO, k6, and JMeter).

### 📁 Directory Layout

```
packages/test-data/
├── src/
│   ├── index.ts                     # Main barrel export
│   ├── faker/
│   │   └── seedable-faker.ts        # Seedable Faker instance (TEST_DATA_SEED)
│   ├── constants/
│   │   ├── test-cards.ts            # Synthetic test card numbers
│   │   ├── book-ids.ts              # Catalog book IDs ('1' through '15')
│   │   ├── invalid-inputs.ts        # Security, fuzz, and edge-case attack strings
│   │   └── index.ts
│   ├── factories/
│   │   ├── user.factory.ts          # Parallel-safe unique user generator
│   │   ├── checkout.factory.ts      # Synthetic checkout details generator
│   │   └── index.ts
│   ├── builders/
│   │   ├── user.builder.ts          # Fluent UserBuilder with cart seeding
│   │   └── index.ts
│   ├── seed/
│   │   ├── http-like.ts             # Framework-agnostic HttpLike abstraction & adapters
│   │   ├── cleanup-registry.ts      # LIFO teardown executor with non-blocking error handling
│   │   ├── api-seeder.ts            # Stateful API seeder (register, login, cart, order, stock)
│   │   └── index.ts
│   └── config/
│       ├── schema.ts                # Zod schema for typed envConfig & fast-fail validator
│       └── index.ts
├── scripts/
│   └── generate-perf-datasets.ts    # Perf datasets generator (JMeter CSV + k6 JSON)
├── package.json
└── tsconfig.json
```

---

### 🔑 Core Features & Capabilities

#### 1. Seedable Faker (`TEST_DATA_SEED`)
Enables deterministic, reproducible test execution across CI/CD and local development:
```typescript
import { setSeed, resetSeed, getSeed, faker } from '@automationframeworks/test-data';

// Set seed explicitly or via process.env.TEST_DATA_SEED
setSeed(42);
console.log(faker.person.fullName()); // Deterministic output
```

#### 2. Factories & Builders
- **`UserFactory.build(overrides?)`**: Produces policy-compliant (`>= 8 chars`, uppercase, lowercase, numbers, special characters), worker-isolated usernames:
  ```typescript
  import { UserFactory } from '@automationframeworks/test-data';

  const user = UserFactory.build({ fullName: 'Checkout Test User' });
  // Output: { username: 'checkout_w0_muw2...', password: 'Password123!', fullName: '...', email: '...' }
  ```
- **`CheckoutDetailsFactory.build(overrides?)`**: Guaranteed synthetic data utilizing test card numbers only (`TEST_CARD_NUMBERS.VALID_VISA`):
  ```typescript
  import { CheckoutDetailsFactory } from '@automationframeworks/test-data';

  const checkout = CheckoutDetailsFactory.build();
  ```
- **`UserBuilder`**: Fluent builder pattern for constructing composite user and cart states:
  ```typescript
  import { UserBuilder } from '@automationframeworks/test-data';

  const userWithCart = new UserBuilder()
    .withFullName('Custom Order Buyer')
    .addCartItem('1', 2)
    .addCartItem('3', 1)
    .build();
  ```

#### 3. Shared Constants
Centralized references for test cards, catalog items, and security fuzzing payloads:
```typescript
import { TEST_CARD_NUMBERS, KNOWN_BOOK_IDS, INVALID_INPUTS } from '@automationframeworks/test-data';

console.log(TEST_CARD_NUMBERS.VALID_VISA);     // '4532111122223333'
console.log(INVALID_INPUTS.SQL_INJECTION);      // "' OR '1'='1' --"
console.log(INVALID_INPUTS.XSS_SCRIPT);         // "<script>alert('xss')</script>"
```

#### 4. API Seeder & Cleanup Registry
Stateful API orchestration that prepares test data via backend REST endpoints in milliseconds:
- **`HttpLike` Adapters**: Works seamlessly with Playwright (`createPlaywrightAdapter`), Axios (`createAxiosAdapter`), and native Fetch.
- **`CleanupRegistry`**: LIFO (Last-In, First-Out) execution at teardown. Non-blocking error handling ensures cleanup failures never mask underlying test assertion failures.
- **`data.fixture.ts`**: Playwright fixture integration exposing `seed` and `cleanup` directly in tests:
  ```typescript
  import { test, expect } from '../../../core/base/api.fixture';

  test('API Order Placement', async ({ seed }) => {
    const authSession = await seed.createAndLoginUser({ fullName: 'API Orders User' });
    await seed.addToCart(authSession, '2');
    const { order, response } = await seed.placeOrder(authSession);
    expect(response.status).toBe(200);
  });
  ```

#### 5. Typed, Validated Configuration (`zod`)
Enforces strict runtime validation for `env.config.ts` across Playwright, Selenium, and WDIO:
- Supported environments: `DOCKER | STAGING | INTEROP`.
- URL validation with `.url()`.
- Fast fail gate: On invalid configuration (e.g. `ENV=BOGUS`), exits immediately with exit code 1 before launching test runners, displaying a formatted error summary.

#### 6. Synchronized Performance Datasets
Generates identical, seeded performance datasets for JMeter and k6 from the single source of truth:
```bash
npm run data:perf
```
Outputs:
- `jmeter/TestData/users.csv`
- `k6-performance/data/users.json`

---

## 2. `@automationframeworks/playwright-utils` Package

The `@automationframeworks/playwright-utils` workspace provides base abstractions and logging for UI test suites.

### Core Modules
- **`BasePage`**: Unified browser element interactions with retry and diagnostic logging.
- **`CommonFunctions`**: Diagnostic assertion engine with structured difference logging.
- **`Logger`**: Winston-based logging resolved to active runtime workspace.
- **`redactBody`**: Redaction utilities for sensitive authorization headers and credentials.

---

## 3. Monorepo Consumption & Build Lifecycle

In accordance with root `package.json` workspaces configuration, packages are linked locally via npm workspaces:
```bash
# Build test-data package
npm run build --workspace=packages/test-data

# Run test-data unit tests
npx tsx --test packages/test-data/src/test-data.test.ts

# Typecheck all packages and frameworks
npm run typecheck:all

# Lint all workspaces
npm run lint:all
```
