export class StudentProfile {
  private constructor(
    public readonly studentCode?: string,
    public readonly universityEmail?: string,
  ) {}

  static create(
    studentCode?: string,
    universityEmail?: string,
  ): StudentProfile {
    // Validation logic can be added here
    return new StudentProfile(studentCode, universityEmail);
  }

  updateProfile(
    studentCode?: string,
    universityEmail?: string,
  ): StudentProfile {
    return new StudentProfile(
      studentCode || this.studentCode,
      universityEmail || this.universityEmail,
    );
  }

  updateCode(newCode: string): StudentProfile {
    return new StudentProfile(newCode, this.universityEmail);
  }
}
