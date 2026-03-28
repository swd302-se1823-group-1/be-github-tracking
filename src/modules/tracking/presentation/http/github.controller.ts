import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ActiveUser, ResponseMessage, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { RolesGuard } from '@/modules/auth/infrastructure/guards';
import { FirebaseService } from '@/modules/auth/infrastructure/services/firebase.service';
import { GithubMappingResponseDto } from '@/modules/tracking/presentation/dtos/github/github-mapping-response.dto';
import { VerifyGitHubFirebaseDto } from '@/modules/tracking/presentation/dtos/github/verify-github-firebase.dto';
import { VerifyGitHubAccountCommand } from '@/modules/tracking/application/commands/github/verify-github-account.command';
import { GetGitHubMappingQuery } from '@/modules/tracking/application/queries/github/get-github-mapping.query';
import { GithubMappingAggregate } from '@/modules/tracking/domain/aggregates/github-mapping.aggregate';
import { SyncRepositoryCommand } from '@/modules/tracking/application/commands/github/sync-repository.command';
import { GetStudentStatsQuery } from '@/modules/tracking/application/queries/github/get-student-stats.query';
import { StudentStatsResponseDto } from '@/modules/tracking/presentation/dtos/github/student-stats-response.dto';
import { StudentStatsResult } from '@/modules/tracking/application/handlers/github/get-student-stats.handler';
import { GetProjectStudentsStatsQuery } from '@/modules/tracking/application/queries/github/get-project-students-stats.query';
import { ProjectStudentStatsItemDto } from '@/modules/tracking/presentation/dtos/github/project-students-stats-response.dto';
import { ProjectStudentStatsResult } from '@/modules/tracking/application/handlers/github/get-project-students-stats.handler';
import { GetLecturerClassesStatsQuery } from '@/modules/tracking/application/queries/github/get-lecturer-classes-stats.query';
import { LecturerClassesStatsItemDto } from '@/modules/tracking/presentation/dtos/github/lecturer-classes-stats-response.dto';
import { LecturerClassesStatsResult } from '@/modules/tracking/application/handlers/github/get-lecturer-classes-stats.handler';
import { GetLecturerDashboardStatsQuery } from '@/modules/tracking/application/queries/github/get-lecturer-dashboard-stats.query';
import { LecturerDashboardStatsResponseDto } from '@/modules/tracking/presentation/dtos/github/lecturer-dashboard-stats-response.dto';
import { AdminDashboardStatsResponseDto } from '@/modules/tracking/presentation/dtos/github/admin-dashboard-stats-response.dto';
import { GetAdminDashboardStatsQuery } from '@/modules/tracking/application/queries/github/get-admin-dashboard-stats.query';
import { LecturerStatisticsResponseDto } from '@/modules/tracking/presentation/dtos/github/lecturer-statistics-response.dto';
import { GetLecturerStatisticsQuery } from '@/modules/tracking/application/queries/github/get-lecturer-statistics.query';
import { ProjectCommitTimelineResponseDto } from '@/modules/tracking/presentation/dtos/github/project-commit-timeline-response.dto';
import { GetProjectCommitTimelineQuery } from '@/modules/tracking/application/queries/github/get-project-commit-timeline.query';
import { GetProjectSummaryStatsQuery } from '@/modules/tracking/application/queries/github/get-project-summary-stats.query';
import { ProjectSummaryStatsResponseDto } from '@/modules/tracking/presentation/dtos/github/project-summary-stats-response.dto';
import { ProjectSummaryStatsResult } from '@/modules/tracking/application/handlers/github/get-project-summary-stats.handler';
import { GetProjectStudentAlertsQuery } from '@/modules/tracking/application/queries/github/get-project-student-alerts.query';
import { StudentAlertItemDto } from '@/modules/tracking/presentation/dtos/github/student-alert-response.dto';
import { StudentAlertResult } from '@/modules/tracking/application/handlers/github/get-project-student-alerts.handler';
import { GetProjectRankingQuery } from '@/modules/tracking/application/queries/github/get-project-ranking.query';
import { ProjectRankingResponseDto } from '@/modules/tracking/presentation/dtos/github/project-ranking-response.dto';
import { ProjectRankingResult } from '@/modules/tracking/application/handlers/github/get-project-ranking.handler';

