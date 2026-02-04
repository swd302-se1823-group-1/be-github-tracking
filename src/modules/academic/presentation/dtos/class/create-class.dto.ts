import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateClassDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  semesterId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  enrollPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lecturerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  className: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
