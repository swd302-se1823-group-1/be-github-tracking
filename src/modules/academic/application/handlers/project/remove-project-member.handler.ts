import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { RemoveProjectMemberCommand } from '@/modules/academic/application/commands/project/remove-project-member.command';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

@CommandHandler(RemoveProjectMemberCommand)
export class RemoveProjectMemberHandler implements ICommandHandler<
  RemoveProjectMemberCommand,
  void
> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Transactional()
  async execute(command: RemoveProjectMemberCommand): Promise<void> {
    const { projectId, studentId, requesterId } = command;

    // 1. Confirm project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    // 2. Load all active members to check business rules
    const members = await this.prisma.projectMember.findMany({
      where: { project_id: projectId, deleted_at: null, is_active: true },
    });

    const targetMember = members.find((m) => m.student_id === studentId);
    if (!targetMember) {
      throw new NotFoundException(
        `Student ${studentId} is not an active member of this project`,
      );
    }

    // 3. Only the current LEADER or ADMIN/LECTURER can remove a member
    const requesterMember = members.find((m) => m.student_id === requesterId);
    // If requester is not a project member, we rely on the controller's @Roles guard
    // (ADMIN/LECTURER can call without being a member). If they ARE a member, they must be LEADER.
    if (requesterMember && requesterMember.role !== 'LEADER') {
      throw new ForbiddenException(
        'Only the project LEADER can remove members',
      );
    }

    // 4. Cannot remove the LEADER (must transfer leadership first)
    if (targetMember.role === 'LEADER') {
      throw new BadRequestException(
        'Cannot remove the project LEADER. Transfer leadership first before removing this member.',
      );
    }

    // 5. Remove the member
    await this.projectRepository.removeMember(projectId, studentId);
  }
}
