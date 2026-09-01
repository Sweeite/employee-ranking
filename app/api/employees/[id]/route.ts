import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { deleteMessage } from "@/lib/flavor";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Log in to edit the board." }, { status: 401 });
  }

  const employeeId = Number(params.id);
  if (!Number.isInteger(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (name.length > 60) {
    return NextResponse.json({ error: "Name is too long (max 60 characters)." }, { status: 400 });
  }
  if (!emoji) {
    return NextResponse.json({ error: "Emoji is required." }, { status: 400 });
  }
  if (emoji.length > 8) {
    return NextResponse.json({ error: "Emoji is too long." }, { status: 400 });
  }

  const { rows } = await sql`
    UPDATE employees SET name = ${name}, emoji = ${emoji} WHERE id = ${employeeId}
    RETURNING id, name, title, emoji, created_at;
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json(rows[0], { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Log in to delete someone from the board." }, { status: 401 });
  }

  const employeeId = Number(params.id);
  if (!Number.isInteger(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id." }, { status: 400 });
  }

  const existing = await sql`SELECT id, name, emoji, creator_id FROM employees WHERE id = ${employeeId};`;
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }
  const emp = existing.rows[0];
  const isCreator = emp.creator_id === user.id;
  const repChange = isCreator ? 0 : -3;
  const message = deleteMessage(user.username, emp.emoji, emp.name, isCreator);

  await sql`DELETE FROM employees WHERE id = ${employeeId};`;

  if (!isCreator) {
    await sql`UPDATE users SET rep = rep - 3 WHERE id = ${user.id};`;
  }

  await sql`
    INSERT INTO drama_log (kind, employee_name, employee_emoji, actor_username, message)
    VALUES ('delete', ${emp.name}, ${emp.emoji}, ${user.username}, ${message});
  `;

  return NextResponse.json({ id: employeeId, repChange, message, isCreator }, { status: 200 });
}
