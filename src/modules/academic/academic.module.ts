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
import { IEnrollmentRepository } from '@/modules/academic/domain/repositories/enrollment.repository';
import { EnrollmentRepository } from '@/modules/academic/infrastructure/repositories/enrollment.repository';
import { EnrollStudentHandler } from '@/modules/academic/application/handlers/enrollment/enroll-student.handler';
import { InfrastructureModule } from '@/infrastructure';

import { UpdateSemesterHandler } from '@/modules/academic/application/handlers/semester/update-semester.handler';
import { GetCoursesHandler } from '@/modules/academic/application/handlers/course/get-courses.handler';
import { GetCourseByIdHandler } from '@/modules/academic/application/handlers/course/get-course-by-id.handler';
import { GetCourseByCodeHandler } from '@/modules/academic/application/handlers/course/get-course-by-code.handler';
import { GetSemesterByIdHandler } from '@/modules/academic/application/handlers/semester/get-semester-by-id.handler';
import { GetSemesterByCodeHandler } from '@/modules/academic/application/handlers/semester/get-semester-by-code.handler';
import { GetClassesHandler } from '@/modules/academic/application/handlers/class/get-classes.handler';

@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [SemesterController, CourseController, ClassController],
  providers: [
    GetSemestersHandler,
    CreateSemesterHandler,
    UpdateSemesterHandler,
    UpdateSemesterHandler,
    GetSemesterByIdHandler,
    GetSemesterByCodeHandler,
    CreateCourseHandler,
    GetCoursesHandler,
    GetCourseByIdHandler,
    GetCourseByCodeHandler,
    CreateClassHandler,
    GetClassesHandler,
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
    EnrollStudentHandler,
    {
      provide: IEnrollmentRepository,
      useClass: EnrollmentRepository,
    },
  ],
})
export class AcademicModule {}
