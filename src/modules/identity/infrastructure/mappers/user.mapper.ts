import {
  User as PrismaUser,
  Student as PrismaStudent,
  Lecturer as PrismaLecturer,
} from '@generated/prisma/client';
import {
  UserAggregate,
  UserProps,
} from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserRole } from '../../domain/enums/user-role.enum';
import { StudentProfile } from '../../domain/value-objects/student-profile.vo';
import { LecturerProfile } from '../../domain/value-objects/lecturer-profile.vo';

type PrismaUserWithProfiles = PrismaUser & {
  student?: PrismaStudent | null;
  lecturer?: PrismaLecturer | null;
};

export class UserMapper {
  static toDomain(prismaUser: PrismaUserWithProfiles): UserAggregate {
    const role = prismaUser.role as UserRole;

    let studentProfile: StudentProfile | undefined;
    if (role === UserRole.STUDENT && prismaUser.student) {
      studentProfile = StudentProfile.create(
        prismaUser.student.student_code || undefined,
        prismaUser.student.university_email || undefined,
      );
    }

    let lecturerProfile: LecturerProfile | undefined;
    if (role === UserRole.LECTURER && prismaUser.lecturer) {
      lecturerProfile = LecturerProfile.create(
        prismaUser.lecturer.employee_code || '',
        prismaUser.lecturer.degree || '',
        prismaUser.lecturer.department || undefined,
        prismaUser.lecturer.phone_number || undefined,
      );
    }

    const props: UserProps = {
      id: new UserId(prismaUser.id),
      email: prismaUser.email,
      fullName: prismaUser.full_name,
      avatarUrl: prismaUser.avatar_url,
      provider: prismaUser.provider,
      providerId: prismaUser.provider_id,
      role: role,
      isActive: prismaUser.is_active,
      createdAt: prismaUser.created_at,
      updatedAt: prismaUser.updated_at,
      studentProfile,
      lecturerProfile,
    };

    return UserAggregate.reconstitute(props);
  }

  // toPersistence often splits data into multiple tables for ORM
  // Since we are using Prisma, we might return a structure that the Repo uses
}
