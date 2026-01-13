FROM node:22-alpine AS builder

# Enable Corepack và cài pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy lock file và package.json
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm exec prisma generate

# Build application
RUN pnpm run build

# Prune dev dependencies
RUN pnpm prune --prod


# =================================================================
# STAGE 2: PRODUCTION
# =================================================================
FROM node:22-alpine

# Enable Corepack và cài pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy package files
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./

# Copy production dependencies
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist

# Copy Prisma schema (needed for Prisma Client)
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

CMD [ "node", "dist/src/main" ]