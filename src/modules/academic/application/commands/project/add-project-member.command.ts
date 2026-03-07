import { ProjectMemberRole } from '@generated/prisma/client';

export class AddProjectMemberCommand {
  constructor(
    public readonly projectId: string,
    public readonly members: { studentId: string; role: ProjectMemberRole }[],
    public readonly userId: string, // Who is performing the action (for audit/auth)
  ) {}
}
