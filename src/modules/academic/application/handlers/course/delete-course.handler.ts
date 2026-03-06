import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCourseCommand } from '../../commands/course/delete-course.command';
import { Inject } from '@nestjs/common';
import { ICourseRepository } from '@/modules/academic/domain/repositories/course.repository';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(DeleteCourseCommand)
export class DeleteCourseHandler implements ICommandHandler<DeleteCourseCommand> {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
  ) {}

  @Transactional()
  async execute(command: DeleteCourseCommand): Promise<void> {
    const { id, deletedBy } = command;
    await this.courseRepository.delete(id, deletedBy);
  }
}
