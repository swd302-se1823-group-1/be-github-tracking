import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentProfileDto {
  @ApiPropertyOptional({ example: 'SE123456' })
  @Expose()
  studentCode: string | null;

  @ApiPropertyOptional({ example: 'student@university.edu.vn' })
  @Expose()
  universityEmail: string | null;

  constructor(partial: Partial<StudentProfileDto>) {
    Object.assign(this, partial);
  }
}

export class LecturerProfileDto {
  @ApiProperty({ example: 'GV001' })
  @Expose()
  employeeCode: string;

  @ApiProperty({ example: 'PhD in Computer Science' })
  @Expose()
  degree: string;

  @ApiPropertyOptional({ example: 'Software Engineering' })
  @Expose()
  department?: string;

  @ApiPropertyOptional({ example: '+84123456789' })
  @Expose()
  phoneNumber?: string;

  constructor(partial: Partial<LecturerProfileDto>) {
    Object.assign(this, partial);
  }
}

export class CurrentUserResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @Expose()
  fullName: string | null;

  @ApiPropertyOptional({ example: 'https://avatar.url' })
  @Expose()
  avatarUrl: string | null;

  @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'LECTURER', 'ADMIN'] })
  @Expose()
  role: string;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ type: StudentProfileDto })
  @Expose()
  @Type(() => StudentProfileDto)
  studentProfile?: StudentProfileDto;

  @ApiPropertyOptional({ type: LecturerProfileDto })
  @Expose()
  @Type(() => LecturerProfileDto)
  lecturerProfile?: LecturerProfileDto;

  constructor(partial: Partial<CurrentUserResponseDto>) {
    Object.assign(this, partial);
  }
}
