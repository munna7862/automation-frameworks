"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENSITIVE_BODY_KEYS = exports.SENSITIVE_HEADER_KEYS = void 0;
exports.redactString = redactString;
exports.redactHeaders = redactHeaders;
exports.redactBody = redactBody;
exports.SENSITIVE_HEADER_KEYS = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'x-csrf-token'
];
exports.SENSITIVE_BODY_KEYS = [
    'password',
    'newPassword',
    'token',
    'accessToken',
    'refreshToken',
    'cardNumber',
    'cvv',
    'secret',
    'client_secret',
    'access_token',
    'refresh_token',
    'new_password',
    'card_number'
];
const SENSITIVE_HEADER_SET = new Set(exports.SENSITIVE_HEADER_KEYS.map((k) => k.toLowerCase()));
const SENSITIVE_BODY_SET = new Set(exports.SENSITIVE_BODY_KEYS.map((k) => k.toLowerCase().replace(/[-_]/g, '')));
function isSensitiveBodyKey(key) {
    if (typeof key !== 'string')
        return false;
    const normalized = key.toLowerCase().replace(/[-_]/g, '');
    return SENSITIVE_BODY_SET.has(normalized);
}
/**
 * Masks Bearer tokens, JWT tokens, and credentials in key=value strings.
 */
function redactString(s) {
    if (typeof s !== 'string') {
        return s;
    }
    let result = s;
    // Mask Bearer tokens: Bearer <token>
    result = result.replace(/(Bearer\s+)[A-Za-z0-9\-._~+/]+=*/gi, '$1[REDACTED]');
    // Mask standard 3-part JWT tokens: eyJ... . eyJ... . signature
    result = result.replace(/eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_+/=]*/g, '[REDACTED_JWT]');
    // Mask key=value pairs matching sensitive body keys (URLSearchParams or query strings)
    result = result.replace(/((?:password|newpassword|new_password|token|accesstoken|access_token|refreshtoken|refresh_token|cardnumber|card_number|cvv|secret|client_secret)=)[^&\s"'>]+/gi, '$1[REDACTED]');
    return result;
}
/**
 * Redacts sensitive HTTP header values. Does not mutate the input object.
 */
function redactHeaders(headers) {
    if (!headers || typeof headers !== 'object') {
        return {};
    }
    const result = {};
    for (const [key, value] of Object.entries(headers)) {
        if (SENSITIVE_HEADER_SET.has(key.toLowerCase())) {
            result[key] = '[REDACTED]';
        }
        else if (typeof value === 'string') {
            result[key] = redactString(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Deeply redacts sensitive keys from objects, arrays, JSON strings, and URLSearchParams.
 * Case-insensitive, non-mutating, and safe against circular references.
 */
function redactBody(body, seen = new WeakSet()) {
    if (body === null || body === undefined) {
        return body;
    }
    // Handle strings: check for JSON or URLSearchParams/form strings
    if (typeof body === 'string') {
        const trimmed = body.trim();
        // Check if JSON
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                const parsed = JSON.parse(body);
                const redacted = redactBody(parsed, seen);
                return JSON.stringify(redacted);
            }
            catch {
                // Fall through to string redaction
            }
        }
        // Check if URL-encoded form string (e.g. client_id=foo&client_secret=bar)
        if (trimmed.includes('=') && !trimmed.includes('\n') && !trimmed.startsWith('<')) {
            try {
                const params = new URLSearchParams(trimmed);
                let hasParams = false;
                let modified = false;
                const newParams = new URLSearchParams();
                for (const [key, val] of params.entries()) {
                    hasParams = true;
                    if (isSensitiveBodyKey(key)) {
                        newParams.set(key, '[REDACTED]');
                        modified = true;
                    }
                    else {
                        const redactedVal = redactString(val);
                        if (redactedVal !== val)
                            modified = true;
                        newParams.set(key, redactedVal);
                    }
                }
                if (hasParams && (modified || trimmed.includes('&'))) {
                    return newParams.toString();
                }
            }
            catch {
                // Fall through
            }
        }
        return redactString(body);
    }
    // Handle URLSearchParams objects
    if (body instanceof URLSearchParams) {
        const newParams = new URLSearchParams();
        for (const [key, val] of body.entries()) {
            if (isSensitiveBodyKey(key)) {
                newParams.set(key, '[REDACTED]');
            }
            else {
                newParams.set(key, redactString(val));
            }
        }
        return newParams;
    }
    // Handle plain objects and arrays
    if (typeof body === 'object') {
        if (seen.has(body)) {
            return '[CIRCULAR]';
        }
        seen.add(body);
        if (Array.isArray(body)) {
            return body.map((item) => redactBody(item, seen));
        }
        const result = {};
        for (const [key, val] of Object.entries(body)) {
            if (isSensitiveBodyKey(key)) {
                result[key] = '[REDACTED]';
            }
            else {
                result[key] = redactBody(val, seen);
            }
        }
        return result;
    }
    // Return primitives unchanged
    return body;
}
