"use client";

import { useState } from "react";
import type { Employee } from "@/lib/types";
import VoteDialog from "./VoteDialog";

const MEDALS = ["🥇", "🥈", "🥉"];

function scoreColor(score: number) {
  if (score > 0) return "text-emerald-400";
  if (score < 0) return "text-rose-400";
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

  if (employees.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-slate-400">
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
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-white/20 sm:p-4"
          >
            <div className="w-8 shrink-0 text-center text-lg font-bold text-slate-400">
              {MEDALS[i] ?? `#${i + 1}`}
            </div>
            <div className="text-2xl">{emp.emoji}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{emp.name}</p>
              <p className="truncate text-xs text-slate-400">{emp.title}</p>
            </div>
            <div className={`w-14 shrink-0 text-right text-lg font-bold ${scoreColor(emp.score)}`}>
              {emp.score > 0 ? `+${emp.score}` : emp.score}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => setVoteTarget({ employee: emp, delta: 1 })}
                title="Boost"
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-emerald-400 transition hover:bg-emerald-500/20"
              >
                ▲
              </button>
              <button
                onClick={() => setVoteTarget({ employee: emp, delta: -1 })}
                title="Tank"
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-rose-400 transition hover:bg-rose-500/20"
              >
                ▼
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
    </>
  );
}
