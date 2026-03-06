import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteProjectCommand } from '../../commands/project/delete-project.command';
import { Inject } from '@nestjs/common';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler implements ICommandHandler<DeleteProjectCommand> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  @Transactional()
  async execute(command: DeleteProjectCommand): Promise<void> {
    const { id, deletedBy } = command;
    await this.projectRepository.delete(id, deletedBy);
  }
}
