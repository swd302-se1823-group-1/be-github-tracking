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

@CommandHandler(EnrollStudentCommand)
export class EnrollStudentHandler implements ICommandHandler<EnrollStudentCommand> {
  constructor(
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IClassRepository)
    private readonly classRepository: IClassRepository,
  ) {}

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

    // 3. Check if already enrolled
    const exists = await this.enrollmentRepository.exists(classId, studentId);
    if (exists) {
      throw new BadRequestException('Student already enrolled in this class');
    }

    // 4. Create enrollment
    const enrollment = EnrollmentAggregate.create(
      classId,
      studentId,
      studentId,
    );
    await this.enrollmentRepository.create(enrollment);
  }
}
