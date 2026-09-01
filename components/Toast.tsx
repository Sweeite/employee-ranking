"use client";

import { useEffect } from "react";

export default function Toast({
  message,
  tone = "info",
  onDismiss,
}: {
  message: string;
  tone?: "info" | "good" | "bad";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const toneClasses =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "bad"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        className={`pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${toneClasses}`}
        onClick={onDismiss}
        role="status"
      >
        {message}
      </div>
    </div>
  );
}
