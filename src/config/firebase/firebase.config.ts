import { registerAs } from '@nestjs/config';

export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export const FIREBASE_CONFIG_KEY = 'firebase';

export default registerAs(
  FIREBASE_CONFIG_KEY,
  (): FirebaseConfig => ({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  }),
);
