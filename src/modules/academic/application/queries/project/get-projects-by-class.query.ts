import { GetProjectsDto } from '@/modules/academic/presentation/dtos/project/get-projects.dto';

export class GetProjectsByClassQuery {
  constructor(
    public readonly classId: string,
    public readonly query: GetProjectsDto,
  ) {}
}
