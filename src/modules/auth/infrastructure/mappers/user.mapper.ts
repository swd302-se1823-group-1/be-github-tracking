import {
  User as PrismaUser,
  UserRole as PrismaUserRole,
} from '@generated/prisma/client';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserRole } from '../../domain/enums/user-role.enum';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      fullName: prismaUser.full_name,
      avatarUrl: prismaUser.avatar_url,
      provider: prismaUser.provider,
      providerId: prismaUser.provider_id,
      role:
        UserRole[prismaUser.role as keyof typeof UserRole] || UserRole.STUDENT, // Map enum safely
      isActive: prismaUser.is_active,
      createdAt: prismaUser.created_at,
      updatedAt: prismaUser.updated_at,
    });
  }

  static toPersistence(user: User): PrismaUser {
    // Note: returning full PrismaUser might require all fields, including db generated ones.
    // For Partial updates, better to have a separate method or return Partial<PrismaUser>
    // But for strict type compatibility with PrismaClient methods, we usually construct data object in Repository using properties.
    // Here we return a plain object matching the shape if needed, or just properties.
    // This method is useful if we need to convert full aggregate to DB record structure.

    // Casting Enum from Domain to Prisma (strings usually match)
    const roleKey = user.role as unknown as keyof typeof PrismaUserRole;
    const prismaRole = PrismaUserRole[roleKey] || PrismaUserRole.STUDENT;

    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName || null,
      avatar_url: user.avatarUrl || null,
      provider: user.provider || null,
      provider_id: user.providerId || null,
      role: prismaRole,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      // Audit fields - technically Aggregate might not hold all of them if not needed,
      // but for full persistence mapping we might need them.
      // For now we map what we have in Aggregate.
      password_hash: null, // Aggregate might not have loaded password hash if unnecessary
      deleted_at: null,
      deleted_by_id: null,
      created_by_id: null,
      updated_by_id: null,
    };
  }
}
