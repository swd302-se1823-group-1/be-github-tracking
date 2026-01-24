import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { ILecturerRepository } from '../../domain/repositories/lecturer.repository';
import { Lecturer } from '../../domain/aggregates/lecturer.aggregate';
import { LecturerMapper } from '../mappers/lecturer.mapper';

@Injectable()
export class PrismaLecturerRepository implements ILecturerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(lecturer: Lecturer): Promise<Lecturer> {
    const data = LecturerMapper.toPersistence(lecturer);

    const created = await this.prisma.lecturer.create({
      data: {
        id: data.id,
        employee_code: data.employee_code,
        degree: data.degree,
        department: data.department,
        phone_number: data.phone_number,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    });

    return LecturerMapper.toDomain(created);
  }

  async findById(id: string): Promise<Lecturer | null> {
    const found = await this.prisma.lecturer.findUnique({
      where: { id },
    });
    return found ? LecturerMapper.toDomain(found) : null;
  }

  async findByEmployeeCode(employeeCode: string): Promise<Lecturer | null> {
    const found = await this.prisma.lecturer.findUnique({
      where: { employee_code: employeeCode },
    });
    return found ? LecturerMapper.toDomain(found) : null;
  }

  async update(lecturer: Lecturer): Promise<void> {
    const data = LecturerMapper.toPersistence(lecturer);
    await this.prisma.lecturer.update({
      where: { id: data.id },
      data: {
        employee_code: data.employee_code,
        degree: data.degree,
        department: data.department,
        phone_number: data.phone_number,
        updated_at: data.updated_at,
      },
    });
  }
}
