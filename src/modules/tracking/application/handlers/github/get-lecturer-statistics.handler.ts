import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetLecturerStatisticsQuery } from '../../queries/github/get-lecturer-statistics.query';
import { LecturerStatisticsResponseDto } from '../../../presentation/dtos/github/lecturer-statistics-response.dto';

@QueryHandler(GetLecturerStatisticsQuery)
export class GetLecturerStatisticsHandler implements IQueryHandler<
  GetLecturerStatisticsQuery,
  LecturerStatisticsResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetLecturerStatisticsQuery,
  ): Promise<LecturerStatisticsResponseDto> {
    const { lecturerId, semesterCode, classId } = query;

    interface ClassFilter {
      lecturer_id: string;
      deleted_at: null;
      id?: string;
      semester?: { code: string };
    }

    // 1. Fetch Classes based on filters
    const classWhere: ClassFilter = {
      lecturer_id: lecturerId,
      deleted_at: null,
    };

    if (classId) {
      classWhere.id = classId;
    }

    if (semesterCode) {
      // Need to find semester by code first or join
      classWhere.semester = {
        code: semesterCode,
      };
    }

    const classes = await this.prisma.class.findMany({
      where: classWhere,
      include: {
        projects: {
          where: { deleted_at: null },
          include: {
            project_members: {
              where: { deleted_at: null, is_active: true },
              include: {
                student: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });

    if (!classes.length) {
      return this.emptyResponse();
    }

    // 2. Flatten project members
    const memberMap = new Map<
      string,
      {
        memberId: string;
        studentId: string;
        name: string;
        projectName: string;
        commits: number;
        linesAdded: number;
        linesDeleted: number;
      }
    >();

    classes.forEach((c) => {
      c.projects.forEach((p) => {
        const projectName = p.name || `Project ${p.id.substring(0, 8)}`;
        p.project_members.forEach((pm) => {
          memberMap.set(pm.id, {
            memberId: pm.id,
            studentId: pm.student?.student_code || 'N/A',
            name: pm.student?.user?.full_name || 'Unknown',
            projectName,
            commits: 0,
            linesAdded: 0,
            linesDeleted: 0,
          });
        });
      });
    });

    const memberIds = Array.from(memberMap.keys());

    if (memberIds.length === 0) {
      return this.emptyResponse();
    }

    // 3. Fetch Commits
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
      orderBy: { committed_date: 'desc' },
    });

    // 4. Aggregate Data
    let totalCommits = 0;
    let totalLinesAdded = 0;
    let totalLinesDeleted = 0;

    const trendsMap = new Map<
      string,
      { linesAdded: number; linesDeleted: number }
    >();
    const heatmapMap = new Map<string, number>();

    commits.forEach((commit) => {
      const pm = memberMap.get(commit.project_member_id);
      if (pm) {
        pm.commits++;
        pm.linesAdded += commit.additions || 0;
        pm.linesDeleted += commit.deletions || 0;

        totalCommits++;
        totalLinesAdded += commit.additions || 0;
        totalLinesDeleted += commit.deletions || 0;
      }

      if (commit.committed_date) {
        const dateStr = commit.committed_date.toISOString().split('T')[0];

        // Trends
        if (!trendsMap.has(dateStr)) {
          trendsMap.set(dateStr, { linesAdded: 0, linesDeleted: 0 });
        }
        trendsMap.get(dateStr)!.linesAdded += commit.additions || 0;
        trendsMap.get(dateStr)!.linesDeleted += commit.deletions || 0;

        // Heatmap
        heatmapMap.set(dateStr, (heatmapMap.get(dateStr) || 0) + 1);
      }
    });

    const activeStudents = Array.from(memberMap.values()).filter(
      (m) => m.commits > 0,
    ).length;

    // 5. Format Trends & Heatmap
    const trends = Array.from(trendsMap.entries())
      .map(([dateStr, data]) => ({
        date: new Date(dateStr).getTime(),
        linesAdded: data.linesAdded,
        linesDeleted: data.linesDeleted,
      }))
      .sort((a, b) => a.date - b.date);

    const heatmap = Array.from(heatmapMap.entries())
      .map(([dateStr, count]) => ({
        date: new Date(dateStr).getTime(),
        count,
      }))
      .sort((a, b) => a.date - b.date);

    // 6. Format Top Contributors
    const topContributors = Array.from(memberMap.values())
      .sort((a, b) => b.commits - a.commits || b.linesAdded - a.linesAdded)
      .slice(0, 10) // Top 10
      .map((pm, index) => ({
        id: pm.memberId,
        rank: index + 1,
        name: pm.name,
        studentId: pm.studentId,
        projectName: pm.projectName,
        commits: pm.commits,
        linesAdded: pm.linesAdded,
        linesDeleted: pm.linesDeleted,
      }));

    return {
      stats: {
        totalCommits,
        totalLinesAdded,
        totalLinesDeleted,
        activeStudents,
      },
      trends,
      heatmap,
      topContributors,
    };
  }

  private emptyResponse(): LecturerStatisticsResponseDto {
    return {
      stats: {
        totalCommits: 0,
        totalLinesAdded: 0,
        totalLinesDeleted: 0,
        activeStudents: 0,
      },
      trends: [],
      heatmap: [],
      topContributors: [],
    };
  }
}
