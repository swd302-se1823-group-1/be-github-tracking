export interface EncryptedData {
  encrypted: string;
  iv: string;
}

export abstract class IEncryptionService {
  /**
   * Encrypts a plaintext string into a hex string and generates an IV
   */
  abstract encrypt(text: string): EncryptedData;

  /**
   * Decrypts a hex string back into plaintext using the provided IV
   */
  abstract decrypt(encryptedText: string, iv: string): string;
}

export const ENCRYPTION_SERVICE = Symbol('ENCRYPTION_SERVICE');
