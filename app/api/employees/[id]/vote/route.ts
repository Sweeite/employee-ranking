import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { crossedMilestone, milestoneMessage } from "@/lib/flavor";

const ALLOWED_REACTIONS = new Set(["🔥", "🚀", "👑", "💩", "🐌", "🗑️", "👍", "👎"]);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Log in to cast a vote." }, { status: 401 });
  }

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

  const employee = await sql`SELECT id, name, emoji FROM employees WHERE id = ${employeeId};`;
  if (employee.rows.length === 0) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }
  const emp = employee.rows[0];

  const before = await sql`SELECT COALESCE(SUM(delta), 0)::int AS score FROM votes WHERE employee_id = ${employeeId};`;
  const oldScore = before.rows[0].score as number;

  const { rows } = await sql`
    INSERT INTO votes (employee_id, delta, reaction, reason)
    VALUES (${employeeId}, ${delta}, ${reaction}, ${reason})
    RETURNING id, employee_id, delta, reaction, reason, created_at;
  `;

  const newScore = oldScore + delta;
  const milestone = crossedMilestone(oldScore, newScore);
  let milestoneEntry: { milestone: number; message: string } | null = null;

  if (milestone !== null) {
    const message = milestoneMessage(emp.emoji, emp.name, milestone);
    await sql`
      INSERT INTO drama_log (kind, employee_name, employee_emoji, actor_username, message)
      VALUES ('milestone', ${emp.name}, ${emp.emoji}, ${user.username}, ${message});
    `;
    milestoneEntry = { milestone, message };
  }

  return NextResponse.json({ ...rows[0], milestone: milestoneEntry }, { status: 201 });
}
