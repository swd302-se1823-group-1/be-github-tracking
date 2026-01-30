import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IEnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentAggregate } from '../../domain/aggregates/enrollment.aggregate';
import { EnrollmentMapper } from '../mappers/enrollment.mapper';

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(enrollment: EnrollmentAggregate): Promise<EnrollmentAggregate> {
    const data = EnrollmentMapper.toPersistence(enrollment);

    const newEnrollment = await this.prisma.enrollment.create({
      data: data as any,
    });
    return EnrollmentMapper.toDomain(newEnrollment);
  }

  async exists(classId: string, studentId: string): Promise<boolean> {
    const count = await this.prisma.enrollment.count({
      where: {
        class_id: classId,
        student_id: studentId,
        deleted_at: null,
      },
    });
    return count > 0;
  }
}
