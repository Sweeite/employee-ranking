"use client";

import { useCallback, useEffect, useState } from "react";
import type { Employee, VoteLogEntry } from "@/lib/types";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import Leaderboard from "@/components/Leaderboard";
import ActivityLog from "@/components/ActivityLog";

const POLL_MS = 8000;

export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [log, setLog] = useState<VoteLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [empRes, logRes] = await Promise.all([fetch("/api/employees"), fetch("/api/log")]);
    if (empRes.ok) setEmployees(await empRes.json());
    if (logRes.ok) setLog(await logRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:py-14">
      <header className="text-center">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          🏆 Office Power Rankings
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Totally unscientific. Completely unofficial. Rankings rise and fall on vibes alone.
        </p>
      </header>

      <AddEmployeeForm onAdded={refresh} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <section>
          <h2 className="mb-3 text-lg font-bold">Leaderboard</h2>
          {loading ? (
            <p className="text-sm text-slate-400">Loading rankings…</p>
          ) : (
            <Leaderboard employees={employees} onChanged={refresh} />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Activity Log</h2>
          <ActivityLog entries={log} />
        </section>
      </div>

      <footer className="pt-6 text-center text-xs text-slate-600">
        Please don't actually use this to inform performance reviews.
      </footer>
    </main>
  );
}
