import { ICommand } from '@nestjs/cqrs';

export class DeleteCourseCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string,
  ) {}
}
