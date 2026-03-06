import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRepositoryByIdQuery } from '../../queries/repository/get-repository-by-id.query';
import { IRepositoryRepository } from '../../../domain/repositories/repository.repository';
import { IProjectRepository } from '../../../domain/repositories/project.repository';
import { RepositoryAggregate } from '../../../domain/aggregates/repository.aggregate';
import {
  NotFoundException,
  UnauthorizedException,
  ValidationException,
} from '@/shared/exceptions/domain.exception';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { UserRole } from '@generated/prisma/enums';

@QueryHandler(GetRepositoryByIdQuery)
export class GetRepositoryByIdHandler implements IQueryHandler<
  GetRepositoryByIdQuery,
  RepositoryAggregate
> {
  constructor(
    @Inject(IRepositoryRepository)
    private readonly repositoryRepository: IRepositoryRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetRepositoryByIdQuery): Promise<RepositoryAggregate> {
    const { repositoryId, projectId, userId } = query;

    // 1. Verify project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. Look up the repository
    const repository = await this.repositoryRepository.findById(repositoryId);
    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    if (repository.projectId !== projectId) {
      throw new ValidationException(
        'projectId',
        'Repository does not belong to this project',
      );
    }

    // 3. Optional: User permission check (member view only)
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

    return repository;
  }
}
