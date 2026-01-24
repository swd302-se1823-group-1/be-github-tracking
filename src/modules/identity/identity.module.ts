import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure';
import { ILecturerRepository } from './domain/repositories/lecturer.repository';
import { PrismaLecturerRepository } from './infrastructure/repositories/prisma-lecturer.repository';
import { CreateLecturerHandler } from './application/handlers/create-lecturer.handler';
import { LecturerController } from './presentation/http/lecturer.controller';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [CqrsModule, InfrastructureModule, AuthModule],
  providers: [
    {
      provide: ILecturerRepository,
      useClass: PrismaLecturerRepository,
    },
    CreateLecturerHandler,
  ],
  controllers: [LecturerController],
  exports: [],
})
export class IdentityModule {}
