export class BanUserCommand {
  constructor(
    public readonly id: string,
    public readonly bannedById: string,
  ) {}
}
