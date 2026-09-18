import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRepositoriesByProjectQuery } from '../../queries/repository/get-repositories-by-project.query';
import { IRepositoryRepository } from '../../../domain/repositories/repository.repository';
import { IProjectRepository } from '../../../domain/repositories/project.repository';
import { RepositoryAggregate } from '../../../domain/aggregates/repository.aggregate';
import {
  NotFoundException,
  UnauthorizedException,
} from '@/shared/exceptions/domain.exception';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { UserRole } from '@generated/prisma/enums';

@QueryHandler(GetRepositoriesByProjectQuery)
export class GetRepositoriesByProjectHandler implements IQueryHandler<
  GetRepositoriesByProjectQuery,
  RepositoryAggregate[]
> {
  constructor(
    @Inject(IRepositoryRepository)
    private readonly repositoryRepository: IRepositoryRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    query: GetRepositoriesByProjectQuery,
  ): Promise<RepositoryAggregate[]> {
    const { projectId, userId } = query;

    // 1. Verify project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. User permission check - anyone in project or LECTURER/ADMIN
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deleted_at: null },
      select: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { id: userId },
      });
      if (!student) {
        throw new UnauthorizedException('Student profile not found');
      }

      const isMember = await this.projectRepository.isStudentInProject(
        projectId,
        student.id,
      );
      if (!isMember) {
        throw new UnauthorizedException(
          'Only project members can view repositories',
        );
      }
    }

    // 3. Fetch list
    return this.repositoryRepository.findByProjectId(projectId);
  }
}
