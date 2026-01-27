import { ICommand } from '@nestjs/cqrs';

export class CreateSemesterCommand implements ICommand {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly startDate: string | undefined,
    public readonly endDate: string | undefined,
    public readonly isActive: boolean | undefined,
    public readonly createdBy: string,
  ) {}
}
