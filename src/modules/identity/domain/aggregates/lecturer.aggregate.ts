import { AggregateRoot } from '@nestjs/cqrs';

export type LecturerProps = {
  id: string;
  employeeCode?: string | null;
  degree?: string | null;
  department?: string | null;
  phoneNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Lecturer extends AggregateRoot {
  private _props: LecturerProps;

  constructor(props: LecturerProps) {
    super();
    this._props = props;
  }

  get id(): string {
    return this._props.id;
  }

  get employeeCode(): string | null | undefined {
    return this._props.employeeCode;
  }

  get degree(): string | null | undefined {
    return this._props.degree;
  }

  get department(): string | null | undefined {
    return this._props.department;
  }

  get phoneNumber(): string | null | undefined {
    return this._props.phoneNumber;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  // Domain methods can be added here
  public updateProfile(
    employeeCode?: string,
    degree?: string,
    department?: string,
    phoneNumber?: string,
  ): void {
    if (employeeCode !== undefined) this._props.employeeCode = employeeCode;
    if (degree !== undefined) this._props.degree = degree;
    if (department !== undefined) this._props.department = department;
    if (phoneNumber !== undefined) this._props.phoneNumber = phoneNumber;
    this._props.updatedAt = new Date();
  }
}
