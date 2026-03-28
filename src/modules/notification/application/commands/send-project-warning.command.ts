export class SendProjectWarningCommand {
  constructor(
    public readonly projectId: string,
    public readonly studentId: string,
    public readonly senderId: string,
    public readonly message: string,
    public readonly warningType: 'INACTIVITY' | 'LOW_COMMITS' | 'GENERAL',
  ) {}
}
