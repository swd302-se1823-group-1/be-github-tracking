import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { ISemesterRepository } from '../../domain/repositories/semester.repository';
import { SemesterAggregate } from '../../domain/aggregates/semester.aggregate';
import { SemesterMapper } from '../mappers/semester.mapper';

@Injectable()
export class SemesterRepository implements ISemesterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(semester: SemesterAggregate): Promise<SemesterAggregate> {
    const persistence = SemesterMapper.toPersistence(semester);
    const newSemester = await this.prisma.semester.create({
      data: persistence,
    });
    return SemesterMapper.toDomain(newSemester);
  }
}
