import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferLeaderCommand } from '../../commands/project/transfer-leader.command';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectMemberRole } from '@generated/prisma/client';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(TransferLeaderCommand)
export class TransferLeaderHandler implements ICommandHandler<
  TransferLeaderCommand,
  void
> {
  constructor(private readonly prisma: PrismaService) {}

  @Transactional()
  async execute(command: TransferLeaderCommand): Promise<void> {
    const { projectId, newLeaderStudentId, currentLeaderId } = command;

    // 1. Fetch project to ensure it exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, deleted_at: null },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. Fetch all active members
    const members = await this.prisma.projectMember.findMany({
      where: { project_id: projectId, deleted_at: null, is_active: true },
      include: {
        student: {
          select: { id: true }, // The student.id is what maps to the user id
        },
      },
    });

    // 3. Find the current leader's membership record in this project
    const currentLeaderMember = members.find(
      (m) => m.student_id === currentLeaderId,
    );
    if (!currentLeaderMember || currentLeaderMember.role !== 'LEADER') {
      throw new ForbiddenException(
        'Only the current project LEADER can transfer leadership.',
      );
    }

    // 4. Find the target new leader's membership record
    const newLeaderMember = members.find(
      (m) => m.student_id === newLeaderStudentId,
    );
    if (!newLeaderMember) {
      throw new NotFoundException(
        'The specified new leader is not an active member of this project.',
      );
    }

    if (newLeaderMember.role === 'LEADER') {
      throw new BadRequestException(
        'The specified user is already the LEADER of this project.',
      );
    }

    // 5. Execute Atomic Transaction to swap roles
    await this.prisma.$transaction(async (tx) => {
      // Demote current leader
      await tx.projectMember.update({
        where: { id: currentLeaderMember.id },
        data: { role: ProjectMemberRole.MEMBER },
      });

      // Promote new leader
      await tx.projectMember.update({
        where: { id: newLeaderMember.id },
        data: { role: ProjectMemberRole.LEADER },
      });
    });
  }
}
