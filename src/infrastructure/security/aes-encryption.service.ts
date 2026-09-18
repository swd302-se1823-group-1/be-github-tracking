import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import {
  EncryptedData,
  IEncryptionService,
} from '@/shared/domain/interfaces/encryption-service.interface';

@Injectable()
export class AesEncryptionService implements IEncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const keyHex = this.configService.get<string>('ENCRYPTION_KEY');
    if (!keyHex) {
      throw new Error(
        'ENCRYPTION_KEY environment variable is missing. It must be a 64-character hex string.',
      );
    }
    this.key = Buffer.from(keyHex, 'hex');
    if (this.key.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be a 32-byte key (64 hex characters) for aes-256-cbc.',
      );
    }
  }

  encrypt(text: string): EncryptedData {
    // Generate a new 16-byte secure random Initialization Vector
    const iv = randomBytes(16);

    const cipher = createCipheriv(this.algorithm, this.key, iv);

    // Encrypt the text, output as hex string
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
    };
  }

  decrypt(encryptedText: string, ivHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
