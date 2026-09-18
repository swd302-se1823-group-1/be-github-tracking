import { RequiredFieldException } from '@/modules/identity/domain/exceptions/user.exceptions';

export class LecturerProfile {
  private constructor(
    public readonly employeeCode: string,
    public readonly degree: string,
    public readonly department?: string,
    public readonly phoneNumber?: string, // Added based on schema
  ) {}

  static create(
    employeeCode: string,
    degree: string,
    department?: string,
    phoneNumber?: string,
  ): LecturerProfile {
    if (!employeeCode) {
      throw new RequiredFieldException('employeeCode', 'Lecturer');
    }
    if (!degree) {
      throw new RequiredFieldException('degree', 'Lecturer');
    }
    return new LecturerProfile(employeeCode, degree, department, phoneNumber);
  }

  updateDegree(newDegree: string): LecturerProfile {
    return new LecturerProfile(
      this.employeeCode,
      newDegree,
      this.department,
      this.phoneNumber,
    );
  }

  updateProfile(
    degree?: string,
    department?: string,
    phoneNumber?: string,
    employeeCode?: string,
  ): LecturerProfile {
    return new LecturerProfile(
      employeeCode ?? this.employeeCode,
      degree ?? this.degree,
      department ?? this.department,
      phoneNumber ?? this.phoneNumber,
    );
  }
}
