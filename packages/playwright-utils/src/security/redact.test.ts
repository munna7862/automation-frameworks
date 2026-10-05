import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SENSITIVE_HEADER_KEYS,
  SENSITIVE_BODY_KEYS,
  redactHeaders,
  redactBody,
  redactString
} from './redact';

describe('Security Redaction Utilities', () => {
  describe('Constants Verification', () => {
    it('should export expected sensitive header keys', () => {
      assert.ok(Array.isArray(SENSITIVE_HEADER_KEYS));
      assert.ok(SENSITIVE_HEADER_KEYS.includes('authorization'));
      assert.ok(SENSITIVE_HEADER_KEYS.includes('cookie'));
      assert.ok(SENSITIVE_HEADER_KEYS.includes('set-cookie'));
      assert.ok(SENSITIVE_HEADER_KEYS.includes('x-api-key'));
      assert.ok(SENSITIVE_HEADER_KEYS.includes('x-csrf-token'));
    });

    it('should export expected sensitive body keys', () => {
      assert.ok(Array.isArray(SENSITIVE_BODY_KEYS));
      assert.ok(SENSITIVE_BODY_KEYS.includes('password'));
      assert.ok(SENSITIVE_BODY_KEYS.includes('newPassword'));
      assert.ok(SENSITIVE_BODY_KEYS.includes('token'));
      assert.ok(SENSITIVE_BODY_KEYS.includes('accessToken'));
      assert.ok(SENSITIVE_BODY_KEYS.includes('refreshToken'));
      assert.ok(SENSITIVE_BODY_KEYS.includes('cardNumber'));
      assert.ok(SENSITIVE_BODY_KEYS.includes('cvv'));
      assert.ok(SENSITIVE_BODY_KEYS.includes('secret'));
    });
  });

  describe('redactString', () => {
    it('should mask Bearer tokens', () => {
      const input = 'Authorization: Bearer secret-token-value-12345';
      const actual = redactString(input);
      assert.equal(actual, 'Authorization: Bearer [REDACTED]');
    });

    it('should mask standard JWT tokens', () => {
      const fakeJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const input = `Received session token: ${fakeJwt} from auth`;
      const actual = redactString(input);
      assert.ok(!actual.includes(fakeJwt));
      assert.ok(actual.includes('[REDACTED_JWT]'));
    });

    it('should mask key=value credentials in query or form strings', () => {
      const input =
        'https://example.com/api?user=admin&password=SuperSecretPassword123!&token=xyz987';
      const actual = redactString(input);
      assert.equal(
        actual,
        'https://example.com/api?user=admin&password=[REDACTED]&token=[REDACTED]'
      );
    });

    it('should return non-string inputs unchanged', () => {
      assert.equal(redactString(123 as any), 123);
      assert.equal(redactString(null as any), null);
      assert.equal(redactString(undefined as any), undefined);
    });
  });

  describe('redactHeaders', () => {
    it('should redact sensitive headers case-insensitively', () => {
      const headers = {
        Authorization: 'Bearer my-token',
        COOKIE: 'sessionId=abc1234',
        'set-cookie': 'refreshToken=xyz987; Path=/',
        'X-API-KEY': 'super-secret-key',
        'x-csrf-token': 'csrf-token-abc',
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };

      const redacted = redactHeaders(headers);

      assert.equal(redacted['Authorization'], '[REDACTED]');
      assert.equal(redacted['COOKIE'], '[REDACTED]');
      assert.equal(redacted['set-cookie'], '[REDACTED]');
      assert.equal(redacted['X-API-KEY'], '[REDACTED]');
      assert.equal(redacted['x-csrf-token'], '[REDACTED]');
      assert.equal(redacted['Content-Type'], 'application/json');
      assert.equal(redacted['Accept'], 'application/json');
    });

    it('should not mutate the original headers object', () => {
      const original = { Authorization: 'Bearer secret', Host: 'localhost' };
      const originalCopy = { ...original };
      redactHeaders(original);
      assert.deepEqual(original, originalCopy);
    });

    it('should handle invalid or empty header inputs safely', () => {
      assert.deepEqual(redactHeaders(null as any), {});
      assert.deepEqual(redactHeaders(undefined as any), {});
      assert.deepEqual(redactHeaders({}), {});
    });
  });

  describe('redactBody', () => {
    it('should deeply redact nested objects with sensitive keys', () => {
      const body = {
        user: {
          username: 'john_doe',
          password: 'secretPassword123',
          profile: {
            fullName: 'John Doe',
            refreshToken: 'refresh-token-xyz'
          }
        },
        payment: {
          cardNumber: '4111222233334444',
          cvv: '123',
          amount: 59.99
        }
      };

      const redacted = redactBody(body) as any;

      assert.equal(redacted.user.username, 'john_doe');
      assert.equal(redacted.user.password, '[REDACTED]');
      assert.equal(redacted.user.profile.fullName, 'John Doe');
      assert.equal(redacted.user.profile.refreshToken, '[REDACTED]');
      assert.equal(redacted.payment.cardNumber, '[REDACTED]');
      assert.equal(redacted.payment.cvv, '[REDACTED]');
      assert.equal(redacted.payment.amount, 59.99);
    });

    it('should match sensitive keys case-insensitively with dashes or underscores', () => {
      const body = {
        PASSWORD: 'pass',
        new_password: 'new_pass',
        access_token: 'token123',
        CLIENT_SECRET: 'secret456',
        Card_Number: '1111222233334444'
      };

      const redacted = redactBody(body) as any;

      assert.equal(redacted.PASSWORD, '[REDACTED]');
      assert.equal(redacted.new_password, '[REDACTED]');
      assert.equal(redacted.access_token, '[REDACTED]');
      assert.equal(redacted.CLIENT_SECRET, '[REDACTED]');
      assert.equal(redacted.Card_Number, '[REDACTED]');
    });

    it('should deeply redact arrays of objects', () => {
      const body = [
        { id: 1, token: 'token-1', label: 'Item 1' },
        { id: 2, token: 'token-2', label: 'Item 2' }
      ];

      const redacted = redactBody(body) as any[];

      assert.equal(redacted.length, 2);
      assert.equal(redacted[0].id, 1);
      assert.equal(redacted[0].token, '[REDACTED]');
      assert.equal(redacted[0].label, 'Item 1');
      assert.equal(redacted[1].id, 2);
      assert.equal(redacted[1].token, '[REDACTED]');
    });

    it('should parse and redact JSON strings', () => {
      const jsonString = JSON.stringify({
        username: 'alice',
        password: 'alicePassword!',
        nested: { token: 'secret-token' }
      });

      const redacted = redactBody(jsonString) as string;
      const parsed = JSON.parse(redacted);

      assert.equal(parsed.username, 'alice');
      assert.equal(parsed.password, '[REDACTED]');
      assert.equal(parsed.nested.token, '[REDACTED]');
    });

    it('should redact URLSearchParams and url-encoded strings', () => {
      const formString = 'client_id=myApp&client_secret=superSecret123&scope=read';
      const redacted = redactBody(formString) as string;
      assert.ok(!redacted.includes('superSecret123'));
      assert.ok(
        redacted.includes('client_secret=%5BREDACTED%5D') ||
          redacted.includes('client_secret=[REDACTED]')
      );

      const params = new URLSearchParams({
        client_id: 'app1',
        client_secret: 'secretVal',
        grant_type: 'client_credentials'
      });
      const redactedParams = redactBody(params) as URLSearchParams;
      assert.equal(redactedParams.get('client_id'), 'app1');
      assert.equal(redactedParams.get('client_secret'), '[REDACTED]');
      assert.equal(redactedParams.get('grant_type'), 'client_credentials');
    });

    it('should handle circular references gracefully without stack overflow', () => {
      const circularObj: any = { name: 'circular', password: 'my-password' };
      circularObj.self = circularObj;

      const redacted = redactBody(circularObj) as any;
      assert.equal(redacted.name, 'circular');
      assert.equal(redacted.password, '[REDACTED]');
      assert.equal(redacted.self, '[CIRCULAR]');
    });

    it('should not mutate original inputs', () => {
      const original = {
        password: 'secret',
        details: { token: 'tok' }
      };
      const copy = JSON.parse(JSON.stringify(original));
      redactBody(original);
      assert.deepEqual(original, copy);
    });

    it('should preserve non-object primitives and null/undefined', () => {
      assert.equal(redactBody(null), null);
      assert.equal(redactBody(undefined), undefined);
      assert.equal(redactBody(42), 42);
      assert.equal(redactBody(true), true);
      assert.equal(redactBody(false), false);
    });
  });
});
