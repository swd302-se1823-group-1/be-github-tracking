import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateClassCommand } from '../../commands/class/update-class.command';
import { IClassRepository } from '../../../domain/repositories/class.repository';
import { ClassAggregate } from '../../../domain/aggregates/class.aggregate';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(UpdateClassCommand)
export class UpdateClassHandler implements ICommandHandler<
  UpdateClassCommand,
  ClassAggregate
> {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: IClassRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateClassCommand): Promise<ClassAggregate> {
    const clazz = await this.classRepository.findById(command.id);

    if (!clazz) {
      throw new NotFoundException('Class not found');
    }

    clazz.update({
      className: command.className,
      description: command.description,
      enrollPassword: command.enrollPassword,
      lecturerId: command.lecturerId,
      updatedBy: command.updatedBy,
    });

    return this.classRepository.update(clazz);
  }
}
