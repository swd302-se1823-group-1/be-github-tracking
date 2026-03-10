import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class TransferLeaderDto {
  @ApiProperty({
    description: 'The User ID (Student ID) of the new leader',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  newLeaderStudentId: string;
}
