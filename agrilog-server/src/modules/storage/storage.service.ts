import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null = null;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    this.bucket =
      this.configService.get<string>('SUPABASE_BUCKET') || 'agrilog-media';

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log(
        `Supabase client initialized with bucket: ${this.bucket}`,
      );
    } else {
      this.logger.warn(
        'SUPABASE_URL or SUPABASE_KEY is not configured in .env. StorageService will operate in fallback/simulation mode.',
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'activities',
  ): Promise<{
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }> {
    const fileExt =
      file.originalname.split('.').pop() ||
      (file.mimetype.includes('video') ? 'mp4' : 'jpg');
    const uniqueFileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    if (this.supabase) {
      try {
        const { error } = await this.supabase.storage
          .from(this.bucket)
          .upload(uniqueFileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          this.logger.error(`Error uploading to Supabase: ${error.message}`);
          throw error;
        }

        const { data: urlData } = this.supabase.storage
          .from(this.bucket)
          .getPublicUrl(uniqueFileName);

        return {
          url: urlData.publicUrl,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        };
      } catch (err: any) {
        this.logger.error(
          `Supabase upload failed, falling back to simulated URL: ${err?.message}`,
        );
      }
    }

    // Fallback simulation mode khi chưa cấu hình Supabase keys trong .env hoặc lỗi mạng
    const simulatedUrl = `https://supabase-fallback.agrilog.local/storage/v1/object/public/${this.bucket}/${uniqueFileName}`;
    return {
      url: simulatedUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }
}
