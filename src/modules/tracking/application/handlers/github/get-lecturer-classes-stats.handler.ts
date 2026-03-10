import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetLecturerClassesStatsQuery } from '../../queries/github/get-lecturer-classes-stats.query';

export interface LecturerClassesStatsResult {
  classId: string;
  classCode: string;
  className: string;
  totalStudents: number;
  totalProjects: number;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
}

@QueryHandler(GetLecturerClassesStatsQuery)
export class GetLecturerClassesStatsHandler implements IQueryHandler<
  GetLecturerClassesStatsQuery,
  LecturerClassesStatsResult[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetLecturerClassesStatsQuery,
  ): Promise<LecturerClassesStatsResult[]> {
    const { lecturerId } = query;

    // 1. Fetch all classes for this lecturer with enrollments and projects included
    const classes = await this.prisma.class.findMany({
      where: {
        lecturer_id: lecturerId,
        deleted_at: null,
      },
      select: {
        id: true,
        class_code: true,
        class_name: true,
        _count: {
          select: {
            enrollments: true,
            projects: {
              where: {
                deleted_at: null,
              },
            },
          },
        },
        projects: {
          where: {
            deleted_at: null,
          },
          select: {
            project_members: {
              where: {
                deleted_at: null,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!classes.length) {
      return [];
    }

    // Prepare structure to map project_member_ids to their respective classes
    // So later we can sum up stats per class
    const memberIdToClassIdMap = new Map<string, string>();

    classes.forEach((c) => {
      c.projects.forEach((p) => {
        p.project_members.forEach((pm) => {
          memberIdToClassIdMap.set(pm.id, c.id);
        });
      });
    });

    const allMemberIds = Array.from(memberIdToClassIdMap.keys());

    // 2. Aggregate all commits for all members across all classes
    let groupedStats: {
      _count: { id: number };
      _sum: {
        additions: number | null;
        deletions: number | null;
        files_changed: number | null;
      };
      project_member_id: string;
    }[] = [];

    if (allMemberIds.length > 0) {
      const result = await this.prisma.commit.groupBy({
        by: ['project_member_id'],
        where: {
          project_member_id: { in: allMemberIds },
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
      // Cast the prisma output since groupBy signature mapping is complex
      groupedStats = result;
    }

    // 3. Summarize the groupedStats per class
    const classStatsMap = new Map<
      string,
      {
        totalCommits: number;
        totalAdditions: number;
        totalDeletions: number;
        totalFilesChanged: number;
      }
    >();

    // Initializing structure with 0s for every class
    classes.forEach((c) => {
      classStatsMap.set(c.id, {
        totalCommits: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalFilesChanged: 0,
      });
    });

    // Populate actuals
    groupedStats.forEach((stat) => {
      const classId = memberIdToClassIdMap.get(stat.project_member_id);
      if (classId) {
        const currentStats = classStatsMap.get(classId)!;
        currentStats.totalCommits += stat._count.id;
        currentStats.totalAdditions += stat._sum.additions || 0;
        currentStats.totalDeletions += stat._sum.deletions || 0;
        currentStats.totalFilesChanged += stat._sum.files_changed || 0;
      }
    });

    // 4. Return formatted data
    return classes.map((c) => {
      const stats = classStatsMap.get(c.id)!;
      return {
        classId: c.id,
        classCode: c.class_code,
        className: c.class_name,
        totalStudents: c._count.enrollments,
        totalProjects: c._count.projects,
        totalCommits: stats.totalCommits,
        totalAdditions: stats.totalAdditions,
        totalDeletions: stats.totalDeletions,
        totalFilesChanged: stats.totalFilesChanged,
      };
    });
  }
}
