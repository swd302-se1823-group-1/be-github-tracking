import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import { CLOUDINARY_CONFIG_KEY, CloudinaryConfig } from '@/config';

import { UploadedFile } from '@/shared/types/uploaded-file.interface';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface CloudinaryDeleteResult {
  result: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly cloudinaryConfig: CloudinaryConfig;

  constructor(private readonly configService: ConfigService) {
    // Get Cloudinary config using key
    this.cloudinaryConfig = this.configService.get<CloudinaryConfig>(
      CLOUDINARY_CONFIG_KEY,
    )!;

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.cloudinaryConfig.cloudName,
      api_key: this.cloudinaryConfig.apiKey,
      api_secret: this.cloudinaryConfig.apiSecret,
    });

    this.logger.log('Cloudinary configured successfully');
  }

  /**
   * Type guard to ensure file has a valid buffer
   */
  private hasValidBuffer(
    file: UploadedFile,
  ): file is UploadedFile & { buffer: Buffer } {
    return (
      file !== null &&
      file !== undefined &&
      typeof file === 'object' &&
      'buffer' in file &&
      Buffer.isBuffer(file.buffer)
    );
  }

  async uploadFile(
    file: UploadedFile,
    folder?: string,
  ): Promise<CloudinaryUploadResult> {
    // Validate file exists and has buffer property
    if (!file || typeof file !== 'object' || !('buffer' in file)) {
      throw new Error('Invalid file: buffer is missing');
    }

    // Extract and validate buffer with proper typing
    const fileBuffer = (file as { buffer: Buffer }).buffer;
    if (!fileBuffer) {
      throw new Error('Invalid file: buffer is empty');
    }

    const uploadFolder = folder || this.cloudinaryConfig.folder;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          resource_type: 'auto',
          transformation: [
            { width: 500, height: 500, crop: 'limit' }, // Limit max size
            { quality: 'auto' }, // Auto quality
            { fetch_format: 'auto' }, // Auto format (WebP if supported)
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(
              new Error(`Upload failed: ${error.message || 'Unknown error'}`),
            );
          }

          if (!result) {
            return reject(new Error('Upload failed: No result returned'));
          }

          this.logger.log(`File uploaded successfully: ${result.public_id}`);

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      // Convert buffer to stream using streamifier
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Upload avatar specifically (with avatar-specific transformations)
   * @param file - Uploaded file from NestJS file upload
   * @param userId - User ID for unique naming
   * @returns Upload result
   */
  async uploadAvatar(
    file: UploadedFile,
    userId: string,
  ): Promise<CloudinaryUploadResult> {
    // Validate file exists and has buffer property
    if (!file || typeof file !== 'object' || !('buffer' in file)) {
      throw new Error('Invalid file: buffer is missing');
    }

    // Extract and validate buffer with proper typing
    const fileBuffer = (file as { buffer: Buffer }).buffer;
    if (!fileBuffer) {
      throw new Error('Invalid file: buffer is empty');
    }

    const folder = this.cloudinaryConfig.folder;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `avatar_${userId}`, // Unique ID per user (overwrites old avatar)
          overwrite: true, // Overwrite existing avatar
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop, focus on face
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            this.logger.error('Avatar upload failed', error);
            return reject(
              new Error(
                `Avatar upload failed: ${error.message || 'Unknown error'}`,
              ),
            );
          }

          if (!result) {
            return reject(
              new Error('Avatar upload failed: No result returned'),
            );
          }

          this.logger.log(
            `Avatar uploaded for user ${userId}: ${result.public_id}`,
          );

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      // Convert buffer to stream using streamifier
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Delete file from Cloudinary
   * @param publicId - Public ID of the file to delete
   * @returns Deletion result
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = (await cloudinary.uploader.destroy(
        publicId,
      )) as CloudinaryDeleteResult;

      if (result.result === 'ok') {
        this.logger.log(`File deleted successfully: ${publicId}`);
      } else {
        this.logger.warn(
          `File deletion returned: ${result.result} for ${publicId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${publicId}`, error);
      throw error;
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param url - Cloudinary URL
   * @returns Public ID or null
   */
  extractPublicId(url: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/avatar_userId.jpg
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      this.logger.error('Failed to extract public ID from URL', error);
      return null;
    }
  }
}
