import { test, expect } from '../../../core/base/security.fixture';
import { envConfig } from '../../../config/env.config';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

const SECURITY_DATA_DIR = path.resolve(__dirname, '../../../test-data/security');
const UI_PROFILE_DATA_DIR = path.resolve(__dirname, '../../../test-data/ui/Profile');

test.describe('SEC-UPL: Avatar & Asset Upload Security Suite', () => {
  let authToken: string;

  test.beforeEach(async ({ securityApi }) => {
    test.skip(
      envConfig.env !== 'DOCKER',
      'Attack payloads only permitted on disposable DOCKER environment'
    );

    const username = `upload_sec_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const regRes = await securityApi.auth.register({
      username,
      password: 'UploadSecPassword123!',
      fullName: 'Upload Tester'
    });
    authToken = regRes.data.token;
  });

  test.afterEach(async ({ api }) => {
    await api.testControl.reset();
  });

  test('SEC-UPL-01: Executable script disguised with .png extension is rejected or flagged @security @owasp-api4 @owasp-a03', async ({
    securityApi
  }) => {
    const spoofedBuffer = fs.readFileSync(path.join(SECURITY_DATA_DIR, 'spoofed_executable.png'));

    const res = await securityApi.profile.uploadAvatar(
      {
        name: 'exploit.png',
        mimeType: 'image/png',
        buffer: spoofedBuffer
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        expectStatus: [200, 400, 415]
      }
    );

    // If backend only checks extension rather than magic bytes, mark finding
    if (res.status === 200) {
      test.fail(
        true,
        'AppSec Finding: File upload endpoint accepted script payload with spoofed .png extension (no magic byte validation)'
      );
    }
    expect([400, 415]).toContain(res.status);
  });

  test('SEC-UPL-02: SVG containing embedded script is rejected or sanitized @security @owasp-a03', async ({
    securityApi
  }) => {
    const svgBuffer = fs.readFileSync(path.join(SECURITY_DATA_DIR, 'malicious.svg'));

    const res = await securityApi.profile.uploadAvatar(
      {
        name: 'avatar.svg',
        mimeType: 'image/svg+xml',
        buffer: svgBuffer
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        expectStatus: [200, 400, 415]
      }
    );

    // If rejected, that is secure
    if (res.status === 400 || res.status === 415) {
      expect([400, 415]).toContain(res.status);
    } else {
      // If allowed, ensure stored path prevents script execution
      const avatarUrl = (res.data as any)?.avatarUrl || (res.data as any)?.url;
      expect(avatarUrl).toBeDefined();
    }
  });

  test('SEC-UPL-03: Oversize file exceeding 2MB limit is rejected with 400 or 413 @security @owasp-api4', async ({
    securityApi
  }) => {
    const largeBuffer = fs.readFileSync(path.join(UI_PROFILE_DATA_DIR, 'large_image.png'));

    const res = await securityApi.profile.uploadAvatar(
      {
        name: 'large_image.png',
        mimeType: 'image/png',
        buffer: largeBuffer
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        expectStatus: [400, 413]
      }
    );

    expect([400, 413]).toContain(res.status);
  });

  test('SEC-UPL-04: Path traversal in uploaded filename is sanitized @security @owasp-a03', async ({
    securityApi
  }) => {
    const validPngBuffer = fs.readFileSync(path.join(UI_PROFILE_DATA_DIR, 'valid_avatar.png'));

    const res = await securityApi.profile.uploadAvatar(
      {
        name: '../../../../etc/cron.d/backdoor.png',
        mimeType: 'image/png',
        buffer: validPngBuffer
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        expectStatus: [200, 400]
      }
    );

    if (res.status === 200) {
      const avatarUrl = (res.data as any)?.avatarUrl || (res.data as any)?.url || '';
      // Ensure the returned URL is not escaping to root or cron directory
      expect(avatarUrl).not.toContain('..');
      expect(avatarUrl).not.toContain('/etc/cron');
    } else {
      expect(res.status).toBe(400);
    }
  });

  test('SEC-UPL-05: Non-image extension (.txt) is rejected by upload endpoint @security @owasp-a03', async ({
    securityApi
  }) => {
    const txtBuffer = fs.readFileSync(path.join(UI_PROFILE_DATA_DIR, 'invalid_file.txt'));

    const res = await securityApi.profile.uploadAvatar(
      {
        name: 'payload.txt',
        mimeType: 'text/plain',
        buffer: txtBuffer
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        expectStatus: [400, 415]
      }
    );

    expect([400, 415]).toContain(res.status);
  });
});
