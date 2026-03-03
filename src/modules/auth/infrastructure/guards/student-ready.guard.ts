import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { GetCurrentUserQuery } from '@/modules/identity/application/queries/user/get-current-user.query';
import { CurrentUserResult } from '@/modules/identity/application/dto/current-user.result';
import { GetGitHubMappingQuery } from '@/modules/tracking/application/queries/github/get-github-mapping.query';
import { GithubMappingAggregate } from '@/modules/tracking/domain/aggregates/github-mapping.aggregate';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

/**
 * Ensures the authenticated student has:
 * 1. A completed student profile (student_code is set)
 * 2. A verified GitHub mapping
 *
 * Apply on endpoints that require full student onboarding (e.g. tracking features).
 * Must run AFTER JwtAccessGuard so request.user.id is available.
 */
@Injectable()
export class StudentReadyGuard implements CanActivate {
  constructor(private readonly queryBus: QueryBus) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request.user as { id: string }).id;

    const user = await this.queryBus.execute<
      GetCurrentUserQuery,
      CurrentUserResult
    >(new GetCurrentUserQuery(userId));

    if (user.role !== UserRole.STUDENT) {
      // Non-student roles (LECTURER, ADMIN) skip this check
      return true;
    }

    if (!user.studentProfile?.studentCode) {
      throw new ForbiddenException(
        'Vui lòng cập nhật hồ sơ sinh viên (mã số sinh viên) trước khi sử dụng tính năng này',
      );
    }

    const mapping = await this.queryBus.execute<
      GetGitHubMappingQuery,
      GithubMappingAggregate | null
    >(new GetGitHubMappingQuery(userId));

    if (!mapping?.isVerified) {
      throw new ForbiddenException(
        'Vui lòng xác minh tài khoản GitHub trước khi sử dụng tính năng này',
      );
    }

    return true;
  }
}
