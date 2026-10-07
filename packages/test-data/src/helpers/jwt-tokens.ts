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

/**
 * Creates an unsigned JWT token with alg: 'none' in header.
 */
export function createNoneAlgorithmToken(username = 'testuser'): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ username, type: 'access', exp: Math.floor(Date.now() / 1000) + 3600 })
  ).toString('base64url');
  return `${header}.${payload}.`;
}

/**
 * Creates a JWT token with tampered kid header (e.g. path traversal or key confusion).
 */
export async function createKidTamperedToken(
  username = 'testuser',
  kid = '../../../../dev/null',
  secret = DEFAULT_SECRET
): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  return new jose.SignJWT({ username, type: 'access' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT', kid })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretBytes);
}

/**
 * Creates a JWT token where the payload has been tampered with but the original signature is retained.
 */
export function createTamperedPayloadToken(
  validToken: string,
  tamperedPayload: Record<string, any>
): string {
  const parts = validToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  const originalPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  const mergedPayload = { ...originalPayload, ...tamperedPayload };
  const encodedTamperedPayload = Buffer.from(JSON.stringify(mergedPayload)).toString('base64url');
  return `${parts[0]}.${encodedTamperedPayload}.${parts[2]}`;
}
