import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
}
