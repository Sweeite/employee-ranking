"use client";

import { useState } from "react";
import type { Employee } from "@/lib/types";

const UP_REACTIONS = ["👍", "🔥", "🚀", "👑"];
const DOWN_REACTIONS = ["👎", "💩", "🐌", "🗑️"];

export default function VoteDialog({
  employee,
  delta,
  onClose,
  onVoted,
}: {
  employee: Employee;
  delta: 1 | -1;
  onClose: () => void;
  onVoted: () => void;
}) {
  const options = delta === 1 ? UP_REACTIONS : DOWN_REACTIONS;
  const [reaction, setReaction] = useState(options[0]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta, reaction, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      onVoted();
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-800">
          {delta === 1 ? "Boost" : "Tank"} {employee.emoji} {employee.name}
        </h3>
        <p className="mb-4 text-sm text-slate-500">Every ranking swing needs a reason. Make it count.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            {options.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setReaction(r)}
                className={`flex-1 rounded-lg border py-2 text-xl transition ${
                  reaction === r
                    ? "border-fuchsia-300 bg-fuchsia-50 ring-2 ring-fuchsia-100"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              delta === 1
                ? "e.g. Brought donuts unprompted"
                : "e.g. Microwaved fish in the break room"
            }
            maxLength={200}
            required
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-fuchsia-400 focus:bg-white focus:ring-2 focus:ring-fuchsia-100"
          />

          {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                delta === 1 ? "bg-emerald-500 hover:bg-emerald-400" : "bg-rose-500 hover:bg-rose-400"
              }`}
            >
              {submitting ? "Submitting…" : delta === 1 ? "Confirm Boost" : "Confirm Tank"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
