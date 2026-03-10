import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetProjectCommitTimelineQuery } from '../../queries/github/get-project-commit-timeline.query';
import {
  ProjectCommitTimelineResponseDto,
  TimelineItemDto,
  TimelineStudentDto,
} from '../../../presentation/dtos/github/project-commit-timeline-response.dto';

@QueryHandler(GetProjectCommitTimelineQuery)
export class GetProjectCommitTimelineHandler implements IQueryHandler<
  GetProjectCommitTimelineQuery,
  ProjectCommitTimelineResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetProjectCommitTimelineQuery,
  ): Promise<ProjectCommitTimelineResponseDto> {
    const { projectId, days } = query;

    // 1. Fetch project members
    const members = await this.prisma.projectMember.findMany({
      where: {
        project_id: projectId,
        deleted_at: null,
        is_active: true,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!members.length) {
      return { timeline: [] };
    }

    const memberMap = new Map<string, { studentId: string; name: string }>();
    members.forEach((m) => {
      memberMap.set(m.id, {
        studentId: m.student?.student_code || 'N/A',
        name: m.student?.user?.full_name || 'Unknown',
      });
    });

    const memberIds = Array.from(memberMap.keys());

    // 2. Fetch commits within the last 'days'
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const commits = await this.prisma.commit.findMany({
      where: {
        project_member_id: { in: memberIds },
        committed_date: {
          gte: startDate,
        },
      },
      select: {
        project_member_id: true,
        committed_date: true,
      },
      orderBy: {
        committed_date: 'asc',
      },
    });

    if (!commits.length) {
      return { timeline: [] };
    }

    // 3. Group by Timestamp -> StudentId -> Count
    // Use the timestamp of the start of the day for grouping
    const timelineMap = new Map<number, Map<string, number>>();

    commits.forEach((commit) => {
      if (!commit.committed_date) return;

      const dateStr = commit.committed_date.toISOString().split('T')[0];
      const dayTimestamp = new Date(dateStr).getTime();

      const memberId = commit.project_member_id;

      if (!timelineMap.has(dayTimestamp)) {
        timelineMap.set(dayTimestamp, new Map<string, number>());
      }

      const dayMap = timelineMap.get(dayTimestamp)!;
      dayMap.set(memberId, (dayMap.get(memberId) || 0) + 1);
    });

    // 4. Format Output
    const timeline: TimelineItemDto[] = Array.from(timelineMap.entries())
      .map(([timestamp, dayMap]) => {
        const students: TimelineStudentDto[] = Array.from(dayMap.entries())
          .map(([memberId, count]) => {
            const memberInfo = memberMap.get(memberId);
            return {
              studentId: memberInfo?.studentId || 'N/A',
              name: memberInfo?.name || 'Unknown',
              commits: count,
            };
          })
          .sort((a, b) => b.commits - a.commits); // Sort students by most commits

        return {
          date: timestamp,
          students,
        };
      })
      .sort((a, b) => a.date - b.date); // Sort timeline array by ascending timestamp

    return { timeline };
  }
}
