import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { ROLES_KEY } from '@/shared/decorators/roles.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<Request>();

    if (user && 'role' in user) {
      if (user.role === UserRole.SUPERADMIN) {
        // SUPERADMIN has access to everything except if specific roles are required (e.g. STUDENT only)
        // However, based on requirements, SUPERADMIN inherits ADMIN rights.
        if (requiredRoles.includes(UserRole.ADMIN)) {
          return true;
        }
        // If the endpoint specifically requires SUPERADMIN, it will be in requiredRoles
      }
      return requiredRoles.includes(user.role as UserRole);
    }
    return false;
  }
}
