# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm start:dev        # Start with hot reload
pnpm build            # Compile TypeScript
pnpm start:prod       # Run compiled build

# Code quality
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting

# Testing
pnpm test             # Run all unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:cov         # Generate coverage report
pnpm test:e2e         # Run end-to-end tests

# Database
npx prisma migrate dev        # Apply migrations in development
npx prisma generate           # Regenerate Prisma client (outputs to generated/prisma)
npx prisma studio             # Open Prisma Studio GUI
```

## Architecture

This is a NestJS backend for an academic GitHub tracking system using **Clean Architecture + CQRS**.

### Layer Structure (per feature module)

Each module under `src/modules/` follows this 4-layer pattern:

```
modules/<name>/
├── presentation/     # HTTP controllers and DTOs
├── application/      # Commands, queries, handlers, jobs, services
├── domain/           # Entities, aggregates, repository interfaces, types
└── infrastructure/   # Prisma repository implementations, mappers
```

**Dependency flow**: `presentation → application → domain ← infrastructure`

### Feature Modules

- **`academic/`** — Core academic domain: semesters, courses, classes, enrollments, projects, repositories. Heavily uses CQRS with separate `commands/` and `queries/` in the application layer.
- **`auth/`** — Authentication via JWT + Google OAuth + GitHub OAuth. Uses Passport.js strategies in `infrastructure/strategies/`.
- **`identity/`** — User profile management (students, lecturers, admins).
- **`tracking/`** — GitHub commit syncing. Uses BullMQ job queue (`application/jobs/`) with producers and consumers for async sync operations. GitHub API calls via Octokit.

### Key Infrastructure

- **Database**: PostgreSQL via Prisma ORM. Client generated to `generated/prisma/` (not the default location). Schema lives in `prisma/schema.prisma`.
- **Transactions**: `nestjs-cls` + `@nestjs-cls/transactional-adapter-prisma` for CLS-based transaction propagation across services.
- **Queue**: BullMQ backed by Redis for async jobs (GitHub commit sync).
- **Config**: Environment variables validated via Zod schema at `src/config/env/env.schema.ts`. All config modules live in `src/config/`.

### Import Path Aliases

- `@/*` → `src/*`
- `@generated/*` → `generated/*`

### Auth Guards (apply in order)

1. `JwtAccessGuard` — verifies JWT access token
2. `RolesGuard` — checks user role (ADMIN, LECTURER, STUDENT)
3. `StudentReadyGuard` — verifies student has completed onboarding

### CQRS Pattern

Commands and queries in `application/commands/` and `application/queries/` are dispatched via NestJS `CommandBus`/`QueryBus`. Handlers in `application/handlers/` implement `ICommandHandler` or `IQueryHandler`.

### Prisma Usage

Always inject `PrismaService` from `src/infrastructure/database/prisma/`. For transactional operations, use `@Transactional()` decorator from `@nestjs-cls/transactional` rather than manual `$transaction` calls.

### Environment

Requires a `.env` or `.env.local` file. See `src/config/env/env.schema.ts` for all required variables (DATABASE_URL, DIRECT_URL, JWT secrets, Google/GitHub OAuth, Firebase, Cloudinary, Redis, CORS_ORIGINS, ENCRYPTION_KEY).
