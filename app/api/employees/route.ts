import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema, Employee } from "@/lib/db";

const EMOJIS = ["🦄", "🐸", "🦖", "🐙", "🦊", "🐢", "🦥", "🐝", "🦩", "🐳", "🦁", "🐧"];

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSchema();
  const { rows } = await sql<Employee>`
    SELECT
      e.id, e.name, e.title, e.emoji, e.created_at,
      COALESCE(SUM(v.delta), 0)::int AS score,
      COUNT(v.id)::int AS vote_count
    FROM employees e
    LEFT JOIN votes v ON v.employee_id = e.id
    GROUP BY e.id
    ORDER BY score DESC, e.created_at ASC;
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (name.length > 60) {
    return NextResponse.json({ error: "Name is too long (max 60 characters)." }, { status: 400 });
  }
  if (title.length > 80) {
    return NextResponse.json({ error: "Title is too long (max 80 characters)." }, { status: 400 });
  }

  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const finalTitle = title || "Employee of Questionable Merit";

  const { rows } = await sql`
    INSERT INTO employees (name, title, emoji)
    VALUES (${name}, ${finalTitle}, ${emoji})
    RETURNING id, name, title, emoji, created_at, 0::int AS score, 0::int AS vote_count;
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
