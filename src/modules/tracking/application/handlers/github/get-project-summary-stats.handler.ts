import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetProjectSummaryStatsQuery } from '../../queries/github/get-project-summary-stats.query';

export interface ProjectSummaryStatsResult {
  projectId: string;
  totalCommits: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  averageCommitsPerStudent: number;
  memberCount: number;
}

@QueryHandler(GetProjectSummaryStatsQuery)
export class GetProjectSummaryStatsHandler
  implements IQueryHandler<GetProjectSummaryStatsQuery, ProjectSummaryStatsResult>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProjectSummaryStatsQuery): Promise<ProjectSummaryStatsResult> {
    const { projectId } = query;

    const members = await this.prisma.projectMember.findMany({
      where: { project_id: projectId, deleted_at: null },
      select: { id: true },
    });

    const memberCount = members.length;

    if (memberCount === 0) {
      return {
        projectId,
        totalCommits: 0,
        totalLinesAdded: 0,
        totalLinesDeleted: 0,
        averageCommitsPerStudent: 0,
        memberCount: 0,
      };
    }

    const memberIds = members.map((m) => m.id);

    const agg = await this.prisma.commit.aggregate({
      where: { project_member_id: { in: memberIds } },
      _count: { id: true },
      _sum: { additions: true, deletions: true },
    });

    const totalCommits = agg._count.id ?? 0;
    const totalLinesAdded = agg._sum.additions ?? 0;
    const totalLinesDeleted = agg._sum.deletions ?? 0;
    const averageCommitsPerStudent =
      memberCount > 0
        ? Math.round((totalCommits / memberCount) * 100) / 100
        : 0;

    return {
      projectId,
      totalCommits,
      totalLinesAdded,
      totalLinesDeleted,
      averageCommitsPerStudent,
      memberCount,
    };
  }
}
