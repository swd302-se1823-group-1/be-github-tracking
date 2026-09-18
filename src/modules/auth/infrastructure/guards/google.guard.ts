import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): any {
    const req = context.switchToHttp().getRequest<Request>();

    const returnUrl = req.query.return_url as string;

    return {
      state: returnUrl || undefined,
    };
  }
}
