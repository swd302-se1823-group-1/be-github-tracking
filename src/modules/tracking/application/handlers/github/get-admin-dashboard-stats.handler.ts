import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GetAdminDashboardStatsQuery } from '../../queries/github/get-admin-dashboard-stats.query';
import { AdminDashboardStatsResponseDto } from '../../../presentation/dtos/github/admin-dashboard-stats-response.dto';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { ForbiddenException } from '@nestjs/common';

@QueryHandler(GetAdminDashboardStatsQuery)
export class GetAdminDashboardStatsHandler implements IQueryHandler<
  GetAdminDashboardStatsQuery,
  AdminDashboardStatsResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetAdminDashboardStatsQuery,
  ): Promise<AdminDashboardStatsResponseDto> {
    const { role } = query;

    // Extra security check just in case
    if (role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only administrators can view these stats');
    }

    // 1. Fetch Macros
    const [
      totalLecturers,
      totalStudents,
      totalClasses,
      totalProjects,
      totalCommits,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { role: UserRole.LECTURER, deleted_at: null },
      }),
      this.prisma.user.count({
        where: { role: UserRole.STUDENT, deleted_at: null },
      }),
      this.prisma.class.count({
        where: { deleted_at: null },
      }),
      this.prisma.project.count({
        where: { deleted_at: null },
      }),
      this.prisma.commit.count(),
    ]);

    // 2. Fetch Growth Trend (Grouping Projects by Month/Date)
    const projects = await this.prisma.project.findMany({
      where: { deleted_at: null },
      select: { created_at: true },
    });

    const students = await this.prisma.student.findMany({
      select: { created_at: true },
    });

    const trendMap = new Map<
      string,
      { date: number; newStudents: number; newProjects: number }
    >();

    // Process Projects
    projects.forEach((p) => {
      const monthStr = p.created_at.toISOString().slice(0, 7) + '-01'; // Group by month
      if (!trendMap.has(monthStr)) {
        trendMap.set(monthStr, {
          date: new Date(monthStr).getTime(),
          newStudents: 0,
          newProjects: 0,
        });
      }
      trendMap.get(monthStr)!.newProjects++;
    });

    // Process Students
    students.forEach((s) => {
      const monthStr = s.created_at.toISOString().slice(0, 7) + '-01'; // Group by month
      if (!trendMap.has(monthStr)) {
        trendMap.set(monthStr, {
          date: new Date(monthStr).getTime(),
          newStudents: 0,
          newProjects: 0,
        });
      }
      trendMap.get(monthStr)!.newStudents++;
    });

    const growthTrend = Array.from(trendMap.values()).sort(
      (a, b) => a.date - b.date,
    );

    // 3. System Health (Mock / Estimate)
    const activeRepos = await this.prisma.repository.count({
      where: {
        url: {
          not: '',
        },
      },
    });

    return {
      totalLecturers,
      totalStudents,
      totalClasses,
      totalProjects,
      totalCommits,
      growthTrend,
      systemHealth: {
        activeRepos,
        totalRepoSizeKb: activeRepos * 15000, // Fake ~15MB per repo just for visualization
      },
    };
  }
}
