import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure';
import { CreateLecturerHandler } from './application/handlers/create-lecturer.handler';
import { CreateAdminHandler } from './application/handlers/create-admin.handler';
import { GetUsersHandler } from './application/handlers/get-users.handler';
import { LecturerController } from './presentation/http/lecturer.controller';
import { AdminController } from './presentation/http/admin.controller';
import { UserController } from './presentation/http/user.controller';
import { StudentController } from './presentation/http/student.controller';
import { GetStudentsHandler } from './application/handlers/get-students.handler';
import { GetStudentByIdHandler } from './application/handlers/get-student-by-id.handler';
import { AuthModule } from '@/modules/auth/auth.module';
import { IUserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { FindUserByProviderIdHandler } from './application/handlers/find-user-by-provider-id.handler';
import { FindUserByEmailHandler } from './application/handlers/find-user-by-email.handler';
import { FindUserByIdHandler } from './application/handlers/find-user-by-id.handler';
import { CreateUserHandler } from './application/handlers/create-user.handler';
import { UpdateUserGoogleInfoHandler } from './application/handlers/update-user-google-info.handler';
import { GetCurrentUserHandler } from './application/handlers/get-current-user.handler';

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
    CreateAdminHandler,
    GetUsersHandler,
    GetStudentsHandler,
    GetStudentByIdHandler,
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
