---
name: NestJS DDD/CQRS Architecture
description: Implement features following Domain-Driven Design (DDD), CQRS, and Event-Driven Architecture with Clean Architecture layers
---

# NestJS DDD/CQRS Architecture Skill

This skill guides implementation of new features in a NestJS application using **Domain-Driven Design (DDD)**, **CQRS (Command Query Responsibility Segregation)**, and **Event-Driven Architecture** following **Clean Architecture** principles.

## Architecture Overview

### Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Event Bus**: NestJS CQRS EventBus (in-memory)
- **Job Queue**: BullMQ + Redis (for async tasks)
- **Database**: PostgreSQL
- **Patterns**: DDD, CQRS, Clean Architecture, Event-Driven Architecture

### Module Structure

Each module follows Clean Architecture / DDD layering:

```
src/modules/{module-name}/
├── domain/                    # Business logic layer (Enterprise Business Rules)
│   ├── aggregates/           # Aggregate roots (business entities)
│   ├── value-objects/        # Immutable value objects
│   ├── events/               # Domain events
│   ├── repositories/         # Repository interfaces (ports)
│   ├── exceptions/           # Domain-specific exceptions
│   └── enums/                # Domain constants
├── application/               # Use cases layer (Application Business Rules)
│   ├── commands/             # CQRS commands
│   ├── queries/              # CQRS queries (if needed)
│   ├── handlers/             # Command/Query/Event handlers
│   ├── dtos/                 # Data transfer objects
│   └── ports/                # Application interfaces/ports
├── infrastructure/            # Frameworks & Drivers (adapters)
│   ├── prisma/               # Prisma repository implementations
│   ├── adapters/             # External service adapters
│   └── jobs/                 # BullMQ workers for async processing
├── presentation/              # Interface Adapters (Controllers & Presenters)
│   └── http/                 # REST controllers
└── {module}.module.ts         # Module configuration
```

**Clean Architecture Layers:**

- **Domain Layer**: Pure business logic, framework-agnostic
- **Application Layer**: Use cases, orchestrates domain logic
- **Infrastructure Layer**: Technical implementations, external services
- **Presentation Layer**: User interface adapters (HTTP, WebSocket, etc.)

## Key Patterns

### 1. Aggregate Pattern

Aggregates are the core of your domain model. They:

- Encapsulate business logic
- Maintain invariants
- Emit domain events
- Have a unique ID and lifecycle

**Example Structure**:

```typescript
export class AuthUser extends AggregateRoot {
  private constructor(
    private _id: string,
    private _email: Email,
    // ... other properties
  ) {
    super();
  }

  // Factory method for creation
  static register(...): AuthUser {
    const user = new AuthUser(...);
    user.apply(new UserRegisteredEvent(...));
    return user;
  }

  // Factory method for reconstruction from DB
  static restore(...): AuthUser {
    return new AuthUser(...);
  }

  // Domain methods that maintain business rules
  verifyOtp(code: string): void {
    // Validate business rules
    // Emit domain event
    this.apply(new UserVerifiedEvent(...));
  }
}
```

### 2. Value Objects

Immutable objects that represent domain concepts:

```typescript
export class Email {
  constructor(private readonly _value: string) {
    // Validation in constructor
    if (!this.isValid(_value)) {
      throw new InvalidEmailException();
    }
  }

  get value(): string {
    return this._value;
  }

  private isValid(email: string): boolean {
    // Validation logic
  }
}
```

### 3. CQRS Pattern

Separate read and write operations:

**Commands** (Write):

```typescript
// Command
export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

// Handler
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  async execute(command: RegisterUserCommand): Promise<void> {
    // 1. Create value objects
    // 2. Create aggregate
    // 3. Save via repository
  }
}
```

**Queries** (Read) - separate if needed.

### 4. Event-Driven Architecture

**Domain Events** are used for communication between modules:

```typescript
// Domain Event
export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly otp: string,
  ) {
    super({ aggregateId });
  }
}
```

**Event Flow**: Aggregate → Domain Event → EventBus → Event Handler(s)

1. **Aggregate emits event**: Business logic triggers event
2. **Repository publishes**: After save, events published to EventBus
3. **Event handlers react**: Multiple handlers can listen to same event
4. **Async processing**: Use BullMQ for long-running tasks

