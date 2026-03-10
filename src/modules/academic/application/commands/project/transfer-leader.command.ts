export class TransferLeaderCommand {
  constructor(
    public readonly projectId: string,
    public readonly newLeaderStudentId: string,
    public readonly currentLeaderId: string,
  ) {}
}
