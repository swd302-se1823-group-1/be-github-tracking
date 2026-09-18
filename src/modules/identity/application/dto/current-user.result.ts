import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

export interface StudentProfileResult {
  studentCode: string | null;
  universityEmail: string | null;
}

export interface LecturerProfileResult {
  employeeCode: string;
  degree: string;
  department?: string;
  phoneNumber?: string;
}

export interface CurrentUserResult {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  studentProfile?: StudentProfileResult;
  lecturerProfile?: LecturerProfileResult;
}
