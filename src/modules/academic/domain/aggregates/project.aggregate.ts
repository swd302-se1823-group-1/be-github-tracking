import { AggregateRoot } from '@nestjs/cqrs';
import { ProjectMemberEntity } from '../entities/project-member.entity';
import { generateId } from '@/shared/utils/uuid';

export class ProjectAggregate extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly classId: string,
    public name: string | null,
    public topic: string | null,
    public description: string | null,
    public avatarUrl: string | null,
    public members: ProjectMemberEntity[] = [],
    public isActive: boolean = true, // Derived from logic or explicit field? Schema doesn't have is_active for Project, checking schema... Schema has deleted_at.
    public deletedAt?: Date | null,
    public deletedBy?: string | null,
    public createdAt?: Date,
    public createdBy?: string | null,
    public updatedAt?: Date,
    public updatedBy?: string | null,
  ) {
    super();
  }

  static create(
    classId: string,
    name: string | null,
    topic: string | null,
    description: string | null,
    avatarUrl: string | null,
    createdBy: string,
  ): ProjectAggregate {
    const id = generateId();
    return new ProjectAggregate(
      id,
      classId,
      name,
      topic,
      description,
      avatarUrl,
      [],
      true,
      null,
      null,
      new Date(),
      createdBy,
      new Date(),
      createdBy,
    );
  }

  update(
    name: string | null,
    topic: string | null,
    description: string | null,
    avatarUrl: string | null,
    updatedBy: string,
  ): void {
    this.name = name;
    this.topic = topic;
    this.description = description;
    this.avatarUrl = avatarUrl;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  delete(deletedBy: string): void {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.isActive = false; // Logic level flag
    this.updatedBy = deletedBy;
    this.updatedAt = new Date();
  }
}
