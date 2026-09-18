import { ICommand } from '@nestjs/cqrs';

export class CreateClassCommand implements ICommand {
  constructor(
    public readonly semesterId: number,
    public readonly enrollPassword: string,
    public readonly lecturerId: string,
    public readonly courseId: string,
    public readonly classCode: string,
    public readonly className: string,
    public readonly description: string | undefined,
    public readonly createdBy: string,
    public readonly maxStudents?: number,
  ) {}
}
