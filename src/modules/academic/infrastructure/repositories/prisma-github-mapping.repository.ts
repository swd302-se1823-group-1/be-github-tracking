import { Injectable } from '@nestjs/common';

import { IGithubMappingRepository } from '@/modules/academic/domain/repositories/github-mapping.repository';
import { GithubMappingAggregate } from '@/modules/academic/domain/aggregates/github-mapping.aggregate';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GithubMapping } from '@generated/prisma/client';

@Injectable()
export class PrismaGithubMappingRepository implements IGithubMappingRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async save(mapping: GithubMappingAggregate): Promise<GithubMappingAggregate> {
    const data = {
      student_id: mapping.studentId,
      github_email: mapping.githubEmail,
      github_username: mapping.githubUsername,
      is_verified: mapping.isVerified,
      updated_at: mapping.updatedAt,
      updated_by_id: mapping.updatedBy,
    };

    let saved: GithubMapping;

    if (mapping.id === BigInt(0)) {
      // Create new
      saved = await this.prisma.githubMapping.create({
        data: {
          ...data,
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

  async delete(id: bigint): Promise<void> {
    await this.prisma.githubMapping.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  private toDomain(prismaMapping: GithubMapping): GithubMappingAggregate {
    return GithubMappingAggregate.reconstitute({
      id: prismaMapping.id,
      studentId: prismaMapping.student_id,
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
