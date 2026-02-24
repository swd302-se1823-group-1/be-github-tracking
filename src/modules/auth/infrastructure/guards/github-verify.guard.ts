import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenUserPayload } from '@/shared/types/token.types';
import { Request } from 'express';

@Injectable()
export class GitHubVerifyGuard extends AuthGuard('github-verify') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate = (await super.canActivate(context)) as boolean;
    return activate;
  }

  getAuthenticateOptions(context: ExecutionContext): any {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: TokenUserPayload }>();
    // Use the id from the user populated by JwtAccessGuard
    return {
      state: request.user?.id,
    };
  }
}
