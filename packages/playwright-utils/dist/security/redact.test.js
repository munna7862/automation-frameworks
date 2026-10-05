"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const redact_1 = require("./redact");
(0, node_test_1.describe)('Security Redaction Utilities', () => {
    (0, node_test_1.describe)('Constants Verification', () => {
        (0, node_test_1.it)('should export expected sensitive header keys', () => {
            strict_1.default.ok(Array.isArray(redact_1.SENSITIVE_HEADER_KEYS));
            strict_1.default.ok(redact_1.SENSITIVE_HEADER_KEYS.includes('authorization'));
            strict_1.default.ok(redact_1.SENSITIVE_HEADER_KEYS.includes('cookie'));
            strict_1.default.ok(redact_1.SENSITIVE_HEADER_KEYS.includes('set-cookie'));
            strict_1.default.ok(redact_1.SENSITIVE_HEADER_KEYS.includes('x-api-key'));
            strict_1.default.ok(redact_1.SENSITIVE_HEADER_KEYS.includes('x-csrf-token'));
        });
        (0, node_test_1.it)('should export expected sensitive body keys', () => {
            strict_1.default.ok(Array.isArray(redact_1.SENSITIVE_BODY_KEYS));
            strict_1.default.ok(redact_1.SENSITIVE_BODY_KEYS.includes('password'));
            strict_1.default.ok(redact_1.SENSITIVE_BODY_KEYS.includes('newPassword'));
            strict_1.default.ok(redact_1.SENSITIVE_BODY_KEYS.includes('token'));
            strict_1.default.ok(redact_1.SENSITIVE_BODY_KEYS.includes('accessToken'));
            strict_1.default.ok(redact_1.SENSITIVE_BODY_KEYS.includes('refreshToken'));
            strict_1.default.ok(redact_1.SENSITIVE_BODY_KEYS.includes('cardNumber'));
            strict_1.default.ok(redact_1.SENSITIVE_BODY_KEYS.includes('cvv'));
            strict_1.default.ok(redact_1.SENSITIVE_BODY_KEYS.includes('secret'));
        });
    });
    (0, node_test_1.describe)('redactString', () => {
        (0, node_test_1.it)('should mask Bearer tokens', () => {
            const input = 'Authorization: Bearer secret-token-value-12345';
            const actual = (0, redact_1.redactString)(input);
            strict_1.default.equal(actual, 'Authorization: Bearer [REDACTED]');
        });
        (0, node_test_1.it)('should mask standard JWT tokens', () => {
            const fakeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            const input = `Received session token: ${fakeJwt} from auth`;
            const actual = (0, redact_1.redactString)(input);
            strict_1.default.ok(!actual.includes(fakeJwt));
            strict_1.default.ok(actual.includes('[REDACTED_JWT]'));
        });
        (0, node_test_1.it)('should mask key=value credentials in query or form strings', () => {
            const input = 'https://example.com/api?user=admin&password=SuperSecretPassword123!&token=xyz987';
            const actual = (0, redact_1.redactString)(input);
            strict_1.default.equal(actual, 'https://example.com/api?user=admin&password=[REDACTED]&token=[REDACTED]');
        });
        (0, node_test_1.it)('should return non-string inputs unchanged', () => {
            strict_1.default.equal((0, redact_1.redactString)(123), 123);
            strict_1.default.equal((0, redact_1.redactString)(null), null);
            strict_1.default.equal((0, redact_1.redactString)(undefined), undefined);
        });
    });
    (0, node_test_1.describe)('redactHeaders', () => {
        (0, node_test_1.it)('should redact sensitive headers case-insensitively', () => {
            const headers = {
                'Authorization': 'Bearer my-token',
                'COOKIE': 'sessionId=abc1234',
                'set-cookie': 'refreshToken=xyz987; Path=/',
                'X-API-KEY': 'super-secret-key',
                'x-csrf-token': 'csrf-token-abc',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            const redacted = (0, redact_1.redactHeaders)(headers);
            strict_1.default.equal(redacted['Authorization'], '[REDACTED]');
            strict_1.default.equal(redacted['COOKIE'], '[REDACTED]');
            strict_1.default.equal(redacted['set-cookie'], '[REDACTED]');
            strict_1.default.equal(redacted['X-API-KEY'], '[REDACTED]');
            strict_1.default.equal(redacted['x-csrf-token'], '[REDACTED]');
            strict_1.default.equal(redacted['Content-Type'], 'application/json');
            strict_1.default.equal(redacted['Accept'], 'application/json');
        });
        (0, node_test_1.it)('should not mutate the original headers object', () => {
            const original = { 'Authorization': 'Bearer secret', 'Host': 'localhost' };
            const originalCopy = { ...original };
            (0, redact_1.redactHeaders)(original);
            strict_1.default.deepEqual(original, originalCopy);
        });
        (0, node_test_1.it)('should handle invalid or empty header inputs safely', () => {
            strict_1.default.deepEqual((0, redact_1.redactHeaders)(null), {});
            strict_1.default.deepEqual((0, redact_1.redactHeaders)(undefined), {});
            strict_1.default.deepEqual((0, redact_1.redactHeaders)({}), {});
        });
    });
    (0, node_test_1.describe)('redactBody', () => {
        (0, node_test_1.it)('should deeply redact nested objects with sensitive keys', () => {
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
            const redacted = (0, redact_1.redactBody)(body);
            strict_1.default.equal(redacted.user.username, 'john_doe');
            strict_1.default.equal(redacted.user.password, '[REDACTED]');
            strict_1.default.equal(redacted.user.profile.fullName, 'John Doe');
            strict_1.default.equal(redacted.user.profile.refreshToken, '[REDACTED]');
            strict_1.default.equal(redacted.payment.cardNumber, '[REDACTED]');
            strict_1.default.equal(redacted.payment.cvv, '[REDACTED]');
            strict_1.default.equal(redacted.payment.amount, 59.99);
        });
        (0, node_test_1.it)('should match sensitive keys case-insensitively with dashes or underscores', () => {
            const body = {
                PASSWORD: 'pass',
                new_password: 'new_pass',
                access_token: 'token123',
                CLIENT_SECRET: 'secret456',
                Card_Number: '1111222233334444'
            };
            const redacted = (0, redact_1.redactBody)(body);
            strict_1.default.equal(redacted.PASSWORD, '[REDACTED]');
            strict_1.default.equal(redacted.new_password, '[REDACTED]');
            strict_1.default.equal(redacted.access_token, '[REDACTED]');
            strict_1.default.equal(redacted.CLIENT_SECRET, '[REDACTED]');
            strict_1.default.equal(redacted.Card_Number, '[REDACTED]');
        });
        (0, node_test_1.it)('should deeply redact arrays of objects', () => {
            const body = [
                { id: 1, token: 'token-1', label: 'Item 1' },
                { id: 2, token: 'token-2', label: 'Item 2' }
            ];
            const redacted = (0, redact_1.redactBody)(body);
            strict_1.default.equal(redacted.length, 2);
            strict_1.default.equal(redacted[0].id, 1);
            strict_1.default.equal(redacted[0].token, '[REDACTED]');
            strict_1.default.equal(redacted[0].label, 'Item 1');
            strict_1.default.equal(redacted[1].id, 2);
            strict_1.default.equal(redacted[1].token, '[REDACTED]');
        });
        (0, node_test_1.it)('should parse and redact JSON strings', () => {
            const jsonString = JSON.stringify({
                username: 'alice',
                password: 'alicePassword!',
                nested: { token: 'secret-token' }
            });
            const redacted = (0, redact_1.redactBody)(jsonString);
            const parsed = JSON.parse(redacted);
            strict_1.default.equal(parsed.username, 'alice');
            strict_1.default.equal(parsed.password, '[REDACTED]');
            strict_1.default.equal(parsed.nested.token, '[REDACTED]');
        });
        (0, node_test_1.it)('should redact URLSearchParams and url-encoded strings', () => {
            const formString = 'client_id=myApp&client_secret=superSecret123&scope=read';
            const redacted = (0, redact_1.redactBody)(formString);
            strict_1.default.ok(!redacted.includes('superSecret123'));
            strict_1.default.ok(redacted.includes('client_secret=%5BREDACTED%5D') || redacted.includes('client_secret=[REDACTED]'));
            const params = new URLSearchParams({
                client_id: 'app1',
                client_secret: 'secretVal',
                grant_type: 'client_credentials'
            });
            const redactedParams = (0, redact_1.redactBody)(params);
            strict_1.default.equal(redactedParams.get('client_id'), 'app1');
            strict_1.default.equal(redactedParams.get('client_secret'), '[REDACTED]');
            strict_1.default.equal(redactedParams.get('grant_type'), 'client_credentials');
        });
        (0, node_test_1.it)('should handle circular references gracefully without stack overflow', () => {
            const circularObj = { name: 'circular', password: 'my-password' };
            circularObj.self = circularObj;
            const redacted = (0, redact_1.redactBody)(circularObj);
            strict_1.default.equal(redacted.name, 'circular');
            strict_1.default.equal(redacted.password, '[REDACTED]');
            strict_1.default.equal(redacted.self, '[CIRCULAR]');
        });
        (0, node_test_1.it)('should not mutate original inputs', () => {
            const original = {
                password: 'secret',
                details: { token: 'tok' }
            };
            const copy = JSON.parse(JSON.stringify(original));
            (0, redact_1.redactBody)(original);
            strict_1.default.deepEqual(original, copy);
        });
        (0, node_test_1.it)('should preserve non-object primitives and null/undefined', () => {
            strict_1.default.equal((0, redact_1.redactBody)(null), null);
            strict_1.default.equal((0, redact_1.redactBody)(undefined), undefined);
            strict_1.default.equal((0, redact_1.redactBody)(42), 42);
            strict_1.default.equal((0, redact_1.redactBody)(true), true);
            strict_1.default.equal((0, redact_1.redactBody)(false), false);
        });
    });
});
