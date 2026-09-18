export class BroadcastNotificationCommand {
  constructor(
    public readonly senderId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly recipientIds: string[], // empty = all active users
  ) {}
}
