import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetProjectStudentAlertsQuery } from '../../queries/github/get-project-student-alerts.query';

export interface StudentAlertResult {
  studentId: string;
  studentCode: string;
  name: string;
  commits: number;
  lastCommitDate: string | null;
  isInactive: boolean;
  contributionRatio: number;
  warningLevel: 'NONE' | 'LOW' | 'HIGH';
}

@QueryHandler(GetProjectStudentAlertsQuery)
export class GetProjectStudentAlertsHandler
  implements IQueryHandler<GetProjectStudentAlertsQuery, StudentAlertResult[]>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProjectStudentAlertsQuery): Promise<StudentAlertResult[]> {
    const { projectId, inactiveDays } = query;

    const members = await this.prisma.projectMember.findMany({
      where: { project_id: projectId, deleted_at: null },
      include: {
        student: { include: { user: true } },
      },
    });

    if (!members.length) return [];

    const memberIds = members.map((m) => m.id);
    const inactivityThreshold = new Date();
    inactivityThreshold.setDate(inactivityThreshold.getDate() - inactiveDays);

    // Fetch all commits for project members (only id, project_member_id, committed_date)
    const commits = await this.prisma.commit.findMany({
      where: { project_member_id: { in: memberIds } },
      select: { project_member_id: true, committed_date: true },
      orderBy: { committed_date: 'desc' },
    });

    const totalProjectCommits = commits.length;

    // Group commits by member
    const commitsByMember = new Map<string, { count: number; lastDate: Date | null }>();
    memberIds.forEach((id) => commitsByMember.set(id, { count: 0, lastDate: null }));

    commits.forEach((c) => {
      const entry = commitsByMember.get(c.project_member_id);
      if (!entry) return;
      entry.count++;
      if (!entry.lastDate && c.committed_date) {
        entry.lastDate = c.committed_date;
      }
    });

    return members.map((member) => {
      const stats = commitsByMember.get(member.id)!;
      const isInactive =
        !stats.lastDate || stats.lastDate < inactivityThreshold;
      const contributionRatio =
        totalProjectCommits > 0
          ? Math.round((stats.count / totalProjectCommits) * 10000) / 10000
          : 0;

      let warningLevel: 'NONE' | 'LOW' | 'HIGH' = 'NONE';
      if (isInactive && contributionRatio < 0.1) {
        warningLevel = 'HIGH';
      } else if (isInactive || contributionRatio < 0.15) {
        warningLevel = 'LOW';
      }

      return {
        studentId: member.student_id,
        studentCode: member.student?.student_code ?? 'N/A',
        name: member.student?.user?.full_name ?? 'Unknown',
        commits: stats.count,
        lastCommitDate: stats.lastDate
          ? stats.lastDate.toISOString()
          : null,
        isInactive,
        contributionRatio,
        warningLevel,
      };
    });
  }
}
