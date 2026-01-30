import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SemesterController } from '@/modules/academic/presentation/http/semester.controller';
import { CourseController } from '@/modules/academic/presentation/http/course.controller';
import { ClassController } from '@/modules/academic/presentation/http/class.controller';
import { GetSemestersHandler } from '@/modules/academic/application/handlers/semester/get-semesters.handler';
import { CreateSemesterHandler } from '@/modules/academic/application/handlers/semester/create-semester.handler';
import { CreateCourseHandler } from '@/modules/academic/application/handlers/course/create-course.handler';
import { CreateClassHandler } from '@/modules/academic/application/handlers/class/create-class.handler';
import { SemesterRepository } from '@/modules/academic/infrastructure/repositories/semester.repository';
import { CourseRepository } from '@/modules/academic/infrastructure/repositories/course.repository';
import { ClassRepository } from '@/modules/academic/infrastructure/repositories/class.repository';

import { ISemesterRepository } from '@/modules/academic/domain/repositories/semester.repository';
import { ICourseRepository } from '@/modules/academic/domain/repositories/course.repository';
import { IClassRepository } from '@/modules/academic/domain/repositories/class.repository';
import { InfrastructureModule } from '@/infrastructure';

import { UpdateSemesterHandler } from '@/modules/academic/application/handlers/semester/update-semester.handler';

@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [SemesterController, CourseController, ClassController],
  providers: [
    GetSemestersHandler,
    CreateSemesterHandler,
    UpdateSemesterHandler,
    CreateCourseHandler,
    CreateClassHandler,
    {
      provide: ISemesterRepository,
      useClass: SemesterRepository,
    },
    {
      provide: ICourseRepository,
      useClass: CourseRepository,
    },
    {
      provide: IClassRepository,
      useClass: ClassRepository,
    },
  ],
})
export class AcademicModule {}
