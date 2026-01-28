import { registerAs } from '@nestjs/config';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

export const CLOUDINARY_CONFIG_KEY = 'cloudinary';

export default registerAs(
  CLOUDINARY_CONFIG_KEY,
  (): CloudinaryConfig => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    apiSecret: process.env.CLOUDINARY_API_SECRET as string,
    folder: process.env.CLOUDINARY_FOLDER || 'github-tracking/avatars',
  }),
);
