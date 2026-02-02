import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { ISemesterRepository } from '../../domain/repositories/semester.repository';
import { SemesterAggregate } from '../../domain/aggregates/semester.aggregate';
import { SemesterMapper } from '../mappers/semester.mapper';

import { Prisma } from '@generated/prisma/client';
import { GetSemestersQuery } from '../../application/queries/semester/get-semesters.query';

@Injectable()
export class PrismaSemesterRepository implements ISemesterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(semester: SemesterAggregate): Promise<SemesterAggregate> {
    const persistence = SemesterMapper.toPersistence(semester);
    const newSemester = await this.prisma.semester.create({
      data: persistence,
    });
    return SemesterMapper.toDomain(newSemester);
  }

  async findAll(query: GetSemestersQuery): Promise<{
    semesters: SemesterAggregate[];
    total: number;
    nextCursor: string | null;
  }> {
    const { cursor, take = 10, search, isActive, order = 'DESC' } = query;

    const where: Prisma.SemesterWhereInput = {
      deleted_at: null,
      ...(isActive !== undefined && { is_active: isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, semesters] = await Promise.all([
      this.prisma.semester.count({ where }),
      this.prisma.semester.findMany({
        where,
        take: take ? take + 1 : undefined,
        cursor: cursor ? { id: BigInt(cursor) } : undefined,
        orderBy: { id: order === 'ASC' ? 'asc' : 'desc' },
        skip: cursor ? 1 : 0,
      }),
    ]);

    let nextCursor: string | null = null;
    if (semesters.length > take) {
      const nextItem = semesters.pop();
      nextCursor = nextItem?.id ? nextItem.id.toString() : null;
    }

    return {
      semesters: semesters.map((s) => SemesterMapper.toDomain(s)),
      total,
      nextCursor,
    };
  }

  async findById(id: string): Promise<SemesterAggregate | null> {
    const semester = await this.prisma.semester.findUnique({
      where: { id: BigInt(id) },
    });
    return semester ? SemesterMapper.toDomain(semester) : null;
  }

  async update(semester: SemesterAggregate): Promise<SemesterAggregate> {
    const persistence = SemesterMapper.toPersistence(semester);
    const updatedSemester = await this.prisma.semester.update({
      where: { id: BigInt(semester.id.toString()) },
      data: persistence,
    });
    return SemesterMapper.toDomain(updatedSemester);
  }

  async findByCode(code: string): Promise<SemesterAggregate | null> {
    const semester = await this.prisma.semester.findUnique({
      where: { code, deleted_at: null },
    });
    return semester ? SemesterMapper.toDomain(semester) : null;
  }

  async delete(id: bigint, deletedBy: string): Promise<void> {
    await this.prisma.semester.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: deletedBy,
        is_active: false,
      },
    });
  }
}
