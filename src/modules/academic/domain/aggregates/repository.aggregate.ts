import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

export interface RepositoryProps {
  id: string;
  projectId: string;
  url: string;
  name: string;
  organization: string;
  owner: string;
  lastScannedAt?: Date | null;
  scanStatus: string;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export class RepositoryAggregate extends AggregateRoot {
  private _id: string;
  private _projectId: string;
  private _url: string;
  private _name: string;
  private _organization: string;
  private _owner: string;
  private _lastScannedAt: Date | null;
  private _scanStatus: string;
  private _errorMessage: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _createdBy: string | null;
  private _updatedBy: string | null;
  private _deletedAt: Date | null;
  private _deletedBy: string | null;

  private constructor(props: RepositoryProps) {
    super();
    this._id = props.id;
    this._projectId = props.projectId;
    this._url = props.url;
    this._name = props.name;
    this._organization = props.organization;
    this._owner = props.owner;
    this._lastScannedAt = props.lastScannedAt || null;
    this._scanStatus = props.scanStatus;
    this._errorMessage = props.errorMessage || null;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._createdBy = props.createdBy || null;
    this._updatedBy = props.updatedBy || null;
    this._deletedAt = props.deletedAt || null;
    this._deletedBy = props.deletedBy || null;
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get projectId(): string {
    return this._projectId;
  }
  get url(): string {
    return this._url;
  }
  get name(): string {
    return this._name;
  }
  get organization(): string {
    return this._organization;
  }
  get owner(): string {
    return this._owner;
  }
  get lastScannedAt(): Date | null {
    return this._lastScannedAt;
  }
  get scanStatus(): string {
    return this._scanStatus;
  }
  get errorMessage(): string | null {
    return this._errorMessage;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get createdBy(): string | null {
    return this._createdBy;
  }
  get updatedBy(): string | null {
    return this._updatedBy;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
  get deletedBy(): string | null {
    return this._deletedBy;
  }

  public static create(
    projectId: string,
    url: string,
    name: string,
    owner: string,
    organization: string,
    createdBy?: string,
  ): RepositoryAggregate {
    const now = new Date();
    return new RepositoryAggregate({
      id: uuidv4(),
      projectId,
      url,
      name,
      owner,
      organization,
      scanStatus: 'pending',
      createdAt: now,
      updatedAt: now,
      createdBy: createdBy || null,
    });
  }

  public static reconstitute(props: RepositoryProps): RepositoryAggregate {
    return new RepositoryAggregate(props);
  }

  public updateScanStatus(status: string, errorMessage?: string): void {
    this._scanStatus = status;
    this._errorMessage = errorMessage || null;
    this._lastScannedAt = new Date();
    this._updatedAt = new Date();
  }
}
