import { Semester as PrismaSemester } from '@generated/prisma/client';
import { SemesterAggregate } from '../../domain/aggregates/semester.aggregate';

export class SemesterMapper {
  static toDomain(prisma: PrismaSemester): SemesterAggregate {
    return SemesterAggregate.reconstitute(
      prisma.id,
      prisma.code,
      prisma.name,
      prisma.start_date,
      prisma.end_date,
      prisma.is_active,
      prisma.created_by_id,
      prisma.updated_by_id,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPersistence(aggregate: SemesterAggregate) {
    return {
      code: aggregate.code,
      name: aggregate.name,
      start_date: aggregate.startDate,
      end_date: aggregate.endDate,
      is_active: aggregate.isActive,
      created_by_id: aggregate.createdBy,
      updated_by_id: aggregate.updatedBy,
      created_at: aggregate.createdAt,
      updated_at: aggregate.updatedAt,
    };
  }
}
