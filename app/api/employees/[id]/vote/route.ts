import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema } from "@/lib/db";

const ALLOWED_REACTIONS = new Set(["🔥", "🚀", "👑", "💩", "🐌", "🗑️", "👍", "👎"]);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const employeeId = Number(params.id);
  if (!Number.isInteger(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const delta = body.delta === -1 ? -1 : body.delta === 1 ? 1 : null;
  const reaction = typeof body.reaction === "string" && ALLOWED_REACTIONS.has(body.reaction)
    ? body.reaction
    : delta === 1 ? "👍" : "👎";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (delta === null) {
    return NextResponse.json({ error: "delta must be 1 or -1." }, { status: 400 });
  }
  if (!reason) {
    return NextResponse.json({ error: "A reason is required. Justify yourself." }, { status: 400 });
  }
  if (reason.length > 200) {
    return NextResponse.json({ error: "Reason is too long (max 200 characters)." }, { status: 400 });
  }

  const employee = await sql`SELECT id, name FROM employees WHERE id = ${employeeId};`;
  if (employee.rows.length === 0) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  const { rows } = await sql`
    INSERT INTO votes (employee_id, delta, reaction, reason)
    VALUES (${employeeId}, ${delta}, ${reaction}, ${reason})
    RETURNING id, employee_id, delta, reaction, reason, created_at;
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
