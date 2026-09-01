import { NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema, VoteLogEntry } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSchema();
  const { rows } = await sql<VoteLogEntry>`
    SELECT
      v.id, v.employee_id, e.name AS employee_name, e.emoji AS employee_emoji,
      v.delta, v.reaction, v.reason, v.created_at
    FROM votes v
    JOIN employees e ON e.id = v.employee_id
    ORDER BY v.created_at DESC
    LIMIT 50;
  `;
  return NextResponse.json(rows);
}
