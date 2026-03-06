import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EnrollStudentCommand } from '../../commands/enrollment/enroll-student.command';
import {
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { IEnrollmentRepository } from '@/modules/academic/domain/repositories/enrollment.repository';
import { IClassRepository } from '@/modules/academic/domain/repositories/class.repository';
import { EnrollmentAggregate } from '@/modules/academic/domain/aggregates/enrollment.aggregate';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(EnrollStudentCommand)
export class EnrollStudentHandler implements ICommandHandler<EnrollStudentCommand> {
  constructor(
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IClassRepository)
    private readonly classRepository: IClassRepository,
  ) {}

  @Transactional()
  async execute(command: EnrollStudentCommand): Promise<void> {
    const { classId, enrollPassword, studentId } = command;

    // 1. Check if class exists
    const clazz = await this.classRepository.findById(classId);
    if (!clazz) {
      throw new NotFoundException('Class not found');
    }

    // 2. Validate enrollment password
    if (clazz.enrollPassword !== enrollPassword) {
      throw new ForbiddenException('Invalid enrollment password');
    }

    // 4. Check if class is full
    const currentEnrollments =
      await this.classRepository.countActiveEnrollments(classId);
    if (currentEnrollments >= clazz.maxStudents) {
      throw new BadRequestException('Class is full');
    }

    // 5. Create enrollment
    const enrollment = EnrollmentAggregate.create(
      classId,
      studentId,
      studentId,
    );
    await this.enrollmentRepository.create(enrollment);
  }
}
