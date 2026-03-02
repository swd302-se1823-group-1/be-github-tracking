import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyGitHubFirebaseDto {
  @ApiProperty({
    description:
      'Firebase ID Token obtained after GitHub sign-in via Firebase SDK',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    description:
      'GitHub OAuth access token extracted from Firebase UserCredential on the client side. ' +
      'Use GithubAuthProvider.credentialFromResult(result).accessToken to obtain this.',
  })
  @IsString()
  @IsNotEmpty()
  githubAccessToken: string;
}
