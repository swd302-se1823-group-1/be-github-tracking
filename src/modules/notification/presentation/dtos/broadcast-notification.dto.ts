import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class BroadcastNotificationDto {
  @ApiProperty({ example: 'System Maintenance' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'The system will be down for maintenance at 2:00 AM.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiProperty({
    description:
      'Optional list of recipient user IDs. Empty = broadcast to all active users.',
    isArray: true,
    required: false,
    example: [],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  recipientIds?: string[];
}
