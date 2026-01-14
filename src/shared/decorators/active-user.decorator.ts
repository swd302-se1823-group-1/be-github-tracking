import { TokenUserPayload } from '@/shared/types/token.types';
import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const ActiveUser = createParamDecorator(
  <K extends keyof TokenUserPayload>(
    data: K | undefined,
    ctx: ExecutionContext,
  ) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request.user as TokenUserPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('Missing request.user');
    }

    if (data && !(data in user)) {
      throw new BadRequestException(`Invalid key "${String(data)}"`);
    }

    return data ? user[data] : user;
  },
);
