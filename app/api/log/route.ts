import { NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema } from "@/lib/db";
import type { LogEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSchema();
  const { rows } = await sql<LogEntry>`
    (
      SELECT
        'vote' AS kind, v.id, e.name AS employee_name, e.emoji AS employee_emoji,
        v.delta, v.reaction, v.reason, NULL::text AS actor_username, NULL::text AS message, v.created_at
      FROM votes v
      JOIN employees e ON e.id = v.employee_id
    )
    UNION ALL
    (
      SELECT
        d.kind, d.id, d.employee_name, d.employee_emoji,
        NULL::int AS delta, NULL::text AS reaction, NULL::text AS reason, d.actor_username, d.message, d.created_at
      FROM drama_log d
    )
    ORDER BY created_at DESC
    LIMIT 50;
  `;
  return NextResponse.json(rows);
}
