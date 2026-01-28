import { Course as PrismaCourse } from '@generated/prisma/client';
import { CourseAggregate } from '../../domain/aggregates/course.aggregate';

export class CourseMapper {
  static toDomain(prisma: PrismaCourse): CourseAggregate {
    return CourseAggregate.reconstitute(
      prisma.id,
      prisma.code,
      prisma.name,
      prisma.created_by_id,
      prisma.updated_by_id,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPersistence(aggregate: CourseAggregate) {
    return {
      code: aggregate.code,
      name: aggregate.name,
      created_by_id: aggregate.createdBy,
      updated_by_id: aggregate.updatedBy,
      created_at: aggregate.createdAt,
      updated_at: aggregate.updatedAt,
    };
  }
}
