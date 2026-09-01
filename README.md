# Office Power Rankings 🏆

A joke employee leaderboard. Anyone can add an employee, then boost (▲) or
tank (▼) their ranking with a reaction and a required reason — every vote
is logged to a public activity feed so the drama is fully auditable.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Postgres via [`pg`](https://node-postgres.com/), pointed at `POSTGRES_URL` — works with any
  Postgres (local dev) and with [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Neon) in production
- No auth — fully open, matching the "joke app" vibe

## How ranking works

An employee's score is the sum of all `+1` / `-1` votes cast on them, each
with a reaction emoji and a mandatory reason. The leaderboard is just
`ORDER BY score DESC`, so it moves up and down live as votes come in. The
schema is created automatically on first request (`ensureSchema()` in
`lib/db.ts`) — no manual migration step needed.

## Local development

```bash
npm install
```

You need a Postgres connection for local dev too. Either:

- Point at any local/Docker Postgres: create a `.env.local` with
  `POSTGRES_URL=postgres://user:pass@localhost:5432/dbname`, or
- Use the real Neon database: create the project on Vercel, add the
  **Postgres (Neon)** integration from the Storage tab, then run
  `vercel link` and `vercel env pull .env.local` to pull `POSTGRES_URL`
  down locally.

Then `npm run dev` and visit `http://localhost:3000`.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In the project's **Storage** tab, add a **Postgres** database (Neon) —
   Vercel wires up the `POSTGRES_URL*` env vars automatically.
3. Deploy. The first request creates the `employees` and `votes` tables.

## API

- `GET /api/employees` — leaderboard, sorted by score
- `POST /api/employees` — `{ name, title? }`
- `DELETE /api/employees/:id` — removes the employee and their vote history
- `POST /api/employees/:id/vote` — `{ delta: 1 | -1, reaction, reason }`
- `GET /api/log` — most recent 50 votes with reasons
