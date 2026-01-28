import { Class as PrismaClass } from '@generated/prisma/client';
import { ClassAggregate } from '../../domain/aggregates/class.aggregate';

export class ClassMapper {
  static toDomain(prisma: PrismaClass): ClassAggregate {
    return ClassAggregate.reconstitute(
      prisma.id,
      prisma.semester_id,
      prisma.enroll_password,
      prisma.lecturer_id,
      prisma.course_id,
      prisma.class_code,
      prisma.class_name,
      prisma.description,
      prisma.created_by_id,
      prisma.updated_by_id,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPersistence(aggregate: ClassAggregate) {
    return {
      semester_id: aggregate.semesterId,
      enroll_password: aggregate.enrollPassword,
      lecturer_id: aggregate.lecturerId,
      course_id: aggregate.courseId,
      class_code: aggregate.classCode,
      class_name: aggregate.className,
      description: aggregate.description,
      created_by_id: aggregate.createdBy,
      updated_by_id: aggregate.updatedBy,
      created_at: aggregate.createdAt,
      updated_at: aggregate.updatedAt,
    };
  }
}
