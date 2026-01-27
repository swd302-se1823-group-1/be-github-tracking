import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCourseCommand } from '../../commands/course/create-course.command';
import { ICourseRepository } from '@/modules/academic/domain/repositories/course.repository';
import { CourseAggregate } from '@/modules/academic/domain/aggregates/course.aggregate';
import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler implements ICommandHandler<
  CreateCourseCommand,
  CourseAggregate
> {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
  ) {}

  @Transactional()
  async execute(command: CreateCourseCommand): Promise<CourseAggregate> {
    const course = CourseAggregate.create(
      command.code,
      command.name,
      command.createdBy,
    );
    return this.courseRepository.create(course);
  }
}