**Repository Pattern with Events**:

```typescript
async save(aggregate: Aggregate): Promise<void> {
  const domainEvents = aggregate.getUncommittedEvents();

  // 1. Save aggregate to database
  await this.prisma.user.upsert(...);

  // 2. Publish events to EventBus
  for (const event of domainEvents) {
    await this.eventBus.publish(event);
  }

  // 3. Mark events as committed
  aggregate.commit();
}
```

**Event Handler Example**:

```typescript
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    // Queue async email job
    await this.emailQueue.add('send-otp', {
      email: event.email,
      otp: event.otp,
    });
  }
}
```

### 5. Cross-Module Communication

**Within Same Application** (via EventBus):

**Auth Module** (produces) → **Notification Module** (consumes):

1. **Auth emits event**: `UserRegisteredEvent`
2. **Repository publishes**: To NestJS EventBus
3. **Notification handler**: Listens and reacts
4. **BullMQ queue**: Sends email asynchronously

**Benefits**:

- ✅ **Loose coupling**: Modules don't directly depend on each other
- ✅ **Scalability**: Multiple handlers can react to same event
- ✅ **Testability**: Easy to test in isolation
- ✅ **Simple**: No external message broker needed

## Implementation Checklist

### Adding a New Command/Feature

#### Step 1: Domain Layer

- [ ] Create domain event in `domain/events/`
- [ ] Add business method to aggregate in `domain/aggregates/`
- [ ] Create value objects if needed in `domain/value-objects/`
- [ ] Add custom exceptions in `domain/exceptions/`

#### Step 2: Application Layer

- [ ] Create command in `application/commands/`
- [ ] Create DTO in `application/dtos/`
- [ ] Create command handler in `application/handlers/`
- [ ] Inject required repositories/ports
- [ ] Ensure repository publishes domain events to EventBus

#### Step 3: Presentation Layer

- [ ] Add endpoint in `presentation/http/{controller}.ts`
- [ ] Use `@ResponseMessage()` decorator
- [ ] Execute command via `CommandBus`

#### Step 4: Registration

- [ ] Register command handler in `{module}.module.ts` providers
- [ ] Import `CqrsModule` in module imports

#### Step 5: Cross-Module Event Handling (if needed)

**If event should trigger actions in other modules:**

**In Consuming Module (e.g., Notification):**

- [ ] Create domain event in `{module}/domain/events/`
- [ ] Create event handler in `{module}/application/handlers/`
- [ ] Use `@EventsHandler(EventName)` decorator
- [ ] Register handler in `{module}.module.ts` providers
- [ ] Import `CqrsModule` in module

**Note**: Both modules must import `CqrsModule` to share the EventBus

## Code Templates

### Complete Feature Implementation Template

```typescript
// ============================================
// DOMAIN LAYER
// ============================================

// domain/events/feature-executed.event.ts
import { DomainEvent } from '@/shared';

export class FeatureExecutedEvent extends DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly data: string,
  ) {
    super({ aggregateId });
  }
}

// domain/aggregates/entity.aggregate.ts
executeFeature(data: ValueObject): void {
  // Validate business rules
  if (!this.canExecute()) {
    throw new BusinessRuleException();
  }

  // Update state
  this._data = data;

  // Emit event
  this.apply(new FeatureExecutedEvent(this.id, data.value));
}

// ============================================
// APPLICATION LAYER
// ============================================

// application/commands/execute-feature.command.ts
export class ExecuteFeatureCommand {
  constructor(public readonly data: string) {}
}

// application/dtos/execute-feature.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class ExecuteFeatureDto {
  @IsString()
  @IsNotEmpty()
  data: string;
}

// application/handlers/execute-feature.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(ExecuteFeatureCommand)
export class ExecuteFeatureHandler
  implements ICommandHandler<ExecuteFeatureCommand> {

  constructor(
    @Inject(ENTITY_REPOSITORY)
    private readonly repository: EntityRepository,
  ) {}

  async execute(command: ExecuteFeatureCommand): Promise<void> {
    // 1. Create value objects
    const dataVO = new DataValueObject(command.data);

    // 2. Load aggregate
    const entity = await this.repository.findById(id);
    if (!entity) throw new EntityNotFoundException();

    // 3. Execute business logic
    entity.executeFeature(dataVO);

    // 4. Persist
    await this.repository.save(entity);
  }
}

// ============================================
// PRESENTATION LAYER
// ============================================

// presentation/http/entity.controller.ts
@Controller('entity')
export class EntityController {
  constructor(private readonly commandBus: CommandBus) {}

  @ResponseMessage('Feature executed successfully')
  @Post('execute')
  async execute(@Body() dto: ExecuteFeatureDto) {
    await this.commandBus.execute(
      new ExecuteFeatureCommand(dto.data),
    );
  }
}

// ============================================
// MODULE REGISTRATION
// ============================================

// entity.module.ts
@Module({
  controllers: [EntityController],
  imports: [InfrastructureModule, CqrsModule],
  providers: [
    ExecuteFeatureHandler, // <-- Register here
    {
      provide: ENTITY_REPOSITORY,
      useClass: PrismaEntityRepository,
    },
  ],
})
export class EntityModule {}
```

