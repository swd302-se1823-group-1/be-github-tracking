import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiOperation({
      description: `🔐 **Required Roles:** ${roles.join(', ')}`,
    }),
  );
};
