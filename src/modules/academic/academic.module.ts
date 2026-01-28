import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SemesterController } from './presentation/http/semester.controller';
import { CourseController } from './presentation/http/course.controller';
import { ClassController } from './presentation/http/class.controller';
import { CreateSemesterHandler } from './application/handlers/semester/create-semester.handler';
import { CreateCourseHandler } from './application/handlers/course/create-course.handler';
import { CreateClassHandler } from './application/handlers/class/create-class.handler';
import { SemesterRepository } from './infrastructure/repositories/semester.repository';
import { CourseRepository } from './infrastructure/repositories/course.repository';
import { ClassRepository } from './infrastructure/repositories/class.repository';

import { ISemesterRepository } from './domain/repositories/semester.repository';
import { ICourseRepository } from './domain/repositories/course.repository';
import { IClassRepository } from './domain/repositories/class.repository';
import { InfrastructureModule } from '@/infrastructure';

@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [SemesterController, CourseController, ClassController],
  providers: [
    CreateSemesterHandler,
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
