import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private adminClient: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>('supabase.serviceRoleKey');

    if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('placeholder')) {
      try {
        this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        this.logger.log('Supabase admin client initialized');
      } catch (err) {
        this.logger.warn(`Supabase client initialization warning: ${err.message}`);
      }
    } else {
      this.logger.log('Supabase client in offline/mock mode (placeholder credentials)');
    }
  }

  getAdminClient(): SupabaseClient | null {
    return this.adminClient;
  }

  /**
   * Generates a signed upload URL for direct storage uploads
   */
  async createSignedUploadUrl(bucket: string, path: string) {
    if (!this.adminClient) {
      return {
        signedUrl: `https://storage.local/${bucket}/${path}?mock=true`,
        token: 'mock-upload-token',
        path,
      };
    }
    const { data, error } = await this.adminClient.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      throw new Error(`Failed to create upload URL: ${error.message}`);
    }

    return data;
  }

  /**
   * Generates a signed download URL for private files
   */
  async getSignedDownloadUrl(bucket: string, path: string, expiresInSeconds = 3600) {
    if (!this.adminClient) {
      return `https://storage.local/${bucket}/${path}`;
    }
    const { data, error } = await this.adminClient.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      throw new Error(`Failed to generate signed download URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}