## Best Practices

### 1. Naming Conventions

- **Commands**: `{Action}{Entity}Command` (e.g., `RegisterUserCommand`)
- **Events**: `{Entity}{Action}Event` (e.g., `UserRegisteredEvent`)
- **Handlers**: `{CommandName}Handler`
- **DTOs**: `{CommandName}Dto`
- **Aggregates**: `{EntityName}` (e.g., `AuthUser`)
- **Value Objects**: `{Concept}` (e.g., `Email`, `Password`)

### 2. Business Logic Location

✅ **DO**: Put business logic in aggregates

```typescript
// ✅ Good - in aggregate
user.verifyOtp(code);
```

❌ **DON'T**: Put business logic in handlers

```typescript
// ❌ Bad - in handler
if (user.status === 'ACTIVE') {
  throw new Error('Already active');
}
```

### 3. Transaction Boundaries

- Use Prisma transactions for aggregate + events persistence
- One transaction per command execution
- Events saved in same transaction as aggregate

### 4. Error Handling

- Domain exceptions extend `DomainException`
- Use appropriate HTTP status codes
- Let NestJS exception filters handle formatting

### 5. Validation

- **Value Objects**: Validate in constructor
- **DTOs**: Use `class-validator` decorators
- **Aggregates**: Validate business rules in methods

## Common Scenarios

### Scenario 1: Add New User Action

**Example**: Implement "Change Password" feature

1. **Domain**: Add `changePassword()` to `AuthUser` aggregate
2. **Event**: Emit `PasswordChangedEvent` from aggregate
3. **Command**: Create `ChangePasswordCommand` and handler
4. **DTO**: Create `ChangePasswordDto` with validation
5. **Controller**: Add `PATCH /auth/password` endpoint
6. **Module**: Register `ChangePasswordHandler` in providers
7. **(Optional) Cross-module**: If other modules need to react, create event handlers

### Scenario 2: Trigger Notification (Cross-Module)

**Example**: Send welcome email after user verification

1. **Auth Module**:
   - `AuthUser.verify()` emits `UserVerifiedEvent`
   - Repository publishes event to EventBus after saving

2. **Notification Module**:
   - Create `UserVerifiedEventHandler` with `@EventsHandler(UserVerifiedEvent)`
   - Handler queues email job via BullMQ
   - Register handler in `notification.module.ts`

3. **Both Modules**:
   - Import `CqrsModule` to share EventBus

### Scenario 3: Add Async Processing

**Example**: Process large file upload asynchronously

1. **Command Handler**: Queue job instead of processing directly
2. **BullMQ Queue**: Define queue in module
3. **Worker/Processor**: Create processor to handle job
4. **Register**: Add queue and processor to module

```typescript
// In module
BullModule.registerQueue({
  name: 'file-processing',
});

// In command handler
await this.fileQueue.add('process', { fileId });

// In processor
@Processor('file-processing')
export class FileProcessor {
  @Process('process')
  async processFile(job: Job) {
    // Long-running task
  }
}
```

### Scenario 4: Add New Module with Events

1. **Create Structure**: Setup `domain/`, `application/`, `infrastructure/`, `presentation/`
2. **Domain Layer**: Define aggregates, value objects, events
3. **Application Layer**: Create commands, queries, handlers
4. **Infrastructure**: Implement repositories with Prisma
5. **Module Setup**:
   - Import `CqrsModule` for EventBus
   - Import `BullModule.registerQueue()` if needed
   - Register all handlers in providers
