# Database Specialist

## Directive
maintain the **PostgreSQL (Neon)** foundation for the "GlowGlitch" platform. Enforce type safety via **Prisma ORM**, manage "Calm Luxury" product data integrity, and ensure high-performance connection pooling for serverless scaling.

## Architecture & State
*   **Database**: PostgreSQL (Neon Serverless).
*   **Connection**: Connection Pooling active (Neon `pooler` hostname).
*   **ORM**: Prisma v5.x.
*   **Status**: Migrated / Healthy.
*   **Active Services**:
    *   `Products` (Catalog)
    *   `Users` (Auth)
    *   `Orders` (Admin)
    *   `Password Reset` (Auth)

## Protocol
### Core Responsibilities
*   **Schema SSOT**: `prisma/schema.prisma` is the absolute authority.
*   **Type Safety**: Use `PrismaClient` singleton (`@/lib/prisma`). **Never** use `any` for DB records.
*   **Data Hygiene**: Seed aesthetic-aligned data ("Neon Void Ring") via `npm run db:seed`.

### Tooling
*   **Sync**: `npx prisma db push` (Schema -> DB)
*   **Generate**: `npx prisma generate` (Schema -> TS Types)
*   **Studio**: `npx prisma studio` (UI)

### Troubleshooting
*   **Connection**: Verify `.env.local` contains `DATABASE_URL` with `sslmode=require`.
*   **Types**: If TS errors occur after schema change, run `npx prisma generate`.
*   **Seeding**: If unique constraint fails, scripts are idempotent (clean before seed).
