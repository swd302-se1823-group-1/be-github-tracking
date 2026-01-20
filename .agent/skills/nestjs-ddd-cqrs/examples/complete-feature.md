# Example: Complete Feature Implementation

This example shows how to implement a "Change User Status" feature following the DDD/CQRS architecture.

## Scenario

Admin wants to block/unblock users.

## Implementation

### 1. Domain Layer

**Event**: `domain/events/user-status-changed.event.ts`

```typescript
import { DomainEvent } from '@/shared';
import { UserStatus } from '@/generated/prisma/enums';

export class UserStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly newStatus: UserStatus,
    public readonly reason: string,
  ) {
    super({ aggregateId });
  }
}
```

**Aggregate Method**: Add to `domain/aggregates/auth-user-aggregate.ts`

```typescript
changeStatus(newStatus: UserStatus, reason: string): void {
  // Validate business rules
  if (this._status === newStatus) {
    throw new Error('Status is already ' + newStatus);
  }

  // Update state
  this._status = newStatus;

  // Emit event
  this.apply(
    new UserStatusChangedEvent(this.id, newStatus, reason),
  );
}
```

### 2. Application Layer

**Command**: `application/commands/change-user-status.command.ts`

```typescript
import { UserStatus } from '@/generated/prisma/enums';

export class ChangeUserStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly status: UserStatus,
    public readonly reason: string,
  ) {}
}
```

**DTO**: `application/dtos/change-user-status.dto.ts`

```typescript
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { UserStatus } from '@/generated/prisma/enums';

export class ChangeUserStatusDto {
  @IsUUID()
  userId: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsString()
  reason: string;
}
```

**Handler**: `application/handlers/change-user-status.handler.ts`

```typescript
import { ChangeUserStatusCommand } from '@/modules/auth/application/commands/change-user-status.command';
import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepository,
} from '@/modules/auth/domain/repositories/auth-user.repository';
import { UserNotFoundException } from '@/modules/auth/domain/exceptions/auth.exception';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(ChangeUserStatusCommand)
export class ChangeUserStatusHandler implements ICommandHandler<ChangeUserStatusCommand> {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepository,
  ) {}

  async execute(command: ChangeUserStatusCommand): Promise<void> {
    const { userId, status, reason } = command;

    // Load aggregate
    const user = await this.authUserRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // Execute business logic
    user.changeStatus(status, reason);

    // Persist
    await this.authUserRepository.save(user);
  }
}
```

### 3. Presentation Layer

**Controller**: Update `presentation/http/auth.controller.ts`

```typescript
@ResponseMessage('User status changed successfully')
@Patch('users/:userId/status')
async changeStatus(
  @Param('userId') userId: string,
  @Body() dto: ChangeUserStatusDto,
) {
  await this.commandBus.execute(
    new ChangeUserStatusCommand(userId, dto.status, dto.reason),
  );
}
```

### 4. Module Registration

**Module**: Update `auth.module.ts`

```typescript
providers: [
  RegisterUserHandler,
  VerifyOtpHandler,
  ChangeUserStatusHandler, // <-- Add here
  // ...
];
```

## Testing

```bash
# Block a user
PATCH http://localhost:3000/auth/users/123e4567-e89b-12d3-a456-426614174000/status
Content-Type: application/json

{
  "status": "BLOCKED",
  "reason": "Suspicious activity detected"
}

# Unblock a user
PATCH http://localhost:3000/auth/users/123e4567-e89b-12d3-a456-426614174000/status
Content-Type: application/json

{
  "status": "ACTIVE",
  "reason": "Investigation completed, no issues found"
}
```

## Database Changes

If you need a new repository method:

```typescript
// domain/repositories/auth-user.repository.ts
export interface AuthUserRepository {
  save(user: AuthUser): Promise<void>;
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>; // <-- Add this
}

// infrastructure/prisma/prisma-auth-user.repository.ts
async findById(id: string): Promise<AuthUser | null> {
  const user = await this.prismaService.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return AuthUser.restore(
    user.id,
    new Email(user.email),
    HashedPassword.fromHash(user.password),
    user.roleId,
    user.status,
  );
}
```
