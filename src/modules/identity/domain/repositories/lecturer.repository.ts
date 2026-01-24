import { Lecturer } from '../aggregates/lecturer.aggregate';

export abstract class ILecturerRepository {
  abstract create(lecturer: Lecturer): Promise<Lecturer>;
  abstract findById(id: string): Promise<Lecturer | null>;
  abstract findByEmployeeCode(employeeCode: string): Promise<Lecturer | null>;
  abstract update(lecturer: Lecturer): Promise<void>;
}
