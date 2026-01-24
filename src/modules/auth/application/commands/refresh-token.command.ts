export class RefreshTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly jti: string,
    public readonly deviceId: string,
  ) {}
}
