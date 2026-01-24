import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LecturerResponseDto {
  @ApiProperty({ description: 'Lecturer ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Employee Code' })
  @Expose()
  employeeCode: string | null;

  @ApiProperty({ description: 'Degree' })
  @Expose()
  degree: string | null;

  @ApiProperty({ description: 'Department' })
  @Expose()
  department: string | null;

  @ApiProperty({ description: 'Phone Number' })
  @Expose()
  phoneNumber: string | null;

  @ApiProperty({ description: 'Created At' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated At' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<LecturerResponseDto>) {
    Object.assign(this, partial);
  }
}
