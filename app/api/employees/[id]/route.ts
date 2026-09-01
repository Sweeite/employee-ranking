import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema } from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const employeeId = Number(params.id);
  if (!Number.isInteger(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id." }, { status: 400 });
  }

  const { rows } = await sql`DELETE FROM employees WHERE id = ${employeeId} RETURNING id;`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json({ id: employeeId }, { status: 200 });
}
