import { test, expect } from '../../../core/base/security.fixture';
import { envConfig } from '../../../config/env.config';

test.describe('SEC-INJ: Injection & Fuzzing Resilience Suite', () => {
  test.beforeEach(async () => {
    test.skip(
      envConfig.env !== 'DOCKER',
      'Attack payloads only permitted on disposable DOCKER environment'
    );
  });

  test.afterEach(async ({ api }) => {
    await api.testControl.reset();
  });

  const SQL_PAYLOADS = [
    "' OR '1'='1",
    "'; DROP TABLE books; --",
    "1' UNION SELECT null, username, password, null, null FROM users --",
    "' OR 1=1#"
  ];

  for (const [index, payload] of SQL_PAYLOADS.entries()) {
    test(`SEC-INJ-01.${index + 1}: SQL injection payload in catalog search returns 2xx/4xx without syntax error or 5xx @security @owasp-a03`, async ({
      securityApi
    }) => {
      const res = await securityApi.books.list(
        { search: payload },
        { expectStatus: [200, 400, 404] }
      );

      expect([200, 400, 404]).toContain(res.status);
      const text = JSON.stringify(res.data).toLowerCase();
      expect(text).not.toContain('syntax error');
      expect(text).not.toContain('sqlstate');
      expect(text).not.toContain('sqlite3');
      expect(text).not.toContain('sequelize');
    });
  }

  test('SEC-INJ-02: NoSQL operator injection in authentication payload is rejected @security @owasp-a03', async ({
    securityApi
  }) => {
    const nosqlPayload: any = {
      username: { $gt: '' },
      password: { $gt: '' }
    };

    const res = await securityApi.auth.login(nosqlPayload, {
      expectStatus: [400, 401]
    });

    expect([400, 401]).toContain(res.status);
    expect(res.status).not.toBe(200); // Must not bypass authentication
    expect(res.status).not.toBe(500); // Must not trigger unhandled exception
  });

  const OS_COMMAND_PAYLOADS = ['; cat /etc/passwd |', '| whoami', '& dir', '`id`', '$(uname -a)'];

  for (const [index, cmd] of OS_COMMAND_PAYLOADS.entries()) {
    test(`SEC-INJ-03.${index + 1}: OS command payload '${cmd}' returns safe response without shell leakage @security @owasp-a03`, async ({
      securityApi
    }) => {
      const res = await securityApi.books.list({ search: cmd }, { expectStatus: [200, 400, 404] });

      expect([200, 400, 404]).toContain(res.status);
      const body = JSON.stringify(res.data);
      expect(body).not.toContain('root:x:0:0');
      expect(body).not.toContain('Directory of C:');
      expect(body).not.toContain('Linux version');
    });
  }

  const TRAVERSAL_PAYLOADS = [
    '../../../../etc/passwd',
    '..\\..\\..\\windows\\win.ini',
    '%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '....//....//etc/shadow'
  ];

  for (const [index, path] of TRAVERSAL_PAYLOADS.entries()) {
    test(`SEC-INJ-04.${index + 1}: Path traversal in book ID '${path}' is rejected without file leakage @security @owasp-a03`, async ({
      securityApi
    }) => {
      const res = await securityApi.books.getById(path, {
        expectStatus: [400, 404]
      });

      expect([400, 404]).toContain(res.status);
      const text = JSON.stringify(res.data);
      expect(text).not.toContain('root:');
      expect(text).not.toContain('[extensions]');
      expect(text).not.toContain('/bin/bash');
    });
  }
});
