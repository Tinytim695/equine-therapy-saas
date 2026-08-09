"use client";

import { useEffect } from "react";

export type ToastTone = "success" | "error" | "info";

export interface ToastState {
  message: string;
  tone: ToastTone;
}

const TONE_STYLES: Record<ToastTone, string> = {
  success: "bg-emerald-800 text-white border-emerald-900",
  error: "bg-red-700 text-white border-red-800",
  info: "bg-slate-800 text-white border-slate-900",
};

export default function Toast({
  toast,
  onDismiss,
  durationMs = 4000,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [toast, onDismiss, durationMs]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-md pointer-events-none"
      role="alert"
    >
      <div
        className={`pointer-events-auto rounded-xl border shadow-lg px-4 py-3 text-sm font-medium flex items-start justify-between gap-3 ${TONE_STYLES[toast.tone]}`}
      >
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-80 hover:opacity-100 text-xs uppercase tracking-wide"
        >
          Close
        </button>
      </div>
    </div>
  );
}
