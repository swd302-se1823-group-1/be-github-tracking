import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure';
import { CreateLecturerHandler } from './application/handlers/create-lecturer.handler';
import { CreateAdminHandler } from './application/handlers/create-admin.handler';
import { LecturerController } from './presentation/http/lecturer.controller';
import { AdminController } from './presentation/http/admin.controller';
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
  ],
  controllers: [LecturerController, AdminController],
  exports: [IUserRepository],
})
export class IdentityModule {}
