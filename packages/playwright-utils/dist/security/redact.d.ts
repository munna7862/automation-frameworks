export declare const SENSITIVE_HEADER_KEYS: string[];
export declare const SENSITIVE_BODY_KEYS: string[];
/**
 * Masks Bearer tokens, JWT tokens, and credentials in key=value strings.
 */
export declare function redactString(s: string): string;
/**
 * Redacts sensitive HTTP header values. Does not mutate the input object.
 */
export declare function redactHeaders(headers: Record<string, string>): Record<string, string>;
/**
 * Deeply redacts sensitive keys from objects, arrays, JSON strings, and URLSearchParams.
 * Case-insensitive, non-mutating, and safe against circular references.
 */
export declare function redactBody(body: unknown, seen?: WeakSet<object>): unknown;
