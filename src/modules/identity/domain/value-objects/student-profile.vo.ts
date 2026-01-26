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

  updateCode(newCode: string): StudentProfile {
    return new StudentProfile(newCode, this.universityEmail);
  }
}
