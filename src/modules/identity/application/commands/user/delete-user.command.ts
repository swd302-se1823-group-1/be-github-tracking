export class DeleteUserCommand {
  constructor(
    public readonly id: string,
    public readonly deletedById: string,
  ) {}
}
