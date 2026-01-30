import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ISemesterRepository } from '@/modules/academic/domain/repositories/semester.repository';
import { UpdateSemesterCommand } from '../../commands/semester/update-semester.command';
import { SemesterAggregate } from '@/modules/academic/domain/aggregates/semester.aggregate';

@CommandHandler(UpdateSemesterCommand)
export class UpdateSemesterHandler implements ICommandHandler<UpdateSemesterCommand> {
  constructor(
    @Inject(ISemesterRepository)
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  async execute(command: UpdateSemesterCommand): Promise<SemesterAggregate> {
    const { id, code, name, startDate, endDate, isActive, updatedBy } = command;

    const semester = await this.semesterRepository.findById(id);
    if (!semester) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }

    semester.update(
      code,
      name,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      isActive,
      updatedBy,
    );

    return this.semesterRepository.update(semester);
  }
}
