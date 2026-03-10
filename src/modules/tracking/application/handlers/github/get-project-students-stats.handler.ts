import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetProjectStudentsStatsQuery } from '../../queries/github/get-project-students-stats.query';

export interface ProjectStudentStatsResult {
  studentId: string;
  role: string;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
}

@QueryHandler(GetProjectStudentsStatsQuery)
export class GetProjectStudentsStatsHandler implements IQueryHandler<
  GetProjectStudentsStatsQuery,
  ProjectStudentStatsResult[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetProjectStudentsStatsQuery,
  ): Promise<ProjectStudentStatsResult[]> {
    const { projectId } = query;

    // 1. Fetch all members of this project
    const members = await this.prisma.projectMember.findMany({
      where: {
        project_id: projectId,
        deleted_at: null,
      },
      select: {
        id: true,
        student_id: true,
        role: true,
      },
    });

    if (!members.length) {
      return [];
    }

    const memberIds = members.map((m) => m.id);

    // 2. Aggregate stats grouped by project_member_id
    const groupedStats = await this.prisma.commit.groupBy({
      by: ['project_member_id'],
      where: {
        project_member_id: { in: memberIds },
      },
      _count: {
        id: true,
      },
      _sum: {
        additions: true,
        deletions: true,
        files_changed: true,
      },
    });

    // 3. Map aggregates back to members
    const statsMap = new Map<
      string,
      {
        _count: { id: number };
        _sum: {
          additions: number | null;
          deletions: number | null;
          files_changed: number | null;
        };
      }
    >();
    groupedStats.forEach((stat) => {
      if (stat.project_member_id) {
        // Prisma group by return type doesn't perfectly match our strict map definition without cast or explicit definition but we can assume structure
        statsMap.set(stat.project_member_id, stat as any);
      }
    });

    // 4. Format final result
    return members.map((member) => {
      const stat = statsMap.get(member.id);
      return {
        studentId: member.student_id,
        role: member.role,
        totalCommits: stat?._count?.id || 0,
        totalAdditions: stat?._sum?.additions || 0,
        totalDeletions: stat?._sum?.deletions || 0,
        totalFilesChanged: stat?._sum?.files_changed || 0,
      };
    });
  }
}
