import { Module } from '@nestjs/common';
import { Argon2PasswordHasher } from '@/infrastructure/security/argon2-password-hasher';
import { AesEncryptionService } from '@/infrastructure/security/aes-encryption.service';
import { PASSWORD_HASHER, ENCRYPTION_SERVICE } from '@/shared';

@Module({
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: ENCRYPTION_SERVICE,
      useClass: AesEncryptionService,
    },
  ],
  exports: [PASSWORD_HASHER, ENCRYPTION_SERVICE],
})
export class CryptoModule {}
