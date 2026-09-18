import { ICommand } from '@nestjs/cqrs';

export class DeleteSemesterCommand implements ICommand {
  constructor(
    public readonly id: number,
    public readonly deletedBy: string,
  ) {}
}
