import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSemesterCommand } from '../../commands/semester/delete-semester.command';
import { Inject } from '@nestjs/common';
import { ISemesterRepository } from '@/modules/academic/domain/repositories/semester.repository';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(DeleteSemesterCommand)
export class DeleteSemesterHandler implements ICommandHandler<DeleteSemesterCommand> {
  constructor(
    @Inject(ISemesterRepository)
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  @Transactional()
  async execute(command: DeleteSemesterCommand): Promise<void> {
    const { id, deletedBy } = command;
    // We could check if it exists here, but delete usually is idempotent or repo throws if not found?
    // Let's rely on repo or check first.
    // Repo delete implementation relies on update which throws if ID not found? No, Prisma update throws if record not found.
    // So if it fails, it throws. That's fine.

    // We need to convert number to BigInt
    await this.semesterRepository.delete(BigInt(id), deletedBy);
  }
}
