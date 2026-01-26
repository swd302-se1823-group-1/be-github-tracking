import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetStudentByIdQuery } from '@/modules/identity/application/queries/student/get-student-by-id.query';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { StudentResponseDto } from '@/modules/identity/presentation/dtos/student/student-response.dto';
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

@QueryHandler(GetStudentByIdQuery)
export class GetStudentByIdHandler implements IQueryHandler<GetStudentByIdQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetStudentByIdQuery): Promise<StudentResponseDto> {
    const { id } = query;
    const user = await this.userRepository.findById(new UserId(id));

    if (!user || user.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    return new StudentResponseDto({
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl,
      studentCode: user.studentProfile?.studentCode || null,
      universityEmail: user.studentProfile?.universityEmail || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
