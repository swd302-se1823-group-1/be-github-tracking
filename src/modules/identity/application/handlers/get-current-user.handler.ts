import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserRole } from '../../domain/enums/user-role.enum';

import {
  CurrentUserResult,
  StudentProfileResult,
  LecturerProfileResult,
} from '../dto/current-user.result';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<
  GetCurrentUserQuery,
  CurrentUserResult
> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetCurrentUserQuery): Promise<CurrentUserResult> {
    const { userId } = query;

    const user = await this.userRepository.findById(UserId.fromString(userId));

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.isActive) {
      throw new NotFoundException('User account is inactive');
    }

    let studentProfile: StudentProfileResult | undefined;
    let lecturerProfile: LecturerProfileResult | undefined;

    // Add role-specific profile
    if (user.role === UserRole.STUDENT && user.studentProfile) {
      studentProfile = {
        studentCode: user.studentProfile.studentCode || null,
        universityEmail: user.studentProfile.universityEmail || null,
      };
    } else if (user.role === UserRole.LECTURER && user.lecturerProfile) {
      lecturerProfile = {
        employeeCode: user.lecturerProfile.employeeCode,
        degree: user.lecturerProfile.degree,
        department: user.lecturerProfile.department,
        phoneNumber: user.lecturerProfile.phoneNumber,
      };
    }

    return {
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || null,
      avatarUrl: user.avatarUrl || null,
      role: user.role,
      isActive: user.isActive,
      studentProfile,
      lecturerProfile,
    };
  }
}
