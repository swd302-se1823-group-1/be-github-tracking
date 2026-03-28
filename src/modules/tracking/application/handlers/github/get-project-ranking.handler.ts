import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetProjectRankingQuery } from '../../queries/github/get-project-ranking.query';

export interface ProjectRankingResult {
  projectId: string;
  classRank: number;
  totalProjectsInClass: number;
  percentile: number;
  evaluation: 'EXCELLENT' | 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';
}

@QueryHandler(GetProjectRankingQuery)
export class GetProjectRankingHandler
  implements IQueryHandler<GetProjectRankingQuery, ProjectRankingResult>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProjectRankingQuery): Promise<ProjectRankingResult> {
    const { projectId } = query;

    // 1. Find the class that this project belongs to
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { class_id: true },
    });

    if (!project) {
      return {
        projectId,
        classRank: 0,
        totalProjectsInClass: 0,
        percentile: 0,
        evaluation: 'BELOW_AVERAGE',
      };
    }

    // 2. Get all projects in the same class
    const classProjects = await this.prisma.project.findMany({
      where: { class_id: project.class_id, deleted_at: null },
      select: { id: true },
    });

    if (!classProjects.length) {
      return {
        projectId,
        classRank: 1,
        totalProjectsInClass: 1,
        percentile: 100,
        evaluation: 'EXCELLENT',
      };
    }

    const allProjectIds = classProjects.map((p) => p.id);

    // 3. Get all members for these projects
    const allMembers = await this.prisma.projectMember.findMany({
      where: {
        project_id: { in: allProjectIds },
        deleted_at: null,
      },
      select: { id: true, project_id: true },
    });

    const memberToProject = new Map<string, string>();
    allMembers.forEach((m) => memberToProject.set(m.id, m.project_id));

    const projectCommitCount = new Map<string, number>();
    allProjectIds.forEach((id) => projectCommitCount.set(id, 0));

    // 4. Aggregate commit counts per project
    const commitAggs = await this.prisma.commit.groupBy({
      by: ['project_member_id'],
      where: { project_member_id: { in: Array.from(memberToProject.keys()) } },
      _count: { id: true },
    });

    commitAggs.forEach((agg) => {
      const pid = memberToProject.get(agg.project_member_id);
      if (pid) {
        projectCommitCount.set(
          pid,
          (projectCommitCount.get(pid) ?? 0) + agg._count.id,
        );
      }
    });

    // 5. Rank projects descending by commit count
    const ranked = Array.from(projectCommitCount.entries()).sort(
      ([, a], [, b]) => b - a,
    );

    const totalProjectsInClass = ranked.length;
    const classRank = ranked.findIndex(([id]) => id === projectId) + 1;

    // percentile = % of projects this project is better than
    const percentile =
      totalProjectsInClass > 1
        ? Math.round(
            ((totalProjectsInClass - classRank) / (totalProjectsInClass - 1)) *
              1000,
          ) / 10
        : 100;

    let evaluation: 'EXCELLENT' | 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';
    if (percentile >= 75) {
      evaluation = 'EXCELLENT';
    } else if (percentile >= 50) {
      evaluation = 'ABOVE_AVERAGE';
    } else if (percentile >= 25) {
      evaluation = 'AVERAGE';
    } else {
      evaluation = 'BELOW_AVERAGE';
    }

    return { projectId, classRank, totalProjectsInClass, percentile, evaluation };
  }
}
