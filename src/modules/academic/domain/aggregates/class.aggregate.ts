import { AggregateRoot } from '@nestjs/cqrs';
import { generateId } from '@/shared/utils/uuid';

export class ClassAggregate extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public semesterId: bigint,
    public enrollPassword: string,
    public lecturerId: string,
    public readonly courseId: string,
    public readonly classCode: string,
    public className: string,
    public description: string | null,
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

  update(params: {
    className?: string;
    description?: string;
    enrollPassword?: string;
    lecturerId?: string;
    updatedBy?: string;
  }): void {
    if (params.className !== undefined) this.className = params.className;
    if (params.description !== undefined) this.description = params.description;
    if (params.enrollPassword !== undefined)
      this.enrollPassword = params.enrollPassword;
    if (params.lecturerId !== undefined) this.lecturerId = params.lecturerId;
    this.updatedAt = new Date();
    this.updatedBy = params.updatedBy ?? null;
  }

  static create(
    semesterId: bigint,
    enrollPassword: string,
    lecturerId: string,
    courseId: string,
    classCode: string,
    className: string,
    description?: string,
    createdBy?: string,
  ): ClassAggregate {
    return new ClassAggregate(
      generateId(),
      semesterId,
      enrollPassword,
      lecturerId,
      courseId,
      classCode,
      className,
      description || null,
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
    semesterId: bigint,
    enrollPassword: string,
    lecturerId: string,
    courseId: string,
    classCode: string,
    className: string,
    description: string | null,
    deletedAt: Date | null,
    deletedBy: string | null,
    createdBy: string | null,
    updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): ClassAggregate {
    return new ClassAggregate(
      id,
      semesterId,
      enrollPassword,
      lecturerId,
      courseId,
      classCode,
      className,
      description,
      deletedAt,
      deletedBy,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
    );
  }
}
