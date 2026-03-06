import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetStudentStatsQuery } from '../../queries/github/get-student-stats.query';

export interface StudentStatsResult {
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
}

@QueryHandler(GetStudentStatsQuery)
export class GetStudentStatsHandler implements IQueryHandler<
  GetStudentStatsQuery,
  StudentStatsResult
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetStudentStatsQuery): Promise<StudentStatsResult> {
    const { projectId, studentId } = query;

    // Find the project member record for this student in this project
    const member = await this.prisma.projectMember.findUnique({
      where: {
        project_id_student_id: {
          project_id: projectId,
          student_id: studentId,
        },
      },
    });

    if (!member) {
      return {
        totalCommits: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalFilesChanged: 0,
      };
    }

    // Aggregate stats from commits table
    const stats = await this.prisma.commit.aggregate({
      where: {
        project_member_id: member.id,
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

    return {
      totalCommits: stats._count.id || 0,
      totalAdditions: stats._sum.additions || 0,
      totalDeletions: stats._sum.deletions || 0,
      totalFilesChanged: stats._sum.files_changed || 0,
    };
  }
}
