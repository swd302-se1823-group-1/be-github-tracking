import { AggregateRoot } from '@nestjs/cqrs';

export class EnrollmentAggregate extends AggregateRoot {
  private constructor(
    public readonly id: bigint,
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
      BigInt(0), // Placeholder, actual ID assigned by DB
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
    id: bigint,
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
