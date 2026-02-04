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
import { VerifyGitHubAccountDto } from '@/modules/academic/presentation/dtos/github/verify-github-account.dto';
import { GithubMappingResponseDto } from '@/modules/academic/presentation/dtos/github/github-mapping-response.dto';
import { VerifyGitHubAccountCommand } from '@/modules/academic/application/commands/github/verify-github-account.command';
import { GetGitHubMappingQuery } from '@/modules/academic/application/queries/github/get-github-mapping.query';
import { GithubMappingAggregate } from '@/modules/academic/domain/aggregates/github-mapping.aggregate';

@ApiTags('GitHub')
@Controller('github')
export class GitHubController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('verify')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify GitHub account for current student' })
  @ApiResponse({
    status: 201,
    description: 'GitHub account verified successfully',
    type: GithubMappingResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'GitHub account already linked to another student',
  })
  async verifyGitHubAccount(
    @Body() dto: VerifyGitHubAccountDto,
    @ActiveUser('id') studentId: string,
  ): Promise<GithubMappingResponseDto> {
    const mapping = await this.commandBus.execute<
      VerifyGitHubAccountCommand,
      GithubMappingAggregate
    >(new VerifyGitHubAccountCommand(studentId, dto.code, dto.redirectUri));

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
