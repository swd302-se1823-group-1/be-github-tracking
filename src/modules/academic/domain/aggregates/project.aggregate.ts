import { AggregateRoot } from '@nestjs/cqrs';
import { ProjectMemberEntity } from '../entities/project-member.entity';
import { RepositoryAggregate } from './repository.aggregate';
import { generateId } from '@/shared/utils/uuid';
import { BusinessRuleViolationException } from '@/shared/exceptions';

export class ProjectAggregate extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly classId: string,
    public name: string | null,
    public topic: string | null,
    public description: string | null,
    public avatarUrl: string | null,
    private _members: ProjectMemberEntity[],
    public isActive: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public createdAt: Date,
    public createdBy: string | null,
    public updatedAt: Date,
    public updatedBy: string | null,
    public classInfo?: { code: string; name: string },
    public maxMembers: number = 5,
    public repositories: RepositoryAggregate[] = [],
  ) {
    super();
  }

  get members(): ProjectMemberEntity[] {
    return this._members;
  }

  /**
   * Get count of active members
   */
  getActiveMemberCount(): number {
    return this._members.filter((m) => m.isActive && !m.deletedAt).length;
  }

  /**
   * Check if student is already a member of this project
   */
  hasMember(studentId: string): boolean {
    return this._members.some(
      (m) => m.studentId === studentId && m.isActive && !m.deletedAt,
    );
  }

  /**
   * Validate if a student can be added to this project
   * Throws domain exceptions if business rules are violated
   */
  validateCanAddMember(studentId: string): void {
    // Check if student is already a member
    if (this.hasMember(studentId)) {
      throw new BusinessRuleViolationException(
        'Duplicate project membership',
        'Student is already a member of this project.',
        {
          studentId,
          projectId: this.id,
        },
      );
    }

    // Check member limit
    const currentCount = this.getActiveMemberCount();
    if (currentCount >= this.maxMembers) {
      throw new BusinessRuleViolationException(
        'Project member limit exceeded',
        `Project has reached the maximum member limit of ${this.maxMembers}.`,
        {
          projectId: this.id,
          currentMemberCount: currentCount,
          maxMembers: this.maxMembers,
        },
      );
    }
  }

  /**
   * Add a member to the project
   * This is a domain operation that enforces business rules
   */
  addMember(member: ProjectMemberEntity): void {
    this.validateCanAddMember(member.studentId);
    this._members.push(member);
  }

  /**
   * Remove a member from the project (soft delete)
   */
  removeMember(studentId: string): void {
    const member = this._members.find(
      (m) => m.studentId === studentId && m.isActive && !m.deletedAt,
    );

    if (!member) {
      throw new BusinessRuleViolationException(
        'Member not found',
        'Student is not a member of this project.',
        {
          studentId,
          projectId: this.id,
        },
      );
    }

    // Soft delete is handled at entity level or repository level
  }

  static create(
    classId: string,
    name: string,
    topic: string,
    description: string | null,
    avatarUrl: string | null,
    createdBy: string,
    maxMembers: number = 5,
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
      undefined,
      maxMembers,
    );
  }

  update(
    name: string | null,
    topic: string | null,
    description: string | null,
    avatarUrl: string | null,
    updatedBy: string,
  ): void {
    this.name = name ?? this.name;
    this.topic = topic ?? this.topic;
    this.description = description;
    this.avatarUrl = avatarUrl;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  delete(deletedBy: string): void {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.isActive = false;
    this.updatedBy = deletedBy;
    this.updatedAt = new Date();
  }
}
