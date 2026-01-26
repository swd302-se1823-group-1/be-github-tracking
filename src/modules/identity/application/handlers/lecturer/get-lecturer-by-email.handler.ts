import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetLecturerByEmailQuery } from '@/modules/identity/application/queries/lecturer/get-lecturer-by-email.query';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { LecturerResponseDto } from '@/modules/identity/presentation/dtos/lecturer/lecturer-response.dto';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

@QueryHandler(GetLecturerByEmailQuery)
export class GetLecturerByEmailHandler implements IQueryHandler<GetLecturerByEmailQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetLecturerByEmailQuery): Promise<LecturerResponseDto> {
    const { email } = query;
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.role !== UserRole.LECTURER) {
      throw new NotFoundException('Lecturer not found');
    }

    return new LecturerResponseDto({
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl,
      employeeCode: user.lecturerProfile?.employeeCode || null,
      degree: user.lecturerProfile?.degree || null,
      department: user.lecturerProfile?.department || null,
      phoneNumber: user.lecturerProfile?.phoneNumber || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
