import { ApiProperty } from '@nestjs/swagger';
import { SemesterAggregate } from '../../../domain/aggregates/semester.aggregate';

export class SemesterResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  startDate: Date | null;

  @ApiProperty()
  endDate: Date | null;

  @ApiProperty()
  isActive: boolean;

  constructor(semester: SemesterAggregate) {
    this.id = semester.id.toString();
    this.code = semester.code;
    this.name = semester.name;
    this.startDate = semester.startDate;
    this.endDate = semester.endDate;
    this.isActive = semester.isActive;
  }
}
