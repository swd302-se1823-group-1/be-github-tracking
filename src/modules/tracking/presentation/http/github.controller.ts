import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { UseGuards, Req, Res, BadRequestException } from '@nestjs/common';
import { type Request, type Response } from 'express';
import {
  GitHubVerifyGuard,
  JwtAccessGuard,
  RolesGuard,
} from '@/modules/auth/infrastructure/guards';
import { GitHubProfile } from '@/modules/auth/infrastructure/services/github.service';
import { GithubMappingResponseDto } from '@/modules/tracking/presentation/dtos/github/github-mapping-response.dto';
import { VerifyGitHubAccountCommand } from '@/modules/tracking/application/commands/github/verify-github-account.command';
import { GetGitHubMappingQuery } from '@/modules/tracking/application/queries/github/get-github-mapping.query';
import { GithubMappingAggregate } from '@/modules/tracking/domain/aggregates/github-mapping.aggregate';
import { ConfigService } from '@nestjs/config';

@ApiTags('GitHub')
@Controller('github')
export class GitHubController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService,
  ) {}

  @Get('verify')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, RolesGuard, GitHubVerifyGuard)
  @ApiOperation({ summary: 'Initiate GitHub verification flow' })
  async initiateGitHubVerify() {}

  @Get('callback')
  @UseGuards(GitHubVerifyGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback for verification' })
  async githubVerifyCallback(@Req() req: Request, @Res() res: Response) {
    const githubProfile = req.user as unknown as GitHubProfile;
    const studentId = req.query.state as string;

    if (!studentId) {
      throw new BadRequestException('Student ID not found in OAuth state');
    }

    await this.commandBus.execute(
      new VerifyGitHubAccountCommand(studentId, githubProfile),
    );
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    // Redirect back to frontend or return success
    return res.redirect(`${frontendUrl}/profile?github=success`);
  }

  @Post('verify')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Verify GitHub account using pre-fetched profile (e.g. from mobile)',
  })
  @ApiResponse({
    status: 201,
    description: 'GitHub account verified successfully',
    type: GithubMappingResponseDto,
  })
  async verifyGitHubAccount(
    @Body() dto: { githubProfile: GitHubProfile },
    @ActiveUser('id') studentId: string,
  ): Promise<GithubMappingResponseDto> {
    const mapping = await this.commandBus.execute<
      VerifyGitHubAccountCommand,
      GithubMappingAggregate
    >(new VerifyGitHubAccountCommand(studentId, dto.githubProfile));

    return new GithubMappingResponseDto(mapping);
  }

  @Get('mapping')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
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
