import { AggregateRoot } from '@nestjs/cqrs';

export class SemesterAggregate extends AggregateRoot {
  private constructor(
    public readonly id: bigint,
    public readonly code: string,
    public readonly name: string,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly isActive: boolean,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super();
  }

  static create(
    code: string,
    name: string,
    startDate?: Date,
    endDate?: Date,
    isActive?: boolean,
    createdBy?: string,
  ): SemesterAggregate {
    return new SemesterAggregate(
      BigInt(0), // Temporary ID, persistence will assign real one or use UUID if schema changed. Schema uses BigInt autoincrement.
      code,
      name,
      startDate || null,
      endDate || null,
      isActive ?? true,
      createdBy || null,
      createdBy || null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    id: bigint,
    code: string,
    name: string,
    startDate: Date | null,
    endDate: Date | null,
    isActive: boolean,
    createdBy: string | null,
    updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): SemesterAggregate {
    return new SemesterAggregate(
      id,
      code,
      name,
      startDate,
      endDate,
      isActive,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
    );
  }
}
