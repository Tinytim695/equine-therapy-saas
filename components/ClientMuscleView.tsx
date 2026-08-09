"use client";

import {
  MUSCLE_ZONES,
  SEVERITY_COLORS,
  type MuscleZoneId,
  type Severity,
  type ZoneState,
} from "@/types/muscle";

interface ClientMuscleViewProps {
  zones?: ZoneState[];
  lastUpdated?: string;
}

const PLAIN_ENGLISH: Record<Severity, string> = {
  normal: "Looking good — no extra care needed right now",
  mild: "Soreness detected — needs gentle stretching",
  severe: "Significant tension — follow therapist guidance closely",
};

const SEVERITY_ICON: Record<Severity, string> = {
  normal: "✓",
  mild: "!",
  severe: "!!",
};

const DEFAULT_ZONES: ZoneState[] = MUSCLE_ZONES.map((z) => ({
  zoneId: z.id,
  severity: "normal" as Severity,
}));

export default function ClientMuscleView({
  zones = DEFAULT_ZONES,
  lastUpdated,
}: ClientMuscleViewProps) {
  const getSeverity = (id: MuscleZoneId): Severity =>
    zones.find((z) => z.zoneId === id)?.severity ?? "normal";

  const flagged = zones.filter((z) => z.severity !== "normal");
  const severeCount = zones.filter((z) => z.severity === "severe").length;
  const mildCount = zones.filter((z) => z.severity === "mild").length;

  return (
    <div className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-amber-50 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              How your horse is feeling
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simple overview of muscle tension from your last session
            </p>
          </div>
          {lastUpdated && (
            <span className="shrink-0 text-[11px] text-slate-400">
              Updated {lastUpdated}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {zones.length - flagged.length} areas normal
          </span>
          {mildCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              {mildCount} mild
            </span>
          )}
          {severeCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
              {severeCount} needs attention
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
          {MUSCLE_ZONES.map((zone) => {
            const sev = getSeverity(zone.id);
            const colors = SEVERITY_COLORS[sev];
            return (
              <div
                key={zone.id}
                className="flex flex-col items-center gap-1 w-[4.5rem]"
                title={`${zone.label}: ${PLAIN_ENGLISH[sev]}`}
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2"
                  style={{
                    backgroundColor: colors.fill,
                    borderColor: colors.stroke,
                    color: colors.stroke,
                  }}
                >
                  {SEVERITY_ICON[sev]}
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">
                  {zone.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {flagged.length === 0 ? (
            <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
              All mapped areas look comfortable. Keep up the good routine!
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Areas that need care
              </p>
              {flagged.map((z) => {
                const zone = MUSCLE_ZONES.find((m) => m.id === z.zoneId)!;
                const colors = SEVERITY_COLORS[z.severity];
                return (
                  <div
                    key={z.zoneId}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3"
                  >
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: colors.fill,
                        color: colors.stroke,
                      }}
                    >
                      {SEVERITY_ICON[z.severity]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {zone.label}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {PLAIN_ENGLISH[z.severity]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
