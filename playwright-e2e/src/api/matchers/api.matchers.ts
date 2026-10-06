import { expect } from '@playwright/test';
import { z } from 'zod';
import type { ApiResponse } from '../clients/base.client';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Validates that an ApiResponse body (or raw object) conforms to a Zod schema.
       * Provides formatted path-level diagnostics on failure.
       */
      toMatchSchema(schema: z.ZodTypeAny): R;

      /**
       * Asserts that an ApiResponse completed within the specified duration budget in milliseconds.
       */
      toRespondWithin(maxDurationMs: number): R;

      /**
       * Asserts that an ApiResponse or Playwright APIResponse has the expected HTTP status code.
       * Dumps response snippet on mismatch for rapid debugging.
       */
      toHaveStatus(expectedStatus: number): R;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

expect.extend({
  toMatchSchema(received: any, schema: z.ZodTypeAny) {
    const isApiResponse =
      received &&
      typeof received === 'object' &&
      'status' in received &&
      'body' in received &&
      'durationMs' in received;

    const target = isApiResponse ? received.body : received;
    const result = schema.safeParse(target);

    if (result.success) {
      return {
        pass: true,
        message: () => `Expected payload not to match Zod schema, but it matched successfully.`
      };
    }

    const issues = result.error.issues.slice(0, 3).map((issue, idx) => {
      const pathStr = issue.path.length > 0 ? issue.path.join('.') : '<root>';
      return `  ${idx + 1}. [${pathStr}] ${issue.message} (code: ${issue.code})`;
    });

    const moreCount = result.error.issues.length - 3;
    const moreText = moreCount > 0 ? `\n  ... and ${moreCount} more issue(s)` : '';

    const endpointInfo = isApiResponse && received.raw ? `\nEndpoint: ${received.raw.url()}` : '';
    const statusInfo = isApiResponse ? `\nStatus: ${received.status}` : '';

    const payloadPreview = JSON.stringify(target, null, 2);
    const truncatedPayload =
      payloadPreview && payloadPreview.length > 500
        ? payloadPreview.slice(0, 500) + '... (truncated)'
        : payloadPreview;

    const message = () =>
      `Zod Schema Validation Failed:${endpointInfo}${statusInfo}\n` +
      `Issues:\n${issues.join('\n')}${moreText}\n\n` +
      `Received Payload:\n${truncatedPayload}`;

    return {
      pass: false,
      message
    };
  },

  toRespondWithin(received: ApiResponse<any>, maxDurationMs: number) {
    if (!received || typeof received.durationMs !== 'number') {
      return {
        pass: false,
        message: () =>
          `toRespondWithin matcher expects an ApiResponse object with numeric durationMs, received: ${typeof received}`
      };
    }

    const pass = received.durationMs <= maxDurationMs;
    const urlInfo = received.raw ? ` for ${received.raw.url()}` : '';

    return {
      pass,
      message: () =>
        pass
          ? `Expected response${urlInfo} NOT to respond within ${maxDurationMs}ms, but took ${received.durationMs}ms`
          : `Expected response${urlInfo} to respond within ${maxDurationMs}ms budget, but took ${received.durationMs}ms (+${received.durationMs - maxDurationMs}ms over budget)`
    };
  },

  toHaveStatus(received: any, expectedStatus: number) {
    const actualStatus =
      typeof received?.status === 'function' ? received.status() : received?.status;

    if (typeof actualStatus !== 'number') {
      return {
        pass: false,
        message: () =>
          `toHaveStatus matcher expects an object with status code, received: ${typeof actualStatus}`
      };
    }

    const pass = actualStatus === expectedStatus;
    const bodyStr = received?.body
      ? `\nResponse Body: ${JSON.stringify(received.body, null, 2).slice(0, 500)}`
      : '';
    const urlStr = received?.raw?.url?.() ? ` for ${received.raw.url()}` : '';

    return {
      pass,
      message: () =>
        pass
          ? `Expected HTTP status${urlStr} NOT to be ${expectedStatus}, but got ${actualStatus}`
          : `Expected HTTP status${urlStr} to be ${expectedStatus}, but got ${actualStatus}.${bodyStr}`
    };
  }
});
