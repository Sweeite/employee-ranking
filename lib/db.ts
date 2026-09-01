import { sql } from "@/lib/pg";
import type { Employee, VoteLogEntry } from "@/lib/types";

export type { Employee, VoteLogEntry };

let schemaReady: Promise<void> | null = null;

// Serverless-friendly lazy migration: runs once per cold start, cheap no-op after (IF NOT EXISTS).
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          rep INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          expires_at TIMESTAMPTZ NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT 'Employee of Questionable Merit',
          emoji TEXT NOT NULL DEFAULT '🧑‍💼',
          creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      // Migration for tables created before creator_id existed.
      await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`;
      await sql`
        CREATE TABLE IF NOT EXISTS votes (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
          delta INTEGER NOT NULL,
          reaction TEXT NOT NULL DEFAULT '👍',
          reason TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      // Snapshotted so entries survive employee deletion; not a foreign key.
      await sql`
        CREATE TABLE IF NOT EXISTS drama_log (
          id SERIAL PRIMARY KEY,
          kind TEXT NOT NULL,
          employee_name TEXT NOT NULL,
          employee_emoji TEXT NOT NULL,
          actor_username TEXT,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
    })();
  }
  return schemaReady;
}
