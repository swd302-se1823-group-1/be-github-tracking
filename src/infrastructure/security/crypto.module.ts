import { Argon2PasswordHasher } from '@/infrastructure/security/argon2-password-hasher';
import { PASSWORD_HASHER } from '@/shared';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
  ],
  exports: [PASSWORD_HASHER],
})
export class CryptoModule {}
