import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class EnrollStudentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  enrollPassword: string;
}
