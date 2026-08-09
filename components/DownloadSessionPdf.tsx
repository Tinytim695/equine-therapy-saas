"use client";

import { useState } from "react";
import {
  downloadSessionPdf,
  type SessionPdfInput,
} from "@/lib/pdf/sessionReport";

interface DownloadSessionPdfProps {
  session: SessionPdfInput;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function DownloadSessionPdf({
  session,
  label = "Download Session PDF",
  className = "",
  disabled = false,
}: DownloadSessionPdfProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = () => {
    if (disabled || busy) return;
    setBusy(true);
    try {
      downloadSessionPdf(session);
    } finally {
      setTimeout(() => setBusy(false), 400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || busy}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5"
        aria-hidden
      >
        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
      </svg>
      {busy ? "Preparing PDF…" : label}
    </button>
  );
}
