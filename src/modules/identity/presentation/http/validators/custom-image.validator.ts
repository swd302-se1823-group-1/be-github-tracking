import { FileValidator } from '@nestjs/common';
import { UploadedFile } from '@/shared/types/uploaded-file.interface';

export interface CustomImageValidatorOptions {
  allowedMimeTypes: string[];
}

export class CustomImageValidator extends FileValidator<CustomImageValidatorOptions> {
  constructor(options?: CustomImageValidatorOptions) {
    super(
      options || {
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/jpg',
        ],
      },
    );
  }

  isValid(file: UploadedFile): boolean {
    if (!file || !file.mimetype) {
      return false;
    }

    // Log mimetype for debugging if strict check fails usually
    // But here we just return the boolean
    return this.validationOptions.allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(file: any): string {
    const uploadedFile = file as UploadedFile;
    return `File must be an image (allowed: ${this.validationOptions.allowedMimeTypes.join(', ')}). Received: ${uploadedFile?.mimetype}`;
  }
}