@ApiTags('GitHub')
@ApiBearerAuth()
@Controller('github')
export class GitHubController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post('verify')
  @Throttle({ auth: {} })
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  @ResponseMessage('GitHub account verified successfully')
  @ApiOperation({ summary: 'Verify GitHub account via Firebase ID Token' })
  @ApiResponse({ status: 201, type: GithubMappingResponseDto })
  async verifyGitHub(
    @ActiveUser('id') studentId: string,
    @Body() dto: VerifyGitHubFirebaseDto,
  ): Promise<GithubMappingResponseDto> {
    const githubProfile = await this.firebaseService.verifyGitHubIdToken(
      dto.idToken,
    );

    // Firebase ID token cannot carry the GitHub OAuth access token.
    // The client extracts it via GithubAuthProvider.credentialFromResult() and sends it separately.
    const profileWithToken = {
      ...githubProfile,
      accessToken: dto.githubAccessToken,
    };

    const mapping = await this.commandBus.execute<
      VerifyGitHubAccountCommand,
      GithubMappingAggregate
    >(new VerifyGitHubAccountCommand(studentId, profileWithToken));

    return new GithubMappingResponseDto(mapping);
  }

  @Get('mapping')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get current student GitHub mapping' })
  @ApiResponse({
    status: 200,
    description: 'GitHub mapping retrieved',
    type: GithubMappingResponseDto,
  })
  async getGitHubMapping(
    @ActiveUser('id') studentId: string,
  ): Promise<GithubMappingResponseDto | null> {
    const mapping = await this.queryBus.execute<
      GetGitHubMappingQuery,
      GithubMappingAggregate | null
    >(new GetGitHubMappingQuery(studentId));

    return mapping ? new GithubMappingResponseDto(mapping) : null;
  }

  @Post('repositories/:id/sync')
  @Throttle({ sync: {} })
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ResponseMessage('Repository synchronization triggered')
  @ApiOperation({ summary: 'Manually trigger repository synchronization' })
  @ApiResponse({ status: 201, description: 'Sync triggered' })
  async syncRepository(@Param('id') repositoryId: string): Promise<void> {
    await this.commandBus.execute(new SyncRepositoryCommand(repositoryId));
  }

  @Get('stats/project/:projectId/student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.LECTURER, UserRole.STUDENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get commit statistics for a student in a project' })
  @ApiResponse({
    status: 200,
    description: 'Stats retrieved',
    type: StudentStatsResponseDto,
  })
  async getStudentStats(
    @Param('projectId') projectId: string,
    @Param('studentId') studentId: string,
  ): Promise<StudentStatsResponseDto> {
    const stats = await this.queryBus.execute<
      GetStudentStatsQuery,
      StudentStatsResult
    >(new GetStudentStatsQuery(projectId, studentId));

    return new StudentStatsResponseDto(stats);
  }

  @Get('stats/project/:projectId')
  @Roles(UserRole.ADMIN, UserRole.LECTURER, UserRole.STUDENT)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get commit statistics for all students in a project',
  })
  @ApiResponse({
    status: 200,
    description: 'Project students stats retrieved',
    type: [ProjectStudentStatsItemDto],
  })
  async getProjectStudentsStats(
    @Param('projectId') projectId: string,
  ): Promise<ProjectStudentStatsItemDto[]> {
    const statsList = await this.queryBus.execute<
      GetProjectStudentsStatsQuery,
      ProjectStudentStatsResult[]
    >(new GetProjectStudentsStatsQuery(projectId));

    // Map each result to DTO
    return statsList.map((stat) => {
      const dto = new ProjectStudentStatsItemDto();
      dto.studentId = stat.studentId;
      dto.role = stat.role;
      dto.totalCommits = stat.totalCommits;
      dto.totalAdditions = stat.totalAdditions;
      dto.totalDeletions = stat.totalDeletions;
      dto.totalFilesChanged = stat.totalFilesChanged;
      return dto;
    });
  }

  @Get('stats/classes')
  @Roles(UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get commit statistics for all classes taught by the lecturer',
  })
  @ApiResponse({
    status: 200,
    description: 'Lecturer classes stats retrieved',
    type: [LecturerClassesStatsItemDto],
  })
  async getLecturerClassesStats(
    @ActiveUser('id') lecturerId: string,
  ): Promise<LecturerClassesStatsItemDto[]> {
    const statsList = await this.queryBus.execute<
      GetLecturerClassesStatsQuery,
      LecturerClassesStatsResult[]
    >(new GetLecturerClassesStatsQuery(lecturerId));

    // Map each result to DTO
    return statsList.map((stat) => {
      const dto = new LecturerClassesStatsItemDto();
      dto.classId = stat.classId;
      dto.classCode = stat.classCode;
      dto.className = stat.className;
      dto.totalStudents = stat.totalStudents;
      dto.totalProjects = stat.totalProjects;
      dto.totalCommits = stat.totalCommits;
      dto.totalAdditions = stat.totalAdditions;
      dto.totalDeletions = stat.totalDeletions;
      dto.totalFilesChanged = stat.totalFilesChanged;
      return dto;
    });
  }

  @Get('stats/dashboard/lecturer')
  @Roles(UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get comprehensive dashboard statistics for the lecturer',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: LecturerDashboardStatsResponseDto,
  })
  async getLecturerDashboardStats(
    @ActiveUser('id') lecturerId: string,
  ): Promise<LecturerDashboardStatsResponseDto> {
    return this.queryBus.execute<
      GetLecturerDashboardStatsQuery,
      LecturerDashboardStatsResponseDto
    >(new GetLecturerDashboardStatsQuery(lecturerId));
  }

  @Get('stats/dashboard/admin')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get comprehensive macro statistics for the Admin Dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard statistics retrieved successfully',
    type: AdminDashboardStatsResponseDto,
  })
  async getAdminDashboardStats(
    @ActiveUser('role') role: UserRole,
  ): Promise<AdminDashboardStatsResponseDto> {
    return this.queryBus.execute<
      GetAdminDashboardStatsQuery,
      AdminDashboardStatsResponseDto
    >(new GetAdminDashboardStatsQuery(role));
  }

  @Get('stats/statistics')
  @Roles(UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get detailed statistics for the lecturer statistics page',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed statistics retrieved successfully',
    type: LecturerStatisticsResponseDto,
  })
  async getLecturerStatistics(
    @ActiveUser('id') lecturerId: string,
    @Query('semesterCode') semesterCode?: string,
    @Query('classId') classId?: string,
  ): Promise<LecturerStatisticsResponseDto> {
    return this.queryBus.execute<
      GetLecturerStatisticsQuery,
      LecturerStatisticsResponseDto
    >(new GetLecturerStatisticsQuery(lecturerId, semesterCode, classId));
  }

  @Get('stats/project/:projectId/timeline')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
    UserRole.LECTURER,
    UserRole.STUDENT,
  )
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get project commit timeline over the last N days',
  })
  @ApiResponse({
    status: 200,
    description: 'Project timeline retrieved successfully',
    type: ProjectCommitTimelineResponseDto,
  })
  async getProjectCommitTimeline(
    @Param('projectId') projectId: string,
    @Query('days') days?: string,
  ): Promise<ProjectCommitTimelineResponseDto> {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.queryBus.execute<
      GetProjectCommitTimelineQuery,
      ProjectCommitTimelineResponseDto
    >(new GetProjectCommitTimelineQuery(projectId, daysNumber));
  }

  // -----------------------------------------------------------------------
  // Feature 1: Project Summary Statistics
  // -----------------------------------------------------------------------
  @Get('stats/project/:projectId/summary')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get aggregated statistics for a project' })
  @ApiResponse({
    status: 200,
    description: 'Project summary stats retrieved',
    type: ProjectSummaryStatsResponseDto,
  })
  async getProjectSummaryStats(
    @Param('projectId') projectId: string,
  ): Promise<ProjectSummaryStatsResponseDto> {
    const result = await this.queryBus.execute<
      GetProjectSummaryStatsQuery,
      ProjectSummaryStatsResult
    >(new GetProjectSummaryStatsQuery(projectId));
    return result as ProjectSummaryStatsResponseDto;
  }

  // -----------------------------------------------------------------------
  // Feature 2: Smart Alerts & Inactivity
  // -----------------------------------------------------------------------
  @Get('stats/project/:projectId/students/alerts')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get inactivity alerts and contribution ratios per student' })
  @ApiQuery({ name: 'inactiveDays', required: false, description: 'Days without commit to consider inactive (default: 5)' })
  @ApiResponse({
    status: 200,
    description: 'Student alerts retrieved',
    type: [StudentAlertItemDto],
  })
  async getProjectStudentAlerts(
    @Param('projectId') projectId: string,
    @Query('inactiveDays') inactiveDays?: string,
  ): Promise<StudentAlertItemDto[]> {
    const days = inactiveDays ? parseInt(inactiveDays, 10) : 5;
    const results = await this.queryBus.execute<
      GetProjectStudentAlertsQuery,
      StudentAlertResult[]
    >(new GetProjectStudentAlertsQuery(projectId, days));
    return results as StudentAlertItemDto[];
  }

  // -----------------------------------------------------------------------
  // Feature 3: Project Class Ranking
  // -----------------------------------------------------------------------
  @Get('stats/project/:projectId/ranking')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get project ranking within its class (by commits)' })
  @ApiResponse({
    status: 200,
    description: 'Project ranking retrieved',
    type: ProjectRankingResponseDto,
  })
  async getProjectRanking(
    @Param('projectId') projectId: string,
  ): Promise<ProjectRankingResponseDto> {
    const result = await this.queryBus.execute<
      GetProjectRankingQuery,
      ProjectRankingResult
    >(new GetProjectRankingQuery(projectId));
    return result as ProjectRankingResponseDto;
  }
}
