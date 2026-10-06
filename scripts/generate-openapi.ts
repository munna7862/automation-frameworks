#!/usr/bin/env tsx

/**
 * ============================================================================
 * BuggyBooks — OpenAPI 3.1 Specification Generator
 * ============================================================================
 *
 * Produces an enterprise-grade OpenAPI 3.1.0 specification (docs/api/openapi.yaml)
 * directly from the authoritative Zod schemas defined in playwright-e2e/src/api/schemas.
 *
 * Covers all 23 routed endpoints identified in docs/api/routes.json, including:
 *   - Authentication & Session Management
 *   - Books Catalog & Detail Views
 *   - Shopping Cart & Mutation
 *   - Order Processing & History
 *   - System Diagnostics, Health & Metrics
 *   - User Profile & Avatar Uploads
 *   - Chaos Engineering & Test-Control Harness
 *
 * Outputs:
 *   1. docs/api/openapi.yaml
 *   2. AutomationReports/API-Docs/index.html (Redoc standalone portal)
 *   3. docs/api/index.html (Repository-hosted documentation)
 *
 * Usage:
 *   npx tsx scripts/generate-openapi.ts
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import * as yaml from 'yaml';

// Extend Zod prototypes with OpenAPI metadata helpers
extendZodWithOpenApi(z);

// Import schemas from playwright-e2e
import {
  BookSchema as RawBookSchema,
  CartItemSchema as RawCartItemSchema,
  PaginatedBooksSchema as RawPaginatedBooksSchema
} from '../playwright-e2e/src/api/schemas/book.schema';
import {
  AuthTokensResponseSchema as RawAuthTokensResponseSchema,
  AuthUserSchema as RawAuthUserSchema,
  LogoutResponseSchema as RawLogoutResponseSchema
} from '../playwright-e2e/src/api/schemas/auth.schema';
import {
  CartSchema as RawCartSchema,
  CartClearResponseSchema as RawCartClearResponseSchema
} from '../playwright-e2e/src/api/schemas/cart.schema';
import {
  OrderSchema as RawOrderSchema,
  OrdersListSchema as RawOrdersListSchema,
  CheckoutResponseSchema as RawCheckoutResponseSchema
} from '../playwright-e2e/src/api/schemas/order.schema';
import {
  UserProfileSchema as RawUserProfileSchema,
  AvatarUploadResponseSchema as RawAvatarUploadResponseSchema
} from '../playwright-e2e/src/api/schemas/profile.schema';
import { InventoryReportSchema as RawInventoryReportSchema } from '../playwright-e2e/src/api/schemas/inventory.schema';
import {
  HealthSchema as RawHealthSchema,
  MetricsSchema as RawMetricsSchema,
  CsrfTokenSchema as RawCsrfTokenSchema
} from '../playwright-e2e/src/api/schemas/health.schema';
import {
  ApiErrorResponseSchema as RawApiErrorResponseSchema,
  ApiErrorDetailSchema as RawApiErrorDetailSchema
} from '../playwright-e2e/src/api/schemas/error.schema';
import {
  ChaosConfigSchema as RawChaosConfigSchema,
  TestConfigPostResponseSchema as RawTestConfigPostResponseSchema,
  TestResetResponseSchema as RawTestResetResponseSchema,
  TestSessionDeleteResponseSchema as RawTestSessionDeleteResponseSchema
} from '../playwright-e2e/src/api/schemas/test-control.schema';
import { BookstoreEventSchema as RawBookstoreEventSchema } from '../playwright-e2e/src/api/schemas/realtime.schema';

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_API_DIR = path.join(ROOT_DIR, 'docs', 'api');
const OPENAPI_YAML_PATH = path.join(DOCS_API_DIR, 'openapi.yaml');
const REPORTS_API_DIR = path.join(ROOT_DIR, 'AutomationReports', 'API-Docs');

const registry = new OpenAPIRegistry();

// ---------------------------------------------------------------------------
// 1. Register Component Schemas with Ref Metadata
// ---------------------------------------------------------------------------
const BookSchema = registry.register('Book', RawBookSchema.openapi('Book'));
const CartItemSchema = registry.register('CartItem', RawCartItemSchema.openapi('CartItem'));
const PaginatedBooksSchema = registry.register(
  'PaginatedBooks',
  RawPaginatedBooksSchema.openapi('PaginatedBooks')
);

const AuthTokensResponseSchema = registry.register(
  'AuthTokensResponse',
  RawAuthTokensResponseSchema.openapi('AuthTokensResponse')
);
const AuthUserSchema = registry.register('AuthUser', RawAuthUserSchema.openapi('AuthUser'));
const LogoutResponseSchema = registry.register(
  'LogoutResponse',
  RawLogoutResponseSchema.openapi('LogoutResponse')
);

const CartSchema = registry.register('Cart', RawCartSchema.openapi('Cart'));
const CartClearResponseSchema = registry.register(
  'CartClearResponse',
  RawCartClearResponseSchema.openapi('CartClearResponse')
);

const OrderSchema = registry.register('Order', RawOrderSchema.openapi('Order'));
const OrdersListSchema = registry.register('OrdersList', RawOrdersListSchema.openapi('OrdersList'));
const CheckoutResponseSchema = registry.register(
  'CheckoutResponse',
  RawCheckoutResponseSchema.openapi('CheckoutResponse')
);

const UserProfileSchema = registry.register(
  'UserProfile',
  RawUserProfileSchema.openapi('UserProfile')
);
const AvatarUploadResponseSchema = registry.register(
  'AvatarUploadResponse',
  RawAvatarUploadResponseSchema.openapi('AvatarUploadResponse')
);

const InventoryReportSchema = registry.register(
  'InventoryReport',
  RawInventoryReportSchema.openapi('InventoryReport')
);
const HealthSchema = registry.register('Health', RawHealthSchema.openapi('Health'));
const MetricsSchema = registry.register('Metrics', RawMetricsSchema.openapi('Metrics'));
const CsrfTokenSchema = registry.register('CsrfToken', RawCsrfTokenSchema.openapi('CsrfToken'));

const ApiErrorDetailSchema = registry.register(
  'ApiErrorDetail',
  RawApiErrorDetailSchema.openapi('ApiErrorDetail')
);
const ApiErrorResponseSchema = registry.register(
  'ApiErrorResponse',
  RawApiErrorResponseSchema.openapi('ApiErrorResponse')
);

const ChaosConfigSchema = registry.register(
  'ChaosConfig',
  RawChaosConfigSchema.openapi('ChaosConfig')
);
const TestConfigPostResponseSchema = registry.register(
  'TestConfigPostResponse',
  RawTestConfigPostResponseSchema.openapi('TestConfigPostResponse')
);
const TestResetResponseSchema = registry.register(
  'TestResetResponse',
  RawTestResetResponseSchema.openapi('TestResetResponse')
);
const TestSessionDeleteResponseSchema = registry.register(
  'TestSessionDeleteResponse',
  RawTestSessionDeleteResponseSchema.openapi('TestSessionDeleteResponse')
);
const BookstoreEventSchema = registry.register(
  'BookstoreEvent',
  RawBookstoreEventSchema.openapi('BookstoreEvent')
);

// Request Schemas
const RegisterRequestSchema = registry.register(
  'RegisterRequest',
  z
    .object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required'),
      fullName: z.string().optional()
    })
    .openapi('RegisterRequest')
);

const LoginRequestSchema = registry.register(
  'LoginRequest',
  z
    .object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required')
    })
    .openapi('LoginRequest')
);

const AddToCartRequestSchema = registry.register(
  'AddToCartRequest',
  z
    .object({
      bookId: z.string().min(1, 'Book ID is required'),
      quantity: z.number().int().positive().optional().default(1)
    })
    .openapi('AddToCartRequest')
);

const CheckoutRequestSchema = registry.register(
  'CheckoutRequest',
  z
    .object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      creditCard: z.string().min(13, 'Valid credit card number is required')
    })
    .openapi('CheckoutRequest')
);

const StockUpdateRequestSchema = registry.register(
  'StockUpdateRequest',
  z
    .object({
      stock: z.number().int().min(0, 'Stock cannot be negative')
    })
    .openapi('StockUpdateRequest')
);

// ---------------------------------------------------------------------------
// 2. Register Security Schemes
// ---------------------------------------------------------------------------
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT authorization bearer token in Authorization header'
});

registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'token',
  description: 'HttpOnly session token cookie set on login'
});

// Standard error responses helper
const commonErrorResponses = {
  400: {
    description: 'Bad Request — validation error or malformed body',
    content: {
      'application/json': {
        schema: ApiErrorResponseSchema
      }
    }
  },
  401: {
    description: 'Unauthorized — missing, invalid, or expired authentication token',
    content: {
      'application/json': {
        schema: ApiErrorResponseSchema
      }
    }
  },
  403: {
    description: 'Forbidden — insufficient privileges or CSRF token mismatch',
    content: {
      'application/json': {
        schema: ApiErrorResponseSchema
      }
    }
  },
  404: {
    description: 'Not Found — requested resource was not located',
    content: {
      'application/json': {
        schema: ApiErrorResponseSchema
      }
    }
  },
  500: {
    description: 'Internal Server Error — server-side unhandled exception or chaos injection',
    content: {
      'application/json': {
        schema: ApiErrorResponseSchema
      }
    }
  }
};

// ---------------------------------------------------------------------------
// 3. Register All 23 Routed API Endpoints
// ---------------------------------------------------------------------------

// 1. GET /api/books
registry.registerPath({
  method: 'get',
  path: '/api/books',
  operationId: 'listBooks',
  summary: 'List Books Catalog',
  description:
    'Retrieve books from catalog with support for pagination, search queries, and filtering.',
  tags: ['Books'],
  security: [],
  request: {
    query: z.object({
      search: z
        .string()
        .optional()
        .openapi({ description: 'Search term filtering by title or author' }),
      category: z.string().optional().openapi({ description: 'Filter books by genre/category' }),
      page: z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .openapi({ description: 'Page number for paginated results' }),
      limit: z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .openapi({ description: 'Number of items per page' })
    })
  },
  responses: {
    200: {
      description: 'List of books matching filter criteria',
      content: {
        'application/json': {
          schema: z.union([z.array(BookSchema), PaginatedBooksSchema])
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 2. GET /api/books/{id}
registry.registerPath({
  method: 'get',
  path: '/api/books/{id}',
  operationId: 'getBookById',
  summary: 'Get Book by ID',
  description: 'Retrieve detailed book information, price, author, reviews, and inventory status.',
  tags: ['Books'],
  security: [],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Unique book identifier (UUID or numeric ID)' })
    })
  },
  responses: {
    200: {
      description: 'Book details retrieved successfully',
      content: {
        'application/json': {
          schema: BookSchema
        }
      }
    },
    400: commonErrorResponses[400],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500]
  }
});

// 3. POST /api/register
registry.registerPath({
  method: 'post',
  path: '/api/register',
  operationId: 'registerUser',
  summary: 'Register New User',
  description: 'Create a new customer account with username and password credentials.',
  tags: ['Authentication'],
  security: [],
  request: {
    body: {
      description: 'User registration credentials',
      content: {
        'application/json': {
          schema: RegisterRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'User created successfully and authenticated session issued',
      content: {
        'application/json': {
          schema: AuthTokensResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    409: {
      description: 'Conflict — username already taken',
      content: {
        'application/json': {
          schema: ApiErrorResponseSchema
        }
      }
    },
    500: commonErrorResponses[500]
  }
});

// 4. POST /api/login
registry.registerPath({
  method: 'post',
  path: '/api/login',
  operationId: 'loginUser',
  summary: 'Authenticate User',
  description:
    'Authenticate user with username and password, issuing access JWT and refresh token.',
  tags: ['Authentication'],
  security: [],
  request: {
    body: {
      description: 'Login credentials',
      content: {
        'application/json': {
          schema: LoginRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Authentication successful with tokens and user record',
      content: {
        'application/json': {
          schema: AuthTokensResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500]
  }
});

// 5. POST /api/logout
registry.registerPath({
  method: 'post',
  path: '/api/logout',
  operationId: 'logoutUser',
  summary: 'Terminate User Session',
  description: 'Clear authentication session cookies and terminate user login session.',
  tags: ['Authentication'],
  security: [],
  responses: {
    200: {
      description: 'Session cleared successfully',
      content: {
        'application/json': {
          schema: LogoutResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 6. POST /api/auth/refresh
registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  operationId: 'refreshAuthToken',
  summary: 'Refresh Access Token',
  description: 'Exchange refresh token cookie for a new short-lived access JWT.',
  tags: ['Authentication'],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Access token renewed successfully',
      content: {
        'application/json': {
          schema: AuthTokensResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500]
  }
});

// 7. GET /api/cart
registry.registerPath({
  method: 'get',
  path: '/api/cart',
  operationId: 'getCart',
  summary: 'Retrieve User Shopping Cart',
  description: 'Get active items and total count in current user cart.',
  tags: ['Cart'],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'Shopping cart items array',
      content: {
        'application/json': {
          schema: CartSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500]
  }
});

// 8. POST /api/cart
registry.registerPath({
  method: 'post',
  path: '/api/cart',
  operationId: 'addToCart',
  summary: 'Add Item to Shopping Cart',
  description: 'Add a book item to user cart or increment quantity.',
  tags: ['Cart'],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    body: {
      description: 'Item to add to cart',
      content: {
        'application/json': {
          schema: AddToCartRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Updated shopping cart contents',
      content: {
        'application/json': {
          schema: CartSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500]
  }
});

// 9. DELETE /api/cart
registry.registerPath({
  method: 'delete',
  path: '/api/cart',
  operationId: 'clearCart',
  summary: 'Clear Entire Shopping Cart',
  description: 'Remove all items from current user shopping cart.',
  tags: ['Cart'],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'Cart emptied successfully',
      content: {
        'application/json': {
          schema: CartClearResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500]
  }
});

// 10. DELETE /api/cart/{bookId}
registry.registerPath({
  method: 'delete',
  path: '/api/cart/{bookId}',
  operationId: 'removeCartItem',
  summary: 'Remove Single Item from Cart',
  description: 'Remove a specific book item from the shopping cart by ID.',
  tags: ['Cart'],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    params: z.object({
      bookId: z.string().openapi({ description: 'Book ID to remove from cart' })
    })
  },
  responses: {
    200: {
      description: 'Updated shopping cart after item removal',
      content: {
        'application/json': {
          schema: CartSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500]
  }
});

// 11. POST /api/checkout/process
registry.registerPath({
  method: 'post',
  path: '/api/checkout/process',
  operationId: 'processCheckout',
  summary: 'Process Order Checkout',
  description: 'Submit order payment and delivery address to complete purchase.',
  tags: ['Orders'],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    body: {
      description: 'Order shipping and payment information',
      content: {
        'application/json': {
          schema: CheckoutRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Order processed successfully with confirmation order ID',
      content: {
        'application/json': {
          schema: CheckoutResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500]
  }
});

// 12. GET /api/orders
registry.registerPath({
  method: 'get',
  path: '/api/orders',
  operationId: 'listOrders',
  summary: 'List Customer Orders',
  description: 'Retrieve order history for the authenticated user.',
  tags: ['Orders'],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'List of historical customer orders',
      content: {
        'application/json': {
          schema: OrdersListSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500]
  }
});

// 13. GET /api/inventory/report
registry.registerPath({
  method: 'get',
  path: '/api/inventory/report',
  operationId: 'getInventoryReport',
  summary: 'Inventory Stock Report',
  description: 'Retrieve stock level aggregates, inventory valuations, and catalog count.',
  tags: ['Inventory'],
  security: [],
  responses: {
    200: {
      description: 'Inventory valuation and total stock report',
      content: {
        'application/json': {
          schema: InventoryReportSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 14. GET /api/health
registry.registerPath({
  method: 'get',
  path: '/api/health',
  operationId: 'getHealth',
  summary: 'Server Health Check',
  description: 'Diagnostic probe verifying server runtime status, uptime, and memory usage.',
  tags: ['System'],
  security: [],
  responses: {
    200: {
      description: 'Server health status report',
      content: {
        'application/json': {
          schema: HealthSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 15. GET /api/metrics
registry.registerPath({
  method: 'get',
  path: '/api/metrics',
  operationId: 'getMetrics',
  summary: 'System Telemetry & Metrics',
  description: 'Runtime telemetry including process uptime, event loop metrics, and heap usage.',
  tags: ['System'],
  security: [],
  responses: {
    200: {
      description: 'Runtime system telemetry metrics',
      content: {
        'application/json': {
          schema: MetricsSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 16. GET /api/profile
registry.registerPath({
  method: 'get',
  path: '/api/profile',
  operationId: 'getUserProfile',
  summary: 'Get User Profile',
  description: 'Retrieve authenticated customer profile details, username, and avatar URL.',
  tags: ['Profile'],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  responses: {
    200: {
      description: 'User profile details',
      content: {
        'application/json': {
          schema: UserProfileSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500]
  }
});

// 17. POST /api/profile/upload
registry.registerPath({
  method: 'post',
  path: '/api/profile/upload',
  operationId: 'uploadUserAvatar',
  summary: 'Upload User Avatar',
  description: 'Upload a picture file to update the authenticated user avatar.',
  tags: ['Profile'],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  request: {
    body: {
      description: 'Avatar image upload multipart payload',
      content: {
        'multipart/form-data': {
          schema: z.object({
            avatar: z
              .any()
              .openapi({ type: 'string', format: 'binary', description: 'Avatar image file' })
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Avatar image uploaded and profile updated',
      content: {
        'application/json': {
          schema: AvatarUploadResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500]
  }
});

// 18. GET /api/csrf-token
registry.registerPath({
  method: 'get',
  path: '/api/csrf-token',
  operationId: 'getCsrfToken',
  summary: 'Fetch CSRF Token',
  description: 'Issue CSRF protection token and set psifi.x-csrf-token cookie.',
  tags: ['System'],
  security: [],
  responses: {
    200: {
      description: 'CSRF token payload',
      content: {
        'application/json': {
          schema: CsrfTokenSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 19. GET /api/test/config
registry.registerPath({
  method: 'get',
  path: '/api/test/config',
  operationId: 'getTestConfig',
  summary: 'Get Chaos Test Configuration',
  description: 'Read active chaos injection parameters (checkout failure rate, delays, drop rate).',
  tags: ['Test Control & Chaos'],
  security: [],
  responses: {
    200: {
      description: 'Active chaos configuration',
      content: {
        'application/json': {
          schema: ChaosConfigSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 20. POST /api/test/config
registry.registerPath({
  method: 'post',
  path: '/api/test/config',
  operationId: 'updateTestConfig',
  summary: 'Update Chaos Test Configuration',
  description: 'Modify active chaos injection parameters to simulate faults during testing.',
  tags: ['Test Control & Chaos'],
  security: [],
  request: {
    body: {
      description: 'Updated chaos parameters',
      content: {
        'application/json': {
          schema: RawChaosConfigSchema.partial()
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Chaos configuration updated successfully',
      content: {
        'application/json': {
          schema: TestConfigPostResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 21. POST /api/test/reset
registry.registerPath({
  method: 'post',
  path: '/api/test/reset',
  operationId: 'resetTestState',
  summary: 'Reset Test State',
  description: 'Restore seed database state, flush active sessions, and reset chaos knobs to 0.',
  tags: ['Test Control & Chaos'],
  security: [],
  responses: {
    200: {
      description: 'Application state reset successfully',
      content: {
        'application/json': {
          schema: TestResetResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// 22. POST /api/test/books/{id}/stock
registry.registerPath({
  method: 'post',
  path: '/api/test/books/{id}/stock',
  operationId: 'updateBookStock',
  summary: 'Set Book Stock in Test Mode',
  description: 'Directly set inventory stock count for a book to test out-of-stock scenarios.',
  tags: ['Test Control & Chaos'],
  security: [],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Book ID to update stock' })
    }),
    body: {
      description: 'Stock quantity update payload',
      content: {
        'application/json': {
          schema: StockUpdateRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Stock updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            stock: z.number()
          })
        }
      }
    },
    400: commonErrorResponses[400],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500]
  }
});

// 23. DELETE /api/test/session/{id}
registry.registerPath({
  method: 'delete',
  path: '/api/test/session/{id}',
  operationId: 'deleteTestSession',
  summary: 'Delete Test Session Store',
  description: 'Purge ephemeral isolated test session data store.',
  tags: ['Test Control & Chaos'],
  security: [],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Test session identifier' })
    })
  },
  responses: {
    200: {
      description: 'Test session purged successfully',
      content: {
        'application/json': {
          schema: TestSessionDeleteResponseSchema
        }
      }
    },
    400: commonErrorResponses[400],
    500: commonErrorResponses[500]
  }
});

// ---------------------------------------------------------------------------
// 4. Generate OpenAPI 3.1.0 Document
// ---------------------------------------------------------------------------
console.log('='.repeat(78));
console.log('🚀 Generating BuggyBooks OpenAPI 3.1.0 Specification from Zod Schemas');
console.log('='.repeat(78));

const generator = new OpenApiGeneratorV31(registry.definitions);

const openApiDocument = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'BuggyBooks REST API',
    version: '1.0.0',
    description:
      'Enterprise REST API specification for BuggyBooks — an e-commerce book catalog featuring deliberate chaos injection endpoints for Software Quality Engineering.',
    contact: {
      name: 'BuggyBooks SQE Automation Team',
      url: 'https://github.com/munna7862/automation-frameworks'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Ephemeral Docker / Local Development Environment (ENV=DOCKER)'
    },
    {
      url: 'https://buggy-books.onrender.com',
      description: 'Shared Staging Environment (ENV=STAGING)'
    }
  ],
  tags: [
    {
      name: 'Books',
      description: 'Catalog discovery, pagination, search, and book detail inspection'
    },
    { name: 'Authentication', description: 'User registration, login, logout, and token renewal' },
    { name: 'Cart', description: 'Shopping cart manipulation, item additions, and clearing' },
    { name: 'Orders', description: 'Order checkout processing and customer order history' },
    { name: 'Inventory', description: 'Stock availability reports and valuations' },
    { name: 'Profile', description: 'Customer profiles and avatar asset uploads' },
    { name: 'System', description: 'Health checks, telemetry metrics, and CSRF protection' },
    {
      name: 'Test Control & Chaos',
      description: 'Chaos fault injection and state reset test harness'
    }
  ]
});

// Ensure target directories exist
if (!fs.existsSync(DOCS_API_DIR)) {
  fs.mkdirSync(DOCS_API_DIR, { recursive: true });
}
if (!fs.existsSync(REPORTS_API_DIR)) {
  fs.mkdirSync(REPORTS_API_DIR, { recursive: true });
}

// Convert Document to YAML string
const yamlContent = yaml.stringify(openApiDocument);

// Write YAML file
fs.writeFileSync(OPENAPI_YAML_PATH, yamlContent, 'utf8');
console.log(`✅ OpenAPI 3.1.0 spec written to: ${path.relative(ROOT_DIR, OPENAPI_YAML_PATH)}`);

// ---------------------------------------------------------------------------
// 5. Generate Standalone HTML Documentation via Redoc CLI
// ---------------------------------------------------------------------------
const redocOutputPath = path.join(REPORTS_API_DIR, 'index.html');
const docsHtmlPath = path.join(DOCS_API_DIR, 'index.html');

console.log('📚 Building standalone Redoc documentation...');
try {
  execSync(
    `npx @redocly/cli build-docs "${OPENAPI_YAML_PATH}" -o "${redocOutputPath}" --title "BuggyBooks API Documentation"`,
    { stdio: 'inherit', cwd: ROOT_DIR }
  );
  console.log(
    `✅ Redoc portal documentation created at: ${path.relative(ROOT_DIR, redocOutputPath)}`
  );

  // Copy to docs/api/index.html for repository documentation browsing
  fs.copyFileSync(redocOutputPath, docsHtmlPath);
  console.log(`✅ Repository documentation copied to: ${path.relative(ROOT_DIR, docsHtmlPath)}`);
} catch (err) {
  console.warn(`⚠️ Warning: Failed to build standalone Redoc docs: ${(err as Error).message}`);
}

console.log('='.repeat(78));
console.log('✨ OpenAPI specification generation complete!');
