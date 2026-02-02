import { Course as PrismaCourse } from '@generated/prisma/client';
import { CourseAggregate } from '../../domain/aggregates/course.aggregate';

export class CourseMapper {
  static toDomain(prisma: PrismaCourse): CourseAggregate {
    return CourseAggregate.reconstitute(
      prisma.id,
      prisma.code,
      prisma.name,
      prisma.deleted_at,
      prisma.deleted_by_id,
      prisma.created_by_id,
      prisma.updated_by_id,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPersistence(aggregate: CourseAggregate) {
    return {
      id: aggregate.id,
      code: aggregate.code,
      name: aggregate.name,
      deleted_at: aggregate.deletedAt,
      deleted_by_id: aggregate.deletedBy,
      created_by_id: aggregate.createdBy,
      updated_by_id: aggregate.updatedBy,
      created_at: aggregate.createdAt,
      updated_at: aggregate.updatedAt,
    };
  }
}
