import { AggregateRoot } from '@nestjs/cqrs';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export class SemesterAggregate extends AggregateRoot {
  private constructor(
    public readonly id: bigint,
    public readonly code: string,
    public readonly name: string,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly isActive: boolean,
    public readonly deletedAt: Date | null,
    public readonly deletedBy: string | null,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super();
  }

  update(
    code?: string,
    name?: string,
    startDate?: Date,
    endDate?: Date,
    isActive?: boolean,
    updatedBy?: string,
  ): void {
    const that = this as Mutable<SemesterAggregate>;
    if (code !== undefined) that.code = code;
    if (name !== undefined) that.name = name;
    if (startDate !== undefined) that.startDate = startDate;
    if (endDate !== undefined) that.endDate = endDate;
    if (isActive !== undefined) that.isActive = isActive;
    if (updatedBy !== undefined) that.updatedBy = updatedBy;
    that.updatedAt = new Date();
  }

  delete(deletedBy: string): void {
    (this as Mutable<SemesterAggregate>).isActive = false;
    (this as Mutable<SemesterAggregate>).deletedAt = new Date();
    (this as Mutable<SemesterAggregate>).deletedBy = deletedBy;
    (this as Mutable<SemesterAggregate>).updatedAt = new Date();
    (this as Mutable<SemesterAggregate>).updatedBy = deletedBy;
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
      null,
      null,
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
    deletedAt: Date | null,
    deletedBy: string | null,
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
      deletedAt,
      deletedBy,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
    );
  }
}
