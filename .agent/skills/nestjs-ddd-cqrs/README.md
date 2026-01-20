# NestJS DDD/CQRS Architecture Skill

This skill provides comprehensive guidance for implementing features in a NestJS application following **Domain-Driven Design (DDD)** and **CQRS** patterns.

## What's Included

- **SKILL.md**: Complete architecture documentation with patterns, best practices, and templates
- **examples/**: Real-world implementation examples

## When to Use This Skill

Use this skill when you need to:

- Add a new feature/command to an existing module
- Create a new module following DDD principles
- Implement cross-module event communication
- Set up email notifications triggered by domain events
- Understand the project's architecture patterns

## Quick Start

1. **Read SKILL.md** for architecture overview
2. **Check examples/** for reference implementations
3. **Follow the checklists** for step-by-step guidance

## Key Patterns Covered

- ✅ Aggregate Root pattern
- ✅ Value Objects
- ✅ CQRS (Command Query Responsibility Segregation)
- ✅ Domain Events
- ✅ Event-Driven Architecture
- ✅ Outbox Pattern (reliable event publishing)
- ✅ Cross-module communication via Kafka
- ✅ Async job processing with BullMQ

## Architecture Layers

```
domain/         → Business logic (aggregates, events, value objects)
application/    → Use cases (commands, queries, handlers)
infrastructure/ → Technical implementations (Prisma, Kafka, BullMQ)
presentation/   → Interfaces (HTTP controllers, event consumers)
```

## Common Tasks

### Add New Command

1. Create domain event
2. Add method to aggregate
3. Create command + DTO
4. Create command handler
5. Add controller endpoint
6. Register handler in module

### Trigger Email Notification

1. Emit domain event in auth module
2. Create event handler in notification module
3. Add Kafka consumer
4. Queue email job via BullMQ
5. Email worker sends email

## Support

For questions about the architecture, refer to:

- Existing implementations (e.g., `ResendVerificationCode` feature)
- Mermaid diagrams in SKILL.md
- Code templates and examples
