"use client";

import { useCallback, useEffect, useState } from "react";
import type { Employee, LogEntry, Milestone, User } from "@/lib/types";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import Leaderboard from "@/components/Leaderboard";
import ActivityLog from "@/components/ActivityLog";
import AuthBar from "@/components/AuthBar";
import Toast from "@/components/Toast";

const POLL_MS = 8000;

export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "info" | "good" | "bad" } | null>(null);

  const refresh = useCallback(async () => {
    const [empRes, logRes] = await Promise.all([fetch("/api/employees"), fetch("/api/log")]);
    if (empRes.ok) setEmployees(await empRes.json());
    if (logRes.ok) setLog(await logRes.json());
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  }, []);

  useEffect(() => {
    refresh();
    refreshUser();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh, refreshUser]);

  function handleAuthChanged(nextUser: User | null) {
    setUser(nextUser);
    refresh();
  }

  function handleMilestone(milestone: Milestone) {
    setToast({ message: milestone.message, tone: milestone.milestone > 0 ? "good" : "bad" });
  }

  function handleDeleteFeedback(message: string, tone: "good" | "bad") {
    setToast({ message, tone });
    refreshUser();
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:py-14">
      <header className="text-center">
        <h1 className="bg-gradient-to-r from-fuchsia-500 via-orange-400 to-amber-400 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
          🏆 Office Power Rankings
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Totally unscientific. Completely unofficial. Rankings rise and fall on vibes alone.
        </p>
      </header>

      <AuthBar user={user} onAuthChanged={handleAuthChanged} />

      <AddEmployeeForm loggedIn={user !== null} onAdded={refresh} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">🏅 Leaderboard</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading rankings…</p>
          ) : (
            <Leaderboard
              employees={employees}
              currentUser={user}
              onChanged={refresh}
              onMilestone={handleMilestone}
              onDeleteFeedback={handleDeleteFeedback}
            />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">📣 Drama Log</h2>
          <ActivityLog entries={log} />
        </section>
      </div>

      <footer className="pt-6 text-center text-xs text-slate-400">
        Please don't actually use this to inform performance reviews.
      </footer>

      {toast && <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />}
    </main>
  );
}
