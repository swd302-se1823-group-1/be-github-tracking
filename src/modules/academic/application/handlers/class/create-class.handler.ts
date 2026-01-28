import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateClassCommand } from '../../commands/class/create-class.command';
import { IClassRepository } from '@/modules/academic/domain/repositories/class.repository';
import { ClassAggregate } from '@/modules/academic/domain/aggregates/class.aggregate';
import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(CreateClassCommand)
export class CreateClassHandler implements ICommandHandler<
  CreateClassCommand,
  ClassAggregate
> {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: IClassRepository,
  ) {}

  @Transactional()
  async execute(command: CreateClassCommand): Promise<ClassAggregate> {
    const clazz = ClassAggregate.create(
      BigInt(command.semesterId),
      command.enrollPassword,
      command.lecturerId,
      command.courseId,
      command.classCode,
      command.className,
      command.description,
      command.createdBy,
    );
    return this.classRepository.create(clazz);
  }
}
