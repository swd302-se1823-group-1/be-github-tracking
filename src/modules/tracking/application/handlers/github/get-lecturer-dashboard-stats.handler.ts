import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetLecturerDashboardStatsQuery } from '../../queries/github/get-lecturer-dashboard-stats.query';
import { LecturerDashboardStatsResponseDto } from '../../../presentation/dtos/github/lecturer-dashboard-stats-response.dto';

@QueryHandler(GetLecturerDashboardStatsQuery)
export class GetLecturerDashboardStatsHandler implements IQueryHandler<
  GetLecturerDashboardStatsQuery,
  LecturerDashboardStatsResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetLecturerDashboardStatsQuery,
  ): Promise<LecturerDashboardStatsResponseDto> {
    const { lecturerId } = query;
    const REQUIRED_COMMITS = 20; // Default threshold

    // 1. Fetch classes, projects, members, and student details
    const classes = await this.prisma.class.findMany({
      where: {
        lecturer_id: lecturerId,
        deleted_at: null,
      },
      include: {
        projects: {
          where: { deleted_at: null },
          include: {
            project_members: {
              where: { deleted_at: null, is_active: true },
              include: {
                student: {
                  include: {
                    user: true, // to get full name
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!classes.length) {
      return this.emptyResponse(0);
    }

    let totalProjects = 0;
    const projectMembersMap = new Map<
      string,
      {
        memberId: string;
        studentId: string;
        studentCode: string;
        name: string;
        groupName: string;
      }
    >();

    classes.forEach((c) => {
      totalProjects += c.projects.length;
      c.projects.forEach((p) => {
        const groupName = p.name || `Project ${p.id.substring(0, 8)}`;
        p.project_members.forEach((pm) => {
          projectMembersMap.set(pm.id, {
            memberId: pm.id,
            studentId: pm.student.student_code || 'N/A',
            studentCode: pm.student.student_code || 'N/A',
            name: pm.student.user?.full_name || 'Unknown',
            groupName: `${groupName} - ${c.class_code}`,
          });
        });
      });
    });

    const memberIds = Array.from(projectMembersMap.keys());
    const totalStudents = memberIds.length;

    if (totalStudents === 0) {
      return this.emptyResponse(totalProjects);
    }

    // 2. Fetch all commits for these members
    const commits = await this.prisma.commit.findMany({
      where: {
        project_member_id: { in: memberIds },
      },
      select: {
        project_member_id: true,
        committed_date: true,
        additions: true,
        deletions: true,
      },
      orderBy: {
        committed_date: 'desc',
      },
    });

    // 3. Process In-Memory Data
    const studentStats = new Map<
      string,
      {
        commits: number;
        additions: number;
        lastCommitDate: string | null;
      }
    >();

    memberIds.forEach((id) =>
      studentStats.set(id, { commits: 0, additions: 0, lastCommitDate: null }),
    );

    const commitsTrendMap = new Map<string, number>();

    commits.forEach((commit) => {
      // Accumulate student stats
      const stats = studentStats.get(commit.project_member_id);
      if (stats) {
        stats.commits += 1;
        stats.additions += commit.additions || 0;
        if (!stats.lastCommitDate && commit.committed_date) {
          stats.lastCommitDate = commit.committed_date
            .toISOString()
            .split('T')[0];
        }
      }

      // Accumulate Trend
      if (commit.committed_date) {
        const dateStr = commit.committed_date.toISOString().split('T')[0];
        commitsTrendMap.set(dateStr, (commitsTrendMap.get(dateStr) || 0) + 1);
      }
    });

    // Generate student commits array
    const studentCommits = Array.from(projectMembersMap.values()).map((pm) => {
      const stats = studentStats.get(pm.memberId)!;
      let status = 'DANGER'; // < 60%
      if (stats.commits >= REQUIRED_COMMITS) {
        status = 'MEETS_REQUIREMENTS';
      } else if (stats.commits >= REQUIRED_COMMITS * 0.6) {
        status = 'WARNING'; // >= 60% but < 100%
      }

      return {
        id: pm.memberId,
        name: pm.name,
        studentId: pm.studentCode,
        group: pm.groupName,
        totalCommits: stats.commits,
        requiredCommits: REQUIRED_COMMITS,
        lastCommitDate: stats.lastCommitDate,
        status,
        linesOfCode: stats.additions, // Internal use for TopStudents
      };
    });

    // Generate top students
    const sortedStudents = [...studentCommits].sort(
      (a, b) =>
        b.totalCommits - a.totalCommits || b.linesOfCode - a.linesOfCode,
    );

    const topStudents = sortedStudents.slice(0, 5).map((s, index) => ({
      id: s.id,
      name: s.name,
      commits: s.totalCommits,
      linesOfCode: s.linesOfCode,
      rank: index + 1,
    }));

    // Clean up internal linesOfCode from standard response if needed (or keep it, the DTO handles it)

    // Calculate Summaries
    let warningStudents = 0;
    let notEnoughCommits = 0;
    let belowSixtyPercent = 0;
    let meetsRequirements = 0;

    studentCommits.forEach((sc) => {
      if (sc.status === 'MEETS_REQUIREMENTS') {
        meetsRequirements++;
      } else if (sc.status === 'WARNING') {
        warningStudents++;
        notEnoughCommits++;
      } else {
        // DANGER
        warningStudents++;
        notEnoughCommits++;
        belowSixtyPercent++;
      }
    });

    const activeStudents = studentCommits.filter(
      (sc) => sc.totalCommits > 0,
    ).length;

    // Format commits trend (sort by date)
    const commitsTrend = Array.from(commitsTrendMap.entries())
      .map(([dateStr, count]) => ({
        date: new Date(dateStr).getTime(),
        count,
      }))
      .sort((a, b) => a.date - b.date);

    return {
      totalCommits: commits.length,
      totalProjects,
      activeStudents,
      warningStudents,
      commitsTrend,
      topStudents,
      studentCommits,
      summary: {
        notEnoughCommits,
        belowSixtyPercent,
        meetsRequirements,
        totalStudents,
      },
    };
  }

  private emptyResponse(totalProjects = 0): LecturerDashboardStatsResponseDto {
    return {
      totalCommits: 0,
      totalProjects,
      activeStudents: 0,
      warningStudents: 0,
      commitsTrend: [],
      topStudents: [],
      studentCommits: [],
      summary: {
        notEnoughCommits: 0,
        belowSixtyPercent: 0,
        meetsRequirements: 0,
        totalStudents: 0,
      },
    };
  }
}
