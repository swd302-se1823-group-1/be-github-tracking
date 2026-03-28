import { Injectable, Inject } from '@nestjs/common';

import { IGithubMappingRepository } from '@/modules/tracking/domain/repositories/github-mapping.repository';
import { GithubMappingAggregate } from '@/modules/tracking/domain/aggregates/github-mapping.aggregate';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GithubMapping } from '@generated/prisma/client';
import { IEncryptionService, ENCRYPTION_SERVICE } from '@/shared';

@Injectable()
export class PrismaGithubMappingRepository implements IGithubMappingRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: IEncryptionService,
  ) {}

  async findByStudentId(
    studentId: string,
  ): Promise<GithubMappingAggregate | null> {
    const mapping = await this.prisma.githubMapping.findFirst({
      where: {
        student_id: studentId,
        deleted_at: null,
      },
    });

    return mapping ? this.toDomain(mapping) : null;
  }

  async findByStudentIds(
    studentIds: string[],
  ): Promise<GithubMappingAggregate[]> {
    const mappings = await this.prisma.githubMapping.findMany({
      where: {
        student_id: { in: studentIds },
        deleted_at: null,
      },
    });

    return mappings.map((m) => this.toDomain(m));
  }

  async findByGitHubEmail(
    email: string,
  ): Promise<GithubMappingAggregate | null> {
    const mapping = await this.prisma.githubMapping.findFirst({
      where: {
        github_email: email,
        deleted_at: null,
      },
    });

    return mapping ? this.toDomain(mapping) : null;
  }

  async findByGitHubUsername(
    username: string,
  ): Promise<GithubMappingAggregate | null> {
    const mapping = await this.prisma.githubMapping.findFirst({
      where: {
        github_username: username,
        deleted_at: null,
      },
    });

    return mapping ? this.toDomain(mapping) : null;
  }

  async findByGitHubId(
    githubId: string,
  ): Promise<GithubMappingAggregate | null> {
    const mapping = await this.prisma.githubMapping.findFirst({
      where: {
        github_id: githubId,
        deleted_at: null,
      },
    });

    return mapping ? this.toDomain(mapping) : null;
  }

  async save(mapping: GithubMappingAggregate): Promise<GithubMappingAggregate> {
    if (!mapping.accessToken) {
      throw new Error(
        'GitHub access token is required to save a GithubMapping',
      );
    }

    const { encrypted, iv } = this.encryptionService.encrypt(
      mapping.accessToken,
    );

    const data = {
      student_id: mapping.studentId,
      github_id: mapping.githubId,
      encrypted_access_token: encrypted,
      token_iv: iv,
      github_email: mapping.githubEmail,
      github_username: mapping.githubUsername,
      is_verified: mapping.isVerified,
      updated_at: mapping.updatedAt,
      updated_by_id: mapping.updatedBy,
    };

    let saved: GithubMapping;

    const existing = await this.prisma.githubMapping.findUnique({
      where: { id: mapping.id },
    });

    if (!existing) {
      // Create new
      saved = await this.prisma.githubMapping.create({
        data: {
          ...data,
          id: mapping.id,
          created_at: mapping.createdAt,
          created_by_id: mapping.createdBy,
        },
      });
    } else {
      // Update existing
      saved = await this.prisma.githubMapping.update({
        where: { id: mapping.id },
        data,
      });
    }

    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.githubMapping.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  private toDomain(prismaMapping: GithubMapping): GithubMappingAggregate {
    const accessToken =
      prismaMapping.encrypted_access_token && prismaMapping.token_iv
        ? this.encryptionService.decrypt(
            prismaMapping.encrypted_access_token,
            prismaMapping.token_iv,
          )
        : null;

    return GithubMappingAggregate.reconstitute({
      id: prismaMapping.id,
      studentId: prismaMapping.student_id,
      githubId: prismaMapping.github_id,
      accessToken: accessToken,
      githubEmail: prismaMapping.github_email,
      githubUsername: prismaMapping.github_username,
      isVerified: prismaMapping.is_verified,
      createdAt: prismaMapping.created_at,
      updatedAt: prismaMapping.updated_at,
      createdBy: prismaMapping.created_by_id,
      updatedBy: prismaMapping.updated_by_id,
    });
  }
}
