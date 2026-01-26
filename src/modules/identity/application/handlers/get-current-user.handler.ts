import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserRole } from '../../domain/enums/user-role.enum';

interface CurrentUserResponse {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  studentProfile?: {
    studentCode: string | null;
    universityEmail: string | null;
  };
  lecturerProfile?: {
    employeeCode: string;
    degree: string;
    department?: string;
    phoneNumber?: string;
  };
}

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetCurrentUserQuery): Promise<CurrentUserResponse> {
    const { userId } = query;

    const user = await this.userRepository.findById(UserId.fromString(userId));

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.isActive) {
      throw new NotFoundException('User account is inactive');
    }

    // Build base response
    const response: CurrentUserResponse = {
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || null,
      avatarUrl: user.avatarUrl || null,
      role: user.role,
      isActive: user.isActive,
    };

    // Add role-specific profile
    if (user.role === UserRole.STUDENT && user.studentProfile) {
      response.studentProfile = {
        studentCode: user.studentProfile.studentCode || null,
        universityEmail: user.studentProfile.universityEmail || null,
      };
    } else if (user.role === UserRole.LECTURER && user.lecturerProfile) {
      response.lecturerProfile = {
        employeeCode: user.lecturerProfile.employeeCode,
        degree: user.lecturerProfile.degree,
        department: user.lecturerProfile.department,
        phoneNumber: user.lecturerProfile.phoneNumber,
      };
    }

    return response;
  }
}
