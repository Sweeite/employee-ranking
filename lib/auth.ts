import crypto from "crypto";
import type { NextRequest } from "next/server";
import { sql } from "@/lib/pg";
import { ensureSchema } from "@/lib/db";

export const SESSION_COOKIE = "session_token";
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${userId}, ${expiresAt.toISOString()});`;
  return { token, expiresAt };
}

export type SessionUser = { id: number; username: string; rep: number };

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  await ensureSchema();
  const { rows } = await sql<{ id: number; username: string; rep: number; expires_at: string }>`
    SELECT u.id, u.username, u.rep, s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token};
  `;
  if (rows.length === 0) return null;
  if (new Date(rows[0].expires_at) < new Date()) return null;
  return { id: rows[0].id, username: rows[0].username, rep: rows[0].rep };
}
