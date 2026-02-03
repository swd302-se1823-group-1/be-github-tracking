import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { AddProjectMemberCommand } from '@/modules/academic/application/commands/project/add-project-member.command';

@CommandHandler(AddProjectMemberCommand)
export class AddProjectMemberHandler implements ICommandHandler<AddProjectMemberCommand> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(command: AddProjectMemberCommand): Promise<void> {
    const { projectId, studentId, role } = command;

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Validation: Check if student is already in the project?
    // Repository method might handle uniqueness constraint errors.
    // Also need to check if student exists in the class (Enrollment check)?
    // Keeping it simple for now, trusting repository layer to throw constraints or succeed.

    try {
      await this.projectRepository.addMember(projectId, studentId, role);
    } catch (error) {
      // Ideally parse unique constraint violation
      throw new BadRequestException(
        `Failed to add member to project. Student might already be a member. ${error}`,
      );
    }
  }
}
