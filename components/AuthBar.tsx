"use client";

import { useState } from "react";
import type { User } from "@/lib/types";

export default function AuthBar({
  user,
  onAuthChanged,
}: {
  user: User | null;
  onAuthChanged: (user: User | null) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setUsername("");
      setPassword("");
      onAuthChanged(data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onAuthChanged(null);
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm shadow-slate-200/60">
        <span className="font-semibold text-slate-800">👋 {user.username}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            user.rep > 0
              ? "bg-emerald-50 text-emerald-500"
              : user.rep < 0
              ? "bg-rose-50 text-rose-500"
              : "bg-slate-100 text-slate-400"
          }`}
          title="Reputation"
        >
          {user.rep > 0 ? `+${user.rep}` : user.rep} rep
        </span>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-rose-500"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center sm:justify-center"
    >
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
        maxLength={20}
        required
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-fuchsia-400 focus:bg-white focus:ring-2 focus:ring-fuchsia-100 sm:w-40"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        type="password"
        minLength={6}
        required
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-fuchsia-400 focus:bg-white focus:ring-2 focus:ring-fuchsia-100 sm:w-40"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-orange-400 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "…" : mode === "login" ? "Log in" : "Sign up"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="text-xs font-medium text-slate-400 underline decoration-dotted hover:text-fuchsia-500"
      >
        {mode === "login" ? "Need an account?" : "Have an account?"}
      </button>
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </form>
  );
}
