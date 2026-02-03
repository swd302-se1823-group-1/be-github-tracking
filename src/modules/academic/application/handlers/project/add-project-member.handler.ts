import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { IEnrollmentRepository } from '@/modules/academic/domain/repositories/enrollment.repository';
import { AddProjectMemberCommand } from '@/modules/academic/application/commands/project/add-project-member.command';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import {
  NotFoundException,
  BusinessRuleViolationException,
} from '@/shared/exceptions';
import { ProjectMemberEntity } from '@/modules/academic/domain/entities/project-member.entity';

@CommandHandler(AddProjectMemberCommand)
export class AddProjectMemberHandler implements ICommandHandler<AddProjectMemberCommand> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: AddProjectMemberCommand): Promise<void> {
    const { projectId, studentId, role } = command;

    // 1. Load aggregate (with all members for business rule validation)
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project', projectId);
    }

    // 2. Check student exists (infrastructure concern)
    const student = await this.prisma.student.findUnique({
      where: { id: studentId, deleted_at: null },
    });
    if (!student) {
      throw new NotFoundException('Student', studentId);
    }

    // 3. Check enrollment (domain service / application concern)
    const isEnrolled = await this.enrollmentRepository.exists(
      project.classId,
      studentId,
    );
    if (!isEnrolled) {
      throw new BusinessRuleViolationException(
        'Student must be enrolled in class before joining project',
        'Student is not enrolled in the class. Students must be enrolled in the class before joining a project.',
        {
          studentId,
          classId: project.classId,
          projectId,
        },
      );
    }

    // 4. Check if student already has a project in this class (cross-aggregate rule)
    const existingProject =
      await this.projectRepository.getStudentProjectInClass(
        project.classId,
        studentId,
      );
    if (existingProject) {
      throw new BusinessRuleViolationException(
        'One project per student per class',
        `Student is already a member of project "${existingProject.name}" in this class. A student can only belong to one project per class.`,
        {
          studentId,
          classId: project.classId,
          existingProjectId: existingProject.id,
          existingProjectName: existingProject.name,
        },
      );
    }

    // 5. Aggregate validates and enforces its own invariants
    // (duplicate check, member limit) - Business logic in domain!
    const newMember = new ProjectMemberEntity(
      crypto.randomUUID(), // or generate via factory
      projectId,
      studentId,
      role,
      true, // isActive
      new Date(), // joinedAt
      null, // deletedAt
      null, // deletedBy
      command.userId, // createdBy
      command.userId, // updatedBy
    );

    project.addMember(newMember); // Aggregate enforces business rules here!

    // 6. Persist via repository
    await this.projectRepository.addMember(projectId, studentId, role);
  }
}
