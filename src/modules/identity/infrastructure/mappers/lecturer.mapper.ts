import { Lecturer as PrismaLecturer } from '@generated/prisma/client';
import { Lecturer } from '../../domain/aggregates/lecturer.aggregate';

export class LecturerMapper {
  static toDomain(raw: PrismaLecturer): Lecturer {
    return new Lecturer({
      id: raw.id,
      employeeCode: raw.employee_code,
      degree: raw.degree,
      department: raw.department,
      phoneNumber: raw.phone_number,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(domain: Lecturer): PrismaLecturer {
    return {
      id: domain.id,
      employee_code: domain.employeeCode ?? null,
      degree: domain.degree ?? null,
      department: domain.department ?? null,
      phone_number: domain.phoneNumber ?? null,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
      // Audit fields that are nullable or handled elsewhere
      deleted_at: null,
      deleted_by_id: null,
      created_by_id: null,
      updated_by_id: null,
    };
  }
}
