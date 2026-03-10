import { ApiProperty } from '@nestjs/swagger';

export class TimelineStudentDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  commits: number;
}

export class TimelineItemDto {
  @ApiProperty()
  date: number; // Unix timestamp

  @ApiProperty({ type: [TimelineStudentDto] })
  students: TimelineStudentDto[];
}

export class ProjectCommitTimelineResponseDto {
  @ApiProperty({ type: [TimelineItemDto] })
  timeline: TimelineItemDto[];
}
