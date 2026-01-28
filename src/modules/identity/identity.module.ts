import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure';
import { CreateLecturerHandler } from './application/handlers/lecturer/create-lecturer.handler';
import { CreateAdminHandler } from './application/handlers/admin/create-admin.handler';
import { GetUsersHandler } from './application/handlers/user/get-users.handler';
import { LecturerController } from './presentation/http/lecturer.controller';
import { AdminController } from './presentation/http/admin.controller';
import { UserController } from './presentation/http/user.controller';
import { StudentController } from './presentation/http/student.controller';
import { GetStudentsHandler } from './application/handlers/student/get-students.handler';
import { GetStudentByIdHandler } from './application/handlers/student/get-student-by-id.handler';
import { GetLecturersHandler } from './application/handlers/lecturer/get-lecturers.handler';
import { GetLecturerByIdHandler } from './application/handlers/lecturer/get-lecturer-by-id.handler';
import { GetLecturerByEmailHandler } from './application/handlers/lecturer/get-lecturer-by-email.handler';
import { UpdateStudentHandler } from './application/handlers/student/update-student.handler';
import { UpdateLecturerHandler } from './application/handlers/lecturer/update-lecturer.handler';
import { AuthModule } from '@/modules/auth/auth.module';
import { IUserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { FindUserByProviderIdHandler } from './application/handlers/user/find-user-by-provider-id.handler';
import { FindUserByEmailHandler } from './application/handlers/user/find-user-by-email.handler';
import { FindUserByIdHandler } from './application/handlers/user/find-user-by-id.handler';
import { CreateUserHandler } from './application/handlers/user/create-user.handler';
import { UpdateUserGoogleInfoHandler } from './application/handlers/user/update-user-google-info.handler';
import { GetCurrentUserHandler } from './application/handlers/user/get-current-user.handler';
import { UpdateUserAvatarHandler } from './application/handlers/user/update-user-avatar.handler';
import { CloudinaryModule } from '@/shared/cloudinary/cloudinary.module';

const repositories = [
  {
    provide: IUserRepository,
    useClass: PrismaUserRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    InfrastructureModule,
    CloudinaryModule,
    forwardRef(() => AuthModule), // Fix circular dependency
  ],
  providers: [
    ...repositories,
    CreateLecturerHandler,
    FindUserByProviderIdHandler,
    FindUserByEmailHandler,
    FindUserByIdHandler,
    GetCurrentUserHandler,
    CreateUserHandler,
    UpdateUserGoogleInfoHandler,
    UpdateUserAvatarHandler,
    CreateAdminHandler,
    GetUsersHandler,
    GetStudentsHandler,
    GetStudentByIdHandler,
    GetLecturersHandler,
    GetLecturerByIdHandler,
    GetLecturerByEmailHandler,
    UpdateStudentHandler,
    UpdateLecturerHandler,
  ],
  controllers: [
    LecturerController,
    AdminController,
    UserController,
    StudentController,
  ],
  exports: [IUserRepository],
})
export class IdentityModule {}
