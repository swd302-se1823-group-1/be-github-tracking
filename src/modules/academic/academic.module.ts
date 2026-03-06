import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SemesterController } from '@/modules/academic/presentation/http/semester.controller';
import { CourseController } from '@/modules/academic/presentation/http/course.controller';
import { ClassController } from '@/modules/academic/presentation/http/class.controller';
import { GetSemestersHandler } from '@/modules/academic/application/handlers/semester/get-semesters.handler';
import { CreateSemesterHandler } from '@/modules/academic/application/handlers/semester/create-semester.handler';
import { CreateCourseHandler } from '@/modules/academic/application/handlers/course/create-course.handler';
import { UpdateCourseHandler } from '@/modules/academic/application/handlers/course/update-course.handler';
import { CreateClassHandler } from '@/modules/academic/application/handlers/class/create-class.handler';
import { UpdateClassHandler } from '@/modules/academic/application/handlers/class/update-class.handler';
import { DeleteSemesterHandler } from '@/modules/academic/application/handlers/semester/delete-semester.handler';
import { DeleteCourseHandler } from '@/modules/academic/application/handlers/course/delete-course.handler';
import { DeleteClassHandler } from '@/modules/academic/application/handlers/class/delete-class.handler';
import { PrismaSemesterRepository } from '@/modules/academic/infrastructure/repositories/prisma-semester.repository';
import { PrismaCourseRepository } from '@/modules/academic/infrastructure/repositories/prisma-course.repository';
import { PrismaClassRepository } from '@/modules/academic/infrastructure/repositories/prisma-class.repository';

import { ISemesterRepository } from '@/modules/academic/domain/repositories/semester.repository';
import { ICourseRepository } from '@/modules/academic/domain/repositories/course.repository';
import { IClassRepository } from '@/modules/academic/domain/repositories/class.repository';
import { IEnrollmentRepository } from '@/modules/academic/domain/repositories/enrollment.repository';
import { PrismaEnrollmentRepository } from '@/modules/academic/infrastructure/repositories/prisma-enrollment.repository';
import { EnrollStudentHandler } from '@/modules/academic/application/handlers/enrollment/enroll-student.handler';
import { InfrastructureModule } from '@/infrastructure';
import { CloudinaryModule } from '@/shared/cloudinary/cloudinary.module';

import { UpdateSemesterHandler } from '@/modules/academic/application/handlers/semester/update-semester.handler';
import { GetCoursesHandler } from '@/modules/academic/application/handlers/course/get-courses.handler';
import { GetCourseByIdHandler } from '@/modules/academic/application/handlers/course/get-course-by-id.handler';
import { GetCourseByCodeHandler } from '@/modules/academic/application/handlers/course/get-course-by-code.handler';
import { GetSemesterByIdHandler } from '@/modules/academic/application/handlers/semester/get-semester-by-id.handler';
import { GetSemesterByCodeHandler } from '@/modules/academic/application/handlers/semester/get-semester-by-code.handler';
import { GetClassesHandler } from '@/modules/academic/application/handlers/class/get-classes.handler';

import { GetStudentClassesHandler } from '@/modules/academic/application/handlers/class/get-student-classes.handler';
import { GetClassByIdHandler } from '@/modules/academic/application/handlers/class/get-class-by-id.handler';
import { GetClassStudentsHandler } from '@/modules/academic/application/handlers/class/get-class-students.handler';

import { ProjectController } from '@/modules/academic/presentation/http/project.controller';
import { CreateProjectHandler } from '@/modules/academic/application/handlers/project/create-project.handler';
import { AddProjectMemberHandler } from '@/modules/academic/application/handlers/project/add-project-member.handler';
import { GetProjectsByClassHandler } from '@/modules/academic/application/handlers/project/get-projects-by-class.handler';
import { UpdateProjectHandler } from '@/modules/academic/application/handlers/project/update-project.handler';
import { DeleteProjectHandler } from '@/modules/academic/application/handlers/project/delete-project.handler';
import { UpdateProjectAvatarHandler } from '@/modules/academic/application/handlers/project/update-project-avatar.handler';
import { GetProjectMembersHandler } from '@/modules/academic/application/handlers/project/get-project-members.handler';
import { GetProjectByIdHandler } from '@/modules/academic/application/handlers/project/get-project-by-id.handler';
import { GetMyProjectsHandler } from '@/modules/academic/application/handlers/project/get-my-projects.handler';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { PrismaProjectRepository } from '@/modules/academic/infrastructure/repositories/prisma-project.repository';
import { IRepositoryRepository } from '@/modules/academic/domain/repositories/repository.repository';
import { PrismaRepositoryRepository } from '@/modules/academic/infrastructure/repositories/prisma-repository.repository';
import { LinkRepositoryHandler } from '@/modules/academic/application/handlers/repository/link-repository.handler';
import { AuthModule } from '@/modules/auth/auth.module';
import { TrackingModule } from '@/modules/tracking/tracking.module';

// Repository Handlers
import { DeleteRepositoryHandler } from '@/modules/academic/application/handlers/repository/delete-repository.handler';
import { GetRepositoriesByProjectHandler } from '@/modules/academic/application/handlers/repository/get-repositories-by-project.handler';
import { GetRepositoryByIdHandler } from '@/modules/academic/application/handlers/repository/get-repository-by-id.handler';

@Module({
  imports: [
    CqrsModule,
    InfrastructureModule,
    CloudinaryModule,
    forwardRef(() => AuthModule),
    forwardRef(() => TrackingModule),
  ],
  controllers: [
    SemesterController,
    CourseController,
    ClassController,
    ProjectController,
  ],
  providers: [
    GetSemestersHandler,
    CreateSemesterHandler,
    UpdateSemesterHandler,
    UpdateSemesterHandler,
    GetSemesterByIdHandler,
    GetSemesterByCodeHandler,
    CreateCourseHandler,
    UpdateCourseHandler,
    GetCoursesHandler,
    GetCourseByIdHandler,
    GetCourseByCodeHandler,
    CreateClassHandler,
    UpdateClassHandler,
    GetClassesHandler,
    GetStudentClassesHandler,
    GetClassByIdHandler,
    GetClassStudentsHandler,
    DeleteSemesterHandler,
    DeleteCourseHandler,
    DeleteClassHandler,
    {
      provide: ISemesterRepository,
      useClass: PrismaSemesterRepository,
    },
    {
      provide: ICourseRepository,
      useClass: PrismaCourseRepository,
    },
    {
      provide: IClassRepository,
      useClass: PrismaClassRepository,
    },
    EnrollStudentHandler,
    {
      provide: IEnrollmentRepository,
      useClass: PrismaEnrollmentRepository,
    },
    CreateProjectHandler,
    AddProjectMemberHandler,
    GetProjectsByClassHandler,
    UpdateProjectHandler,
    DeleteProjectHandler,
    UpdateProjectAvatarHandler,
    GetProjectMembersHandler,
    GetProjectByIdHandler,
    GetMyProjectsHandler,
    {
      provide: IProjectRepository,
      useClass: PrismaProjectRepository,
    },
    {
      provide: IRepositoryRepository,
      useClass: PrismaRepositoryRepository,
    },
    LinkRepositoryHandler,
    DeleteRepositoryHandler,
    GetRepositoriesByProjectHandler,
    GetRepositoryByIdHandler,
  ],
})
export class AcademicModule {}
