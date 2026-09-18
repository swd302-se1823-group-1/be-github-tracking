import { AggregateRoot } from '@nestjs/cqrs';
import { generateId } from '@/shared/utils/uuid';

export class CourseAggregate extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly code: string,
    public name: string,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public createdBy: string | null,
    public updatedBy: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {
    super();
  }

  delete(deletedBy: string): void {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.updatedAt = new Date();
    this.updatedBy = deletedBy;
  }

  update(params: { name?: string; updatedBy?: string }): void {
    if (params.name !== undefined) this.name = params.name;
    this.updatedAt = new Date();
    this.updatedBy = params.updatedBy ?? null;
  }

  static create(
    code: string,
    name: string,
    createdBy?: string,
  ): CourseAggregate {
    return new CourseAggregate(
      generateId(),
      code,
      name,
      null,
      null,
      createdBy || null,
      createdBy || null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    code: string,
    name: string,
    deletedAt: Date | null,
    deletedBy: string | null,
    createdBy: string | null,
    updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): CourseAggregate {
    return new CourseAggregate(
      id,
      code,
      name,
      deletedAt,
      deletedBy,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
    );
  }
}
