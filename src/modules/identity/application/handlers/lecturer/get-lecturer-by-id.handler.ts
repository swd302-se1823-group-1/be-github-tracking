import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetLecturerByIdQuery } from '@/modules/identity/application/queries/lecturer/get-lecturer-by-id.query';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { LecturerResponseDto } from '@/modules/identity/presentation/dtos/lecturer/lecturer-response.dto';
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

@QueryHandler(GetLecturerByIdQuery)
export class GetLecturerByIdHandler implements IQueryHandler<GetLecturerByIdQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetLecturerByIdQuery): Promise<LecturerResponseDto> {
    const { id } = query;
    const user = await this.userRepository.findById(new UserId(id));

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
