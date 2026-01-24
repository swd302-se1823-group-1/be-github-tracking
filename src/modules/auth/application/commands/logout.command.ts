export class LogoutCommand {
  constructor(
    public readonly userId: string,
    public readonly jti?: string, // Optional: if provided, logout only this session
  ) {}
}
