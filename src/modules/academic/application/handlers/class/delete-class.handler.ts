import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteClassCommand } from '../../commands/class/delete-class.command';
import { Inject } from '@nestjs/common';
import { IClassRepository } from '@/modules/academic/domain/repositories/class.repository';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(DeleteClassCommand)
export class DeleteClassHandler implements ICommandHandler<DeleteClassCommand> {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: IClassRepository,
  ) {}

  @Transactional()
  async execute(command: DeleteClassCommand): Promise<void> {
    const { id, deletedBy } = command;
    await this.classRepository.delete(id, deletedBy);
  }
}
