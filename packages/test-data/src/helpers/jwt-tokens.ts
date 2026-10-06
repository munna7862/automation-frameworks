import * as jose from 'jose';

export interface JwtHelperOptions {
  username?: string;
  type?: string;
  secret?: string;
  expiresIn?: string | number;
}

const DEFAULT_SECRET = process.env.JWT_SECRET || 'ci-test-secret';
const WRONG_SECRET = 'invalid-unauthorized-random-foreign-secret-key-999';

/**
 * Creates an expired JWT token for negative authorization testing.
 */
export async function createExpiredToken(
  username = 'testuser',
  secret = DEFAULT_SECRET
): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  const nowInSeconds = Math.floor(Date.now() / 1000);

  return new jose.SignJWT({ username, type: 'access' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(nowInSeconds - 7200)
    .setExpirationTime(nowInSeconds - 3600)
    .sign(secretBytes);
}

/**
 * Creates a JWT signed with an untrusted / foreign secret key.
 */
export async function createWrongSignatureToken(
  username = 'testuser',
  wrongSecret = WRONG_SECRET
): Promise<string> {
  const secretBytes = new TextEncoder().encode(wrongSecret);

  return new jose.SignJWT({ username, type: 'access' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretBytes);
}

/**
 * Returns a structurally malformed token string.
 */
export function createMalformedToken(): string {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted_payload_not_json.invalid_signature_bits';
}

/**
 * Creates a valid JWT token signed with the expected secret.
 */
export async function createValidToken(
  username = 'testuser',
  secret = DEFAULT_SECRET
): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);

  return new jose.SignJWT({ username, type: 'access' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretBytes);
}
