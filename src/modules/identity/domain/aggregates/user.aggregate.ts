import { AggregateRoot } from '@nestjs/cqrs';
import { UserId } from '../value-objects/user-id.vo';
import { UserRole } from '../enums/user-role.enum';
import { StudentProfile } from '../value-objects/student-profile.vo';
import { LecturerProfile } from '../value-objects/lecturer-profile.vo';
import { UserCreatedEvent } from '../events/user-created.event';
import { LecturerDegreeUpdatedEvent } from '../events/lecturer-degree-updated.event';
import { InvalidRoleOperationException } from '../exceptions/user.exceptions';

export type UserProps = {
  id: UserId;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  provider?: string | null;
  providerId?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  studentProfile?: StudentProfile;
  lecturerProfile?: LecturerProfile;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export class UserAggregate extends AggregateRoot {
  private constructor(private readonly _props: UserProps) {
    super();
  }

  get id(): UserId {
    return this._props.id;
  }
  get email(): string {
    return this._props.email;
  }
  get fullName(): string | null | undefined {
    return this._props.fullName;
  }
  get avatarUrl(): string | null | undefined {
    return this._props.avatarUrl;
  }
  get provider(): string | null | undefined {
    return this._props.provider;
  }
  get providerId(): string | null | undefined {
    return this._props.providerId;
  }
  get role(): UserRole {
    return this._props.role;
  }
  get isActive(): boolean {
    return this._props.isActive;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }
  get studentProfile(): StudentProfile | undefined {
    return this._props.studentProfile;
  }
  get lecturerProfile(): LecturerProfile | undefined {
    return this._props.lecturerProfile;
  }
  get createdBy(): string | null | undefined {
    return this._props.createdBy;
  }
  get updatedBy(): string | null | undefined {
    return this._props.updatedBy;
  }

  // Reconstitute from persistence
  public static reconstitute(props: UserProps): UserAggregate {
    return new UserAggregate(props);
  }

  // Factory: Create Student User
  static createStudent(
    email: string,
    fullName: string,
    studentCode?: string,
    provider?: string,
    providerId?: string,
    avatarUrl?: string,
    universityEmail?: string,
    createdBy?: string,
  ): UserAggregate {
    const id = UserId.generate();
    const user = new UserAggregate({
      id,
      email,
      fullName,
      role: UserRole.STUDENT,
      studentProfile: StudentProfile.create(studentCode, universityEmail),
      isActive: true, // Default active
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: provider || null,
      providerId: providerId || null,
      avatarUrl: avatarUrl || null,
      lecturerProfile: undefined,
      createdBy: createdBy || null,
      updatedBy: createdBy || null,
    });

    user.apply(new UserCreatedEvent(id, email, UserRole.STUDENT));
    return user;
  }

  // Factory: Create Lecturer User
  static createLecturer(
    email: string,
    fullName: string,
    employeeCode: string,
    degree: string,
    department?: string,
    phoneNumber?: string,
    provider?: string,
    providerId?: string,
    avatarUrl?: string,
    createdBy?: string,
  ): UserAggregate {
    const id = UserId.generate();
    const user = new UserAggregate({
      id,
      email,
      fullName,
      role: UserRole.LECTURER,
      lecturerProfile: LecturerProfile.create(
        employeeCode,
        degree,
        department,
        phoneNumber,
      ),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: provider || null,
      providerId: providerId || null,
      avatarUrl: avatarUrl || null,
      studentProfile: undefined,
      createdBy: createdBy || null,
      updatedBy: createdBy || null,
    });

    user.apply(new UserCreatedEvent(id, email, UserRole.LECTURER));
    return user;
  }

  // Factory: Create Admin User
  static createAdmin(
    email: string,
    fullName: string,
    provider?: string,
    providerId?: string,
    avatarUrl?: string,
    createdBy?: string,
  ): UserAggregate {
    const id = UserId.generate();
    const user = new UserAggregate({
      id,
      email,
      fullName,
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: provider || null,
      providerId: providerId || null,
      avatarUrl: avatarUrl || null,
      studentProfile: undefined,
      lecturerProfile: undefined,
      createdBy: createdBy || null,
      updatedBy: createdBy || null,
    });

    user.apply(new UserCreatedEvent(id, email, UserRole.ADMIN));
    return user;
  }

  // Generic create for OAuth when role is not yet fully determined, default Student?
  // Or force role selection.
  // We will assume default Student for OAuth if not specified.

  // Business logic cho Student
  updateStudent(
    fullName?: string,
    studentCode?: string,
    universityEmail?: string,
  ): void {
    if (this._props.role !== UserRole.STUDENT) {
      throw new InvalidRoleOperationException(
        this._props.role,
        'update student profile',
      );
    }

    if (fullName) {
      this._props.fullName = fullName;
    }

    if (studentCode || universityEmail) {
      if (!this._props.studentProfile) {
        this._props.studentProfile = StudentProfile.create(
          studentCode,
          universityEmail,
        );
      } else {
        this._props.studentProfile = this._props.studentProfile.updateProfile(
          studentCode,
          universityEmail,
        );
      }
    }

    this._props.updatedAt = new Date();
    // Emit event if needed, e.g., StudentProfileUpdatedEvent
  }

  // Business logic cho Lecturer
  updateLecturerProfile(
    employeeCode?: string,
    degree?: string,
    department?: string,
    phoneNumber?: string,
  ): void {
    if (
      this._props.role !== UserRole.LECTURER ||
      !this._props.lecturerProfile
    ) {
      throw new InvalidRoleOperationException(
        this._props.role,
        'update lecturer profile',
      );
    }

    this._props.lecturerProfile = this._props.lecturerProfile.updateProfile(
      degree,
      department,
      phoneNumber,
    );

    this._props.updatedAt = new Date();
    // Should emit generic profile updated event or specific ones?
    if (degree) {
      this.apply(new LecturerDegreeUpdatedEvent(this.id, degree));
    }
  }

  public updateGoogleInfo(providerId: string, avatarUrl?: string): void {
    this._props.provider = 'google';
    this._props.providerId = providerId;
    if (avatarUrl) {
      this._props.avatarUrl = avatarUrl;
    }
    this._props.updatedAt = new Date();
  }

  public updateAvatar(avatarUrl: string): void {
    this._props.avatarUrl = avatarUrl;
    this._props.updatedAt = new Date();
  }

  public updateFullName(fullName: string): void {
    this._props.fullName = fullName;
    this._props.updatedAt = new Date();
  }

  public setUpdatedBy(userId: string): void {
    this._props.updatedBy = userId;
  }
}
