export class GetProjectByIdQuery {
  constructor(
    public readonly id: string,
    public readonly requesterId?: string,
  ) {}
}
