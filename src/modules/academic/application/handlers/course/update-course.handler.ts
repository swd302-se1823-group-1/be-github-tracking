import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateCourseCommand } from '../../commands/course/update-course.command';
import { ICourseRepository } from '../../../domain/repositories/course.repository';
import { CourseAggregate } from '../../../domain/aggregates/course.aggregate';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler implements ICommandHandler<
  UpdateCourseCommand,
  CourseAggregate
> {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateCourseCommand): Promise<CourseAggregate> {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    course.update({
      name: command.name,
      updatedBy: command.updatedBy,
    });

    return this.courseRepository.update(course);
  }
}
