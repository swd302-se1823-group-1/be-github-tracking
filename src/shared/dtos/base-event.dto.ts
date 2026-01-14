import { IsString, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseEventDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsDate()
  @Type(() => Date)
  occurredOn: Date;
}
