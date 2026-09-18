import { ICommand } from '@nestjs/cqrs';

export class CreateCourseCommand implements ICommand {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly createdBy: string,
  ) {}
}
