import { AggregateRoot } from '@nestjs/cqrs';

export type GithubMappingProps = {
  id: bigint;
  studentId: string;
  githubEmail: string | null;
  githubUsername: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
};

export class GithubMappingAggregate extends AggregateRoot {
  private constructor(private readonly _props: GithubMappingProps) {
    super();
  }

  get id(): bigint {
    return this._props.id;
  }

  get studentId(): string {
    return this._props.studentId;
  }

  get githubEmail(): string | null {
    return this._props.githubEmail;
  }

  get githubUsername(): string | null {
    return this._props.githubUsername;
  }

  get isVerified(): boolean {
    return this._props.isVerified;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  get createdBy(): string | null {
    return this._props.createdBy;
  }

  get updatedBy(): string | null {
    return this._props.updatedBy;
  }

  // Reconstitute from persistence
  public static reconstitute(
    props: GithubMappingProps,
  ): GithubMappingAggregate {
    return new GithubMappingAggregate(props);
  }

  // Factory: Create verified GitHub mapping
  public static createVerified(
    studentId: string,
    githubEmail: string,
    githubUsername: string,
    createdBy: string,
  ): GithubMappingAggregate {
    const mapping = new GithubMappingAggregate({
      id: BigInt(0), // Will be set by database
      studentId,
      githubEmail,
      githubUsername,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: createdBy,
    });

    return mapping;
  }

  // Business logic: Update GitHub info
  public updateGithubInfo(
    githubEmail: string,
    githubUsername: string,
    updatedBy: string,
  ): void {
    this._props.githubEmail = githubEmail;
    this._props.githubUsername = githubUsername;
    this._props.isVerified = true;
    this._props.updatedAt = new Date();
    this._props.updatedBy = updatedBy;
  }

  // Business logic: Verify mapping
  public verify(updatedBy: string): void {
    this._props.isVerified = true;
    this._props.updatedAt = new Date();
    this._props.updatedBy = updatedBy;
  }

  // Business logic: Unverify mapping
  public unverify(updatedBy: string): void {
    this._props.isVerified = false;
    this._props.updatedAt = new Date();
    this._props.updatedBy = updatedBy;
  }
}
