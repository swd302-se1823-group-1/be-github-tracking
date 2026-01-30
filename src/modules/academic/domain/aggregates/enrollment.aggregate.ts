import { AggregateRoot } from '@nestjs/cqrs';
import { generateId } from '@/shared/utils/uuid';

export class EnrollmentAggregate extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly classId: string,
    public readonly studentId: string,
    public readonly enrolledAt: Date,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super();
  }

  static create(
    classId: string,
    studentId: string,
    createdBy?: string,
  ): EnrollmentAggregate {
    return new EnrollmentAggregate(
      generateId(),
      classId,
      studentId,
      new Date(),
      createdBy || null,
      createdBy || null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    classId: string,
    studentId: string,
    enrolledAt: Date,
    createdBy: string | null,
    updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): EnrollmentAggregate {
    return new EnrollmentAggregate(
      id,
      classId,
      studentId,
      enrolledAt,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
    );
  }
}
