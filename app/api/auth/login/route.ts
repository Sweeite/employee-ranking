import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema } from "@/lib/db";
import { verifyPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const { rows } = await sql`SELECT id, username, password_hash, rep FROM users WHERE username = ${username};`;
  if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const user = { id: rows[0].id, username: rows[0].username, rep: rows[0].rep };
  const { token, expiresAt } = await createSession(user.id);

  const res = NextResponse.json(user, { status: 200 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  return res;
}
