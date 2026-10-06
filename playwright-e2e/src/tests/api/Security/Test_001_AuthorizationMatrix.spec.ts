import { test, expect } from '../../../api/api.fixture';
import {
  createExpiredToken,
  createWrongSignatureToken,
  createMalformedToken
} from '@automationframeworks/test-data';
import { ApiErrorResponseSchema } from '../../../api/schemas';
import type { ApiClient } from '../../../api/clients';
import type { RequestOpts } from '../../../api/clients/base.client';

interface ProtectedEndpoint {
  name: string;
  call: (api: ApiClient, opts: RequestOpts) => Promise<any>;
}

const PROTECTED_ENDPOINTS: ProtectedEndpoint[] = [
  {
    name: 'GET /api/cart',
    call: (api, opts) => api.cart.get(opts)
  },
  {
    name: 'POST /api/cart',
    call: (api, opts) => api.cart.add('1', opts)
  },
  {
    name: 'DELETE /api/cart',
    call: (api, opts) => api.cart.clear(opts)
  },
  {
    name: 'DELETE /api/cart/:bookId',
    call: (api, opts) => api.cart.remove('1', opts)
  },
  {
    name: 'POST /api/checkout/process',
    call: (api, opts) =>
      api.checkout.process(
        {
          firstName: 'Security',
          lastName: 'User',
          creditCard: '4532111122223333'
        },
        opts
      )
  },
  {
    name: 'GET /api/orders',
    call: (api, opts) => api.orders.list(opts)
  },
  {
    name: 'GET /api/profile',
    call: (api, opts) => api.profile.get(opts)
  },
  {
    name: 'POST /api/profile/upload',
    call: (api, opts) =>
      api.profile.uploadAvatar(
        {
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: Buffer.from('mock-png-data')
        },
        opts
      )
  }
];

const TOKEN_STATES = ['none', 'malformed', 'expired', 'wrongSignature'] as const;

let authzCount = 0;

test.describe('API Authorization Matrix Suite', () => {
  for (const endpoint of PROTECTED_ENDPOINTS) {
    for (const tokenState of TOKEN_STATES) {
      authzCount++;
      const testId = `API_AUTHZ_${String(authzCount).padStart(2, '0')}`;
      // Backend contract:
      // - Missing token returns 401 Unauthorized ("Unauthorized: Token required")
      // - Invalid/expired/wrong-signature/malformed token returns 403 Forbidden ("Forbidden: Invalid token")
      const expectedStatus = tokenState === 'none' ? 401 : 403;

      test(`${testId}: ${endpoint.name} with ${tokenState} token -> ${expectedStatus} @regression @security`, async ({
        api
      }) => {
        let authHeaders: Record<string, string> = {};

        switch (tokenState) {
          case 'none':
            // Explicitly pass empty/no Authorization header
            authHeaders = { Authorization: '' };
            break;
          case 'malformed':
            authHeaders = { Authorization: `Bearer ${createMalformedToken()}` };
            break;
          case 'expired': {
            const expiredToken = await createExpiredToken('security_tester');
            authHeaders = { Authorization: `Bearer ${expiredToken}` };
            break;
          }
          case 'wrongSignature': {
            const wrongSigToken = await createWrongSignatureToken('security_tester');
            authHeaders = { Authorization: `Bearer ${wrongSigToken}` };
            break;
          }
        }

        const res = await endpoint.call(api, { headers: authHeaders });

        await expect(res).toHaveStatus(expectedStatus);
        await expect(res).toMatchSchema(ApiErrorResponseSchema);
        expect(res.body.error).toBeTruthy();
      });
    }
  }
});
