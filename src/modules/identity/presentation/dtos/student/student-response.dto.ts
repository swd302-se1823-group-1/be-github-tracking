import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class StudentResponseDto {
  @ApiProperty({ description: 'Student User ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Student Code' })
  @Expose()
  studentCode: string | null;

  @ApiProperty({ description: 'University Email' })
  @Expose()
  universityEmail: string | null;

  @ApiProperty({ description: 'Email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Full Name' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'Avatar URL' })
  @Expose()
  avatarUrl: string | null | undefined;

  @ApiProperty({ description: 'Created At' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated At' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<StudentResponseDto>) {
    Object.assign(this, partial);
  }
}
