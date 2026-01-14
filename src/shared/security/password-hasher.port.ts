export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashedPassword: string): Promise<boolean>;
}
