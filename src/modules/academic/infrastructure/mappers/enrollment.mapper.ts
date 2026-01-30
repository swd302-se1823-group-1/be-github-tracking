import { Enrollment as PrismaEnrollment } from '@generated/prisma/client';
import { EnrollmentAggregate } from '../../domain/aggregates/enrollment.aggregate';

export class EnrollmentMapper {
  static toDomain(prisma: PrismaEnrollment): EnrollmentAggregate {
    return EnrollmentAggregate.reconstitute(
      prisma.id,
      prisma.class_id,
      prisma.student_id,
      prisma.enrolled_at,
      prisma.created_by_id,
      prisma.updated_by_id,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPersistence(aggregate: EnrollmentAggregate) {
    return {
      // id is autoincrement, typically handled by DB on create if not provided or 0
      class_id: aggregate.classId,
      student_id: aggregate.studentId,
      enrolled_at: aggregate.enrolledAt,
      created_by_id: aggregate.createdBy,
      updated_by_id: aggregate.updatedBy,
      created_at: aggregate.createdAt,
      updated_at: aggregate.updatedAt,
    };
  }
}
