import { ICommand } from '@nestjs/cqrs';

export class EnrollStudentCommand implements ICommand {
  constructor(
    public readonly classId: string,
    public readonly enrollPassword: string,
    public readonly studentId: string,
  ) {}
}
