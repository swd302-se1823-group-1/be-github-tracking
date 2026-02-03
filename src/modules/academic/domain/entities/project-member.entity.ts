export class ProjectMemberEntity {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly studentId: string,
    public role: string, // 'LEADER' | 'MEMBER'
    public isActive: boolean,
    public joinedAt: Date,
    public deletedAt?: Date | null,
    public deletedBy?: string | null,
    public createdBy?: string | null,
    public updatedBy?: string | null,
  ) {}

  // Factory method, business logic methods can be added here
}
