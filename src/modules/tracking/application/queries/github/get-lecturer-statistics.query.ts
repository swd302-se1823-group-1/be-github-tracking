export class GetLecturerStatisticsQuery {
  constructor(
    public readonly lecturerId: string,
    public readonly semesterCode?: string,
    public readonly classId?: string,
  ) {}
}
