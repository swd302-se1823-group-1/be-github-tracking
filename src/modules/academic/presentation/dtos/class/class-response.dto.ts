import { ApiProperty } from '@nestjs/swagger';
import { ClassAggregate } from '../../../domain/aggregates/class.aggregate';

export class ClassResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  classCode: string;

  @ApiProperty()
  className: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  lecturerId: string;

  @ApiProperty()
  semesterId: string;

  @ApiProperty()
  description: string | null;

  constructor(clazz: ClassAggregate) {
    this.id = clazz.id;
    this.classCode = clazz.classCode;
    this.className = clazz.className;
    this.courseId = clazz.courseId;
    this.lecturerId = clazz.lecturerId;
    this.semesterId = clazz.semesterId.toString();
    this.description = clazz.description;
  }
}
