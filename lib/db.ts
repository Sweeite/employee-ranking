import { sql } from "@/lib/pg";
import type { Employee, VoteLogEntry } from "@/lib/types";

export type { Employee, VoteLogEntry };

let schemaReady: Promise<void> | null = null;

// Serverless-friendly lazy migration: runs once per cold start, cheap no-op after (IF NOT EXISTS).
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT 'Employee of Questionable Merit',
          emoji TEXT NOT NULL DEFAULT '🧑‍💼',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
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
    })();
  }
  return schemaReady;
}
