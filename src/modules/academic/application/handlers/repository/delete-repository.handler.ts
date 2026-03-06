import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteRepositoryCommand } from '../../commands/repository/delete-repository.command';
import { IRepositoryRepository } from '../../../domain/repositories/repository.repository';
import { IProjectRepository } from '../../../domain/repositories/project.repository';
import {
  ValidationException,
  NotFoundException,
  UnauthorizedException,
} from '@/shared/exceptions/domain.exception';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { UserRole } from '@generated/prisma/enums';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(DeleteRepositoryCommand)
export class DeleteRepositoryHandler implements ICommandHandler<
  DeleteRepositoryCommand,
  void
> {
  constructor(
    @Inject(IRepositoryRepository)
    private readonly repositoryRepository: IRepositoryRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Transactional()
  async execute(command: DeleteRepositoryCommand): Promise<void> {
    const { repositoryId, projectId, userId } = command;

    // 1. Validate project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. Validate repository exists and belongs to project
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

    // 3. User permission check - assuming logic similar to link-repository
    // For a real app, only Project Leader, Lecturer or Admin can delete.
    // For simplicity, checking if user is in project or user role is admin.
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
          'Only project members can delete repositories',
        );
      }
    }

    // 4. Delete (Soft delete)
    await this.repositoryRepository.delete(repositoryId, userId);
  }
}
