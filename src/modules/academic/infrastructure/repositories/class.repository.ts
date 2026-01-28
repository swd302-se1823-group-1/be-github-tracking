import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IClassRepository } from '../../domain/repositories/class.repository';
import { ClassAggregate } from '../../domain/aggregates/class.aggregate';
import { ClassMapper } from '../mappers/class.mapper';

@Injectable()
export class ClassRepository implements IClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(clazz: ClassAggregate): Promise<ClassAggregate> {
    const persistence = ClassMapper.toPersistence(clazz);
    const newClass = await this.prisma.class.create({
      data: persistence,
    });
    return ClassMapper.toDomain(newClass);
  }
}
