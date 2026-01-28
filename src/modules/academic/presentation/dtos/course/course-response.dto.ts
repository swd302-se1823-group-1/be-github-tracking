import { ApiProperty } from '@nestjs/swagger';
import { CourseAggregate } from '../../../domain/aggregates/course.aggregate';

export class CourseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  constructor(course: CourseAggregate) {
    this.id = course.id;
    this.code = course.code;
    this.name = course.name;
  }
}
