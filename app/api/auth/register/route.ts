import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema } from "@/lib/db";
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(req: NextRequest) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-20 characters: letters, numbers, underscores only." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE username = ${username};`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  const passwordHash = hashPassword(password);
  const { rows } = await sql`
    INSERT INTO users (username, password_hash) VALUES (${username}, ${passwordHash})
    RETURNING id, username, rep;
  `;
  const user = rows[0];
  const { token, expiresAt } = await createSession(user.id);

  const res = NextResponse.json(user, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  return res;
}
