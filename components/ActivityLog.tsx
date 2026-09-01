"use client";

import type { VoteLogEntry } from "@/lib/types";

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ActivityLog({ entries }: { entries: VoteLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
        No drama logged yet.
      </div>
    );
  }

  return (
    <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto pr-1">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">
              {entry.reaction} {entry.employee_emoji} {entry.employee_name}
            </span>
            <span
              className={`shrink-0 text-xs font-bold ${
                entry.delta > 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
            </span>
          </div>
          <p className="mt-1 text-slate-300">"{entry.reason}"</p>
          <p className="mt-1 text-xs text-slate-500">{timeAgo(entry.created_at)}</p>
        </li>
      ))}
    </ul>
  );
}
