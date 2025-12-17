# CourtFlow

Court booking platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Requirements

- Node.js 18+
- PostgreSQL

## Run Locally

1. Install dependencies:
	- `npm install`

2. Create your environment file:
	- Windows (PowerShell): `Copy-Item .env.example .env`
	- macOS/Linux: `cp .env.example .env`

3. Set `DATABASE_URL` in `.env` (PostgreSQL connection string).

4. Create/update the database schema:
	- `npm run db:push`

5. Seed initial data (courts, coaches, equipment, pricing rules):
	- `npm run db:seed`

6. Start the app:
	- `npm run dev`
	- Open `http://localhost:3000`

## Assumptions

- Booking duration is one hour per selected time slot.
- Availability is computed using overlap checks against existing bookings for the selected day.
- A booking can optionally include one coach and multiple equipment items.
- Pricing rules are data-driven and applied by priority; each booking stores a JSON price breakdown snapshot for auditability.
- Local development uses `prisma db push` (no migration history in this repo).
- The seed script (`prisma/seed.ts`) clears existing data and creates a demo user with id `user_demo`.

## Write-up

See [WRITEUP.md](WRITEUP.md) for the 300–500 word explanation of the DB design and pricing engine approach.

## Scripts

- `npm run dev` - Start Next.js in development
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Apply Prisma schema to the database
- `npm run db:seed` - Seed initial data
- `npm run db:studio` - Open Prisma Studio
