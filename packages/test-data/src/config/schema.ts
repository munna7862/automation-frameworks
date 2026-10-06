import { z } from 'zod';

export const TARGET_ENV_ENUM = z.enum(['DOCKER', 'STAGING', 'INTEROP'], {
  errorMap: (issue, ctx) => {
    if (issue.code === 'invalid_enum_value') {
      return {
        message: `Invalid environment '${issue.received}'. Expected one of: 'DOCKER' | 'STAGING' | 'INTEROP'`
      };
    }
    return { message: ctx.defaultError };
  }
});

export type TargetEnv = z.infer<typeof TARGET_ENV_ENUM>;

export const ENV_PROFILES: Record<TargetEnv, { baseUrl: string; apiBaseUrl: string }> = {
  DOCKER: {
    baseUrl: 'http://localhost:5173',
    apiBaseUrl: 'http://localhost:4000'
  },
  STAGING: {
    baseUrl: 'https://buggy-books-fe.onrender.com',
    apiBaseUrl: 'https://buggy-books.onrender.com'
  },
  INTEROP: {
    baseUrl: 'https://buggy-books-fe.onrender.com',
    apiBaseUrl: 'https://buggy-books.onrender.com'
  }
} as const;

export const EnvConfigSchema = z
  .object({
    ENV: TARGET_ENV_ENUM,
    baseUrl: z
      .string({ required_error: 'baseUrl is required' })
      .url('baseUrl must be a valid URL (e.g. http://localhost:5173)'),
    apiBaseUrl: z
      .string({ required_error: 'apiBaseUrl is required' })
      .url('apiBaseUrl must be a valid URL (e.g. http://localhost:4000)'),
    apiUrl: z.string().url().optional(),
    headless: z
      .preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (val === undefined || val === null || val === '') return true;
        return val === 'true' || val === '1';
      }, z.boolean())
      .default(true),
    browser: z.string().default('chrome'),
    timeout: z.coerce.number().int().positive().default(15000),
    SUITENAME: z.string().default('Default'),
    userName: z.string().default('admin'),
    password: z.string().default('password123')
  })
  .superRefine((data, ctx) => {
    if (data.ENV === 'STAGING') {
      if (!data.userName || data.userName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'userName (E2E_USER_NAME / USER_NAME) is required when targeting ENV=STAGING',
          path: ['userName']
        });
      }
      if (!data.password || data.password.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'password (E2E_USER_PASSWORD / PASSWORD) is required when targeting ENV=STAGING',
          path: ['password']
        });
      }
    }
  });

export type ValidatedEnvConfig = z.infer<typeof EnvConfigSchema>;

export class EnvConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvConfigValidationError';
  }
}

/**
 * Format zod issues into a clear, readable error block.
 */
export function formatZodIssues(issues: z.ZodIssue[]): string {
  const lines: string[] = [
    '================================================================================',
    '❌ ENVIRONMENT CONFIGURATION ERROR — FAST-FAIL GATE',
    '================================================================================',
    'The following configuration errors were detected:'
  ];

  for (const issue of issues) {
    const field = issue.path.join('.') || 'root';
    lines.push(`  • [${field}]: ${issue.message}`);
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('Remediation: Review your .env file or environment variables.');
  lines.push('Allowed ENV values: DOCKER | STAGING | INTEROP');
  lines.push('================================================================================');

  return lines.join('\n');
}

/**
 * Validates raw environment inputs and resolves default profile fallbacks.
 * Exits fast with code 1 if validation fails (unless exitOnError is false).
 */
function sanitizeBaseUrl(url: string, stripApiSuffix = false): string {
  let s = (url || '').trim();
  while (s.endsWith('/')) {
    s = s.slice(0, -1);
  }
  if (stripApiSuffix && s.endsWith('/api')) {
    s = s.slice(0, -4);
    while (s.endsWith('/')) {
      s = s.slice(0, -1);
    }
  }
  return s;
}

export function validateEnvConfig(
  rawEnv: Record<string, any> = process.env,
  options: { exitOnError?: boolean } = { exitOnError: true }
): ValidatedEnvConfig {
  const targetEnvRaw = (
    rawEnv.TARGET_ENV ||
    rawEnv.ENV ||
    rawEnv.ENVIRONMENT ||
    'DOCKER'
  ).toUpperCase();

  // Pre-resolve defaults based on profile if raw values aren't explicitly provided
  const profileDefaults =
    targetEnvRaw in ENV_PROFILES ? ENV_PROFILES[targetEnvRaw as TargetEnv] : ENV_PROFILES.DOCKER;

  const rawBaseUrl =
    rawEnv.E2E_BASE_URL || rawEnv.BASE_URL || rawEnv.STAGING_URL || profileDefaults.baseUrl;

  const rawApiBaseUrl = rawEnv.E2E_API_URL || rawEnv.API_BASE_URL || profileDefaults.apiBaseUrl;

  // Clean trailing slashes or /api suffixes for apiBaseUrl
  const cleanApiBaseUrl = sanitizeBaseUrl(rawApiBaseUrl, true);
  const cleanBaseUrl = sanitizeBaseUrl(rawBaseUrl, false);

  const candidate = {
    ENV: targetEnvRaw,
    baseUrl: cleanBaseUrl,
    apiBaseUrl: cleanApiBaseUrl,
    apiUrl: `${cleanApiBaseUrl}/api`,
    headless: rawEnv.HEADLESS,
    browser: rawEnv.BROWSER,
    timeout: rawEnv.ELEMENT_TIMEOUT,
    SUITENAME: rawEnv.SUITENAME,
    userName:
      rawEnv.E2E_USER_NAME ||
      rawEnv.E2E_USER_EMAIL ||
      rawEnv.USER_NAME ||
      (targetEnvRaw === 'STAGING' ? '' : 'admin'),
    password:
      rawEnv.E2E_USER_PASSWORD ||
      rawEnv.PASSWORD ||
      (targetEnvRaw === 'STAGING' ? '' : 'password123')
  };

  const parsed = EnvConfigSchema.safeParse(candidate);

  if (!parsed.success) {
    const formatted = formatZodIssues(parsed.error.issues);
    if (options.exitOnError !== false) {
      console.error(formatted);
      process.exit(1);
    }
    throw new EnvConfigValidationError(formatted);
  }

  return parsed.data;
}
