import { ClassAggregate } from '../../../domain/aggregates/class.aggregate';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

// Define loose types for the relations to avoid strict coupling or circular dependencies in DTOs if possible,
// or import specific ResponseDtos if they exist.
// Assuming we return simple objects or formatted DTOs for them.
export class RelationDto {
  @ApiPropertyOptional()
  id?: string;
  @ApiPropertyOptional()
  code?: string;
  @ApiPropertyOptional()
  name?: string;
  @ApiPropertyOptional()
  email?: string;
  @ApiPropertyOptional()
  fullName?: string | null;
}

export type ClassWithRelations = ClassAggregate & {
  lecturer?: {
    id: string;
    user?: {
      email: string;
      full_name: string | null;
    };
  };
  course?: {
    id: string;
    code: string;
    name: string;
  };
  semester?: {
    id: bigint;
    code: string;
    name: string;
  };
};

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

  @ApiPropertyOptional({ type: RelationDto })
  lecturer?: RelationDto;

  @ApiPropertyOptional({ type: RelationDto })
  course?: RelationDto;

  @ApiPropertyOptional({ type: RelationDto })
  semester?: RelationDto;

  constructor(clazz: ClassAggregate) {
    this.id = clazz.id;
    this.classCode = clazz.classCode;
    this.className = clazz.className;
    this.courseId = clazz.courseId;
    this.lecturerId = clazz.lecturerId;
    this.semesterId = clazz.semesterId.toString();
    this.description = clazz.description;

    const details = clazz as ClassWithRelations;
    if (details.lecturer) {
      this.lecturer = {
        id: details.lecturer.id,
        email: details.lecturer.user?.email,
        fullName: details.lecturer.user?.full_name,
      };
    }
    if (details.course) {
      this.course = {
        id: details.course.id,
        code: details.course.code,
        name: details.course.name,
      };
    }
    if (details.semester) {
      this.semester = {
        id: details.semester.id?.toString(),
        code: details.semester.code,
        name: details.semester.name,
      };
    }
  }
}
