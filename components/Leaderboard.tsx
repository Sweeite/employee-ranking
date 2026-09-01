"use client";

import { useState } from "react";
import type { Employee } from "@/lib/types";
import VoteDialog from "./VoteDialog";
import EditEmployeeDialog from "./EditEmployeeDialog";

const MEDALS = ["🥇", "🥈", "🥉"];

function scoreColor(score: number) {
  if (score > 0) return "text-emerald-500";
  if (score < 0) return "text-rose-500";
  return "text-slate-400";
}

export default function Leaderboard({
  employees,
  onChanged,
}: {
  employees: Employee[];
  onChanged: () => void;
}) {
  const [voteTarget, setVoteTarget] = useState<{ employee: Employee; delta: 1 | -1 } | null>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(emp: Employee) {
    if (!confirm(`Remove ${emp.name} from the leaderboard? This deletes their entire vote history.`)) {
      return;
    }
    setDeletingId(emp.id);
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: "DELETE" });
      if (res.ok) onChanged();
    } finally {
      setDeletingId(null);
    }
  }

  if (employees.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-400">
        No one's on the board yet. Add your first victim above. 👆
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {employees.map((emp, i) => (
          <li
            key={emp.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-md sm:p-4"
          >
            <div className="w-8 shrink-0 text-center text-lg font-bold text-slate-400">
              {MEDALS[i] ?? `#${i + 1}`}
            </div>
            <div className="text-2xl">{emp.emoji}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800">{emp.name}</p>
              <p className="truncate text-xs text-slate-400">{emp.title}</p>
            </div>
            <div className={`w-14 shrink-0 text-right text-lg font-bold ${scoreColor(emp.score)}`}>
              {emp.score > 0 ? `+${emp.score}` : emp.score}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => setVoteTarget({ employee: emp, delta: 1 })}
                title="Boost"
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-emerald-500 transition hover:bg-emerald-100"
              >
                ▲
              </button>
              <button
                onClick={() => setVoteTarget({ employee: emp, delta: -1 })}
                title="Tank"
                className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-rose-500 transition hover:bg-rose-100"
              >
                ▼
              </button>
              <button
                onClick={() => setEditTarget(emp)}
                title="Edit name & emoji"
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-400 transition hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-500"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(emp)}
                disabled={deletingId === emp.id}
                title="Delete employee"
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      {voteTarget && (
        <VoteDialog
          employee={voteTarget.employee}
          delta={voteTarget.delta}
          onClose={() => setVoteTarget(null)}
          onVoted={onChanged}
        />
      )}

      {editTarget && (
        <EditEmployeeDialog
          employee={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={onChanged}
        />
      )}
    </>
  );
}
