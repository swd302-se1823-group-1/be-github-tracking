import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateLecturerDto {
  @ApiProperty({
    description: 'Email of the lecturer',
    example: 'lecturer@university.edu.vn',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Full Name of the lecturer',
    example: 'Dr. Nguyen Van A',
  })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Employee Code', example: 'L001' })
  @IsString()
  employeeCode: string;

  @ApiProperty({ example: 'PhD' })
  @IsString()
  degree: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phoneNumber?: string;
}
