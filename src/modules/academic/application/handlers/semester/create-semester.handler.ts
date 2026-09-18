import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSemesterCommand } from '../../commands/semester/create-semester.command';
import { ISemesterRepository } from '@/modules/academic/domain/repositories/semester.repository';
import { SemesterAggregate } from '@/modules/academic/domain/aggregates/semester.aggregate';
import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(CreateSemesterCommand)
export class CreateSemesterHandler implements ICommandHandler<
  CreateSemesterCommand,
  SemesterAggregate
> {
  constructor(
    @Inject(ISemesterRepository)
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  @Transactional()
  async execute(command: CreateSemesterCommand): Promise<SemesterAggregate> {
    const semester = SemesterAggregate.create(
      command.code,
      command.name,
      command.startDate ? new Date(command.startDate) : undefined,
      command.endDate ? new Date(command.endDate) : undefined,
      command.isActive,
      command.createdBy,
    );
    return this.semesterRepository.create(semester);
  }
}
