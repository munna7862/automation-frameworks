/**
 * Standard collection of invalid, edge-case, and security boundary inputs
 * for robust fuzzing, boundary, and validation testing.
 */
export const INVALID_INPUTS = {
  /** Empty string */
  EMPTY_STRING: '',
  /** String with only spaces */
  WHITESPACE_ONLY: '     ',
  /** Classic SQL Injection payload */
  SQL_INJECTION: "' OR '1'='1' --",
  /** SQL Injection UNION SELECT attack vector */
  SQL_INJECTION_UNION: "admin' UNION SELECT null, username, password FROM users --",
  /** Cross-Site Scripting (XSS) payload */
  XSS_SCRIPT: "<script>alert('xss')</script>",
  /** XSS event handler attack vector */
  XSS_IMG_ONERROR: "<img src=x onerror=alert('xss') />",
  /** Very large string (500 characters) */
  OVERSIZE_500: 'A'.repeat(500),
  /** Very large string (2000 characters) */
  OVERSIZE_2000: 'B'.repeat(2000),
  /** String with emojis and 4-byte UTF-8 sequences */
  UNICODE_EMOJI: '📚🚀🐛🎉🔥✨🤖🧪',
  /** Non-Latin unicode characters (Japanese, Arabic, Cyrillic) */
  UNICODE_MULTILINGUAL: '日本語 / العربية / Русский язык / 中文',
  /** Dangerous control characters (Null byte, Carriage Return, Line Feed) */
  CONTROL_CHARS: 'test\u0000\r\n\tuser',
  /** Full range of special ASCII punctuation symbols */
  SPECIAL_PUNCTUATION: '!@#$%^&*()_+-=[]{}|;:",.<>?/`~',
  /** Negative number as string */
  NEGATIVE_NUMERIC: '-999',
  /** Floating point number where integer expected */
  DECIMAL_NUMERIC: '3.14159',
  /** Non-numeric string */
  NOT_A_NUMBER: 'not_a_number'
} as const;

export type InvalidInputType = keyof typeof INVALID_INPUTS;
