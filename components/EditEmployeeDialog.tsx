"use client";

import { useState } from "react";
import type { Employee } from "@/lib/types";

export default function EditEmployeeDialog({
  employee,
  onClose,
  onSaved,
}: {
  employee: Employee;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(employee.name);
  const [emoji, setEmoji] = useState(employee.emoji);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      onSaved();
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
        <h3 className="text-lg font-bold text-slate-800">Edit Employee</h3>
        <p className="mb-4 text-sm text-slate-500">Update their name and emoji.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="w-20 shrink-0">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Emoji
              </label>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={8}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xl outline-none focus:border-fuchsia-400 focus:bg-white focus:ring-2 focus:ring-fuchsia-100"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-fuchsia-400 focus:bg-white focus:ring-2 focus:ring-fuchsia-100"
              />
            </div>
          </div>

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
              disabled={submitting || !name.trim() || !emoji.trim()}
              className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