6. **Cross-Module**: Create event handlers to react to other modules' events

## Testing Strategy

### Unit Tests

- Test aggregates in isolation
- Verify business logic and invariants
- Assert events are emitted correctly
- Mock repositories and external dependencies

### Integration Tests

- Test handlers with real DB (testcontainers or test database)
- Verify events published to EventBus
- Test full command/query flow
- Verify BullMQ jobs are queued

### E2E Tests

- Test via HTTP endpoints
- Verify downstream effects (events handled, jobs processed)
- Test cross-module event flow

## Troubleshooting

### Events Not Handled

✅ Check event handler registered in module providers  
✅ Verify `@EventsHandler(EventName)` decorator  
✅ Ensure `CqrsModule` imported in both producer and consumer modules  
✅ Check EventBus is published in repository after save

### Jobs Not Processing

✅ Verify BullMQ queue registered in module  
✅ Check Redis connection in `bull-mq.config.ts`  
✅ Ensure processor registered with `@Processor()` decorator  
✅ Verify job added to queue correctly

### Command Handler Not Triggered

✅ Verify handler registered in module providers  
✅ Check `@CommandHandler()` decorator  
✅ Ensure `CqrsModule` imported in module  
✅ Verify CommandBus.execute() called in controller

### Business Logic Not Working

✅ Check if method called on aggregate  
✅ Verify invariants in aggregate methods  
✅ Review domain events emitted  
✅ Check value object validation

## Reference Examples

For implementation guidance, refer to existing code:

- **Aggregates**: Domain entities with business logic
- **Value Objects**: Immutable domain concepts
- **Commands & Handlers**: CQRS command execution
- **Events & Handlers**: Cross-module communication via EventBus
- **Repositories**: Persistence with event publishing
- **BullMQ Jobs**: Async task processing (emails, file processing)

## Architecture Decision Records (ADRs)

### Why EventBus instead of Kafka?

**Context**: Need cross-module communication for domain events

**Decision**: Use NestJS CQRS EventBus (in-memory)

**Rationale**:

- ✅ **Simplicity**: No external message broker to manage
- ✅ **Performance**: Fast in-memory communication
- ✅ **Development**: Easier local development setup
- ✅ **Sufficient**: For single-instance monolithic application
- ✅ **Testability**: Easy to test event flow in isolation

**Trade-offs**:

- ❌ **Not distributed**: Events don't persist across service restarts
- ❌ **Single instance**: Won't work with multiple app instances
- ⚠️ **Future migration**: Can migrate to Kafka/RabbitMQ if needed

### Why BullMQ for Async Processing?

**Context**: Need reliable async job processing (emails, file uploads, etc.)

**Decision**: Use BullMQ with Redis

**Rationale**:

- ✅ **Reliability**: Jobs persisted in Redis
- ✅ **Retry logic**: Built-in retry with exponential backoff
- ✅ **Monitoring**: Redis queue visibility
- ✅ **Performance**: Fast and efficient
- ✅ **Scalability**: Can add workers

### Why No Outbox Pattern?

** Context**: Traditional event-driven systems use Outbox for transactional guarantees

**Decision**: Skip Outbox pattern, use direct EventBus publishing

**Rationale**:

- ✅ **In-memory EventBus**: Events handled synchronously in same process
- ✅ **No distributed transactions**: Not using external message brokers
- ✅ **Simpler code**: Less complexity
- ⚠️ **Acceptable risk**: For current application scale

**Note**: If you scale to microservices or need guaranteed delivery across restarts, revisit this decision and implement Outbox + message broker.

## Quick Reference Commands

```bash
# Start dev server
pnpm run dev

# Build
pnpm run build

# Prisma
pnpm prisma studio          # View database
pnpm prisma migrate dev     # Create migration
pnpm prisma generate        # Generate client

# Docker
docker-compose up           # Start all services
docker-compose up -d        # Start in background
docker-compose logs -f      # View logs
```

---

**Remember**: This architecture prioritizes **business logic clarity**, **testability**, and **scalability** through proper separation of concerns and loose coupling via events.
