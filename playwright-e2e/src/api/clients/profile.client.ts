import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type { UserProfile, AvatarUploadResponse } from '../schemas/profile.schema';

export interface AvatarFilePayload {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

export class ProfileClient extends BaseClient {
  public async get(opts?: RequestOpts): Promise<ApiResponse<UserProfile>> {
    return this.httpGet<UserProfile>('/api/profile', opts);
  }

  public async uploadAvatar(
    file: AvatarFilePayload | { [key: string]: any },
    opts?: RequestOpts
  ): Promise<ApiResponse<AvatarUploadResponse>> {
    const multipart =
      'name' in file && 'mimeType' in file && 'buffer' in file ? { avatar: file } : file;

    return this.httpPost<AvatarUploadResponse>('/api/profile/upload', undefined, {
      ...opts,
      multipart
    });
  }
}
