import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
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
}
