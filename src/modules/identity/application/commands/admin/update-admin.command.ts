export class UpdateAdminCommand {
  constructor(
    public readonly id: string,
    public readonly editorId: string,
    public readonly fullName?: string,
  ) {}
}
