import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FIREBASE_CONFIG_KEY, FirebaseConfig } from '@/config/firebase';
import { GitHubProfile } from '@/modules/tracking/domain/types/github-profile.type';

/** Typed shape of the `firebase.identities` claim inside a decoded ID token. */
interface FirebaseIdentities {
  'github.com'?: string[];
  'google.com'?: string[];
  email?: string[];
  [provider: string]: string[] | undefined;
}

/** Strongly-typed subset of Firebase ID-token standard claims. */
interface FirebaseTokenClaims {
  name?: string;
  email?: string;
  picture?: string;
  uid: string;
  firebase: {
    sign_in_provider: string;
    identities: FirebaseIdentities;
  };
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const config = this.configService.get<FirebaseConfig>(FIREBASE_CONFIG_KEY)!;

    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
      });
    } else {
      this.app = admin.app();
    }
  }

  async verifyGitHubIdToken(idToken: string): Promise<GitHubProfile> {
    let raw: admin.auth.DecodedIdToken;

    try {
      raw = await this.app.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase ID token');
    }

    // Narrow the loosely-typed DecodedIdToken into our strict interface.
    const decoded = raw as unknown as FirebaseTokenClaims;

    if (decoded.firebase.sign_in_provider !== 'github.com') {
      throw new UnauthorizedException('Token is not from GitHub provider');
    }

    const githubId: string =
      decoded.firebase.identities['github.com']?.[0] ?? decoded.uid;

    return {
      username: decoded.name ?? decoded.email?.split('@')[0] ?? githubId,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      avatarUrl: decoded.picture ?? null,
      providerId: githubId,
      accessToken: null,
    };
  }
}
