import { PasswordHasher } from '@/shared';
import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string) {
    return await argon2.hash(plain, {
      type: argon2.argon2id,
    });
  }

  async compare(plain: string, hashedPassword: string) {
    return argon2.verify(hashedPassword, plain);
  }
}
