"use client";

import { useState, useCallback } from "react";
import {
  MUSCLE_ZONES,
  SEVERITY_COLORS,
  cycleSeverity,
  type MuscleZoneId,
  type Severity,
  type ZoneState,
} from "@/types/muscle";

interface MuscleMapProps {
  initialZones?: ZoneState[];
  onChange?: (zones: ZoneState[]) => void;
  readOnly?: boolean;
}

const DEFAULT_ZONES: ZoneState[] = MUSCLE_ZONES.map((z) => ({
  zoneId: z.id,
  severity: "normal" as Severity,
}));

export default function MuscleMap({
  initialZones,
  onChange,
  readOnly = false,
}: MuscleMapProps) {
  const [zones, setZones] = useState<ZoneState[]>(
    initialZones ?? DEFAULT_ZONES
  );
  const [selectedZone, setSelectedZone] = useState<MuscleZoneId | null>(null);

  const getSeverity = useCallback(
    (id: MuscleZoneId): Severity => {
      return zones.find((z) => z.zoneId === id)?.severity ?? "normal";
    },
    [zones]
  );

  const handleZoneClick = (id: MuscleZoneId) => {
    if (readOnly) {
      setSelectedZone(id);
      return;
    }

    const next = zones.map((z) =>
      z.zoneId === id ? { ...z, severity: cycleSeverity(z.severity) } : z
    );
    setZones(next);
    setSelectedZone(id);
    onChange?.(next);
  };

  const selectedInfo = selectedZone
    ? MUSCLE_ZONES.find((z) => z.id === selectedZone)
    : null;
  const selectedSeverity = selectedZone ? getSeverity(selectedZone) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Equine Muscle Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click a zone to cycle severity: Normal → Mild → Severe
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs">
          {(Object.keys(SEVERITY_COLORS) as Severity[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border"
                style={{
                  backgroundColor: SEVERITY_COLORS[s].fill,
                  borderColor: SEVERITY_COLORS[s].stroke,
                }}
              />
              {SEVERITY_COLORS[s].label}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="relative w-full max-w-2xl mx-auto">
          <svg
            viewBox="0 0 640 360"
            className="w-full h-auto select-none"
            role="img"
            aria-label="Interactive equine muscle map"
          >
            <path
              d="M120 200 C110 180 105 150 115 130 C125 110 145 95 170 90 C190 85 210 88 230 95 C250 85 280 80 310 85 C350 90 390 100 420 120 C450 140 470 160 480 185 C490 200 495 220 490 240 C485 255 470 265 450 268 L420 270 C400 275 380 280 360 278 C340 280 320 275 300 270 C280 275 260 278 240 275 C220 278 200 275 180 268 C160 270 145 260 140 245 C135 230 125 215 120 200 Z"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <path
              d="M95 145 C88 130 92 115 105 105 C118 95 135 98 145 110 C150 120 148 135 140 145 C130 155 110 155 95 145 Z"
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <path d="M112 105 L118 85 L128 100 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <path d="M145 120 C160 130 170 150 175 175" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />

            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("poll")}>
              <ellipse cx="118" cy="118" rx="22" ry="18" fill={SEVERITY_COLORS[getSeverity("poll")].fill} stroke={SEVERITY_COLORS[getSeverity("poll")].stroke} strokeWidth={selectedZone === "poll" ? 2.5 : 1.5} opacity={0.85} />
              <title>Poll</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("neck")}>
              <path d="M140 130 C155 140 165 160 170 185 L155 190 C148 165 140 145 130 135 Z" fill={SEVERITY_COLORS[getSeverity("neck")].fill} stroke={SEVERITY_COLORS[getSeverity("neck")].stroke} strokeWidth={selectedZone === "neck" ? 2.5 : 1.5} opacity={0.85} />
              <title>Neck</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("withers")}>
              <ellipse cx="215" cy="105" rx="28" ry="16" fill={SEVERITY_COLORS[getSeverity("withers")].fill} stroke={SEVERITY_COLORS[getSeverity("withers")].stroke} strokeWidth={selectedZone === "withers" ? 2.5 : 1.5} opacity={0.85} />
              <title>Withers</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("shoulder")}>
              <ellipse cx="195" cy="155" rx="26" ry="32" fill={SEVERITY_COLORS[getSeverity("shoulder")].fill} stroke={SEVERITY_COLORS[getSeverity("shoulder")].stroke} strokeWidth={selectedZone === "shoulder" ? 2.5 : 1.5} opacity={0.85} />
              <title>Shoulder</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("back")}>
              <ellipse cx="290" cy="118" rx="45" ry="18" fill={SEVERITY_COLORS[getSeverity("back")].fill} stroke={SEVERITY_COLORS[getSeverity("back")].stroke} strokeWidth={selectedZone === "back" ? 2.5 : 1.5} opacity={0.85} />
              <title>Back</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("lumbar")}>
              <ellipse cx="370" cy="130" rx="32" ry="20" fill={SEVERITY_COLORS[getSeverity("lumbar")].fill} stroke={SEVERITY_COLORS[getSeverity("lumbar")].stroke} strokeWidth={selectedZone === "lumbar" ? 2.5 : 1.5} opacity={0.85} />
              <title>Lumbar</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("glutes")}>
              <ellipse cx="440" cy="165" rx="30" ry="28" fill={SEVERITY_COLORS[getSeverity("glutes")].fill} stroke={SEVERITY_COLORS[getSeverity("glutes")].stroke} strokeWidth={selectedZone === "glutes" ? 2.5 : 1.5} opacity={0.85} />
              <title>Glutes</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("hamstrings")}>
              <ellipse cx="430" cy="220" rx="24" ry="30" fill={SEVERITY_COLORS[getSeverity("hamstrings")].fill} stroke={SEVERITY_COLORS[getSeverity("hamstrings")].stroke} strokeWidth={selectedZone === "hamstrings" ? 2.5 : 1.5} opacity={0.85} />
              <title>Hamstrings</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("stifle")}>
              <ellipse cx="400" cy="255" rx="20" ry="18" fill={SEVERITY_COLORS[getSeverity("stifle")].fill} stroke={SEVERITY_COLORS[getSeverity("stifle")].stroke} strokeWidth={selectedZone === "stifle" ? 2.5 : 1.5} opacity={0.85} />
              <title>Stifle</title>
            </g>
            <g className={`cursor-pointer transition-opacity ${readOnly ? "" : "hover:opacity-90"}`} onClick={() => handleZoneClick("lower_legs")}>
              <rect x="175" y="230" width="18" height="55" rx="6" fill={SEVERITY_COLORS[getSeverity("lower_legs")].fill} stroke={SEVERITY_COLORS[getSeverity("lower_legs")].stroke} strokeWidth={selectedZone === "lower_legs" ? 2.5 : 1.5} opacity={0.85} />
              <rect x="395" y="275" width="16" height="40" rx="5" fill={SEVERITY_COLORS[getSeverity("lower_legs")].fill} stroke={SEVERITY_COLORS[getSeverity("lower_legs")].stroke} strokeWidth={selectedZone === "lower_legs" ? 2.5 : 1.5} opacity={0.85} />
              <title>Lower Legs</title>
            </g>

            <text x="118" y="95" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">Poll</text>
            <text x="155" y="165" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">Neck</text>
            <text x="215" y="92" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">Withers</text>
            <text x="195" y="200" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">Shoulder</text>
            <text x="290" y="105" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">Back</text>
            <text x="370" y="115" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">Lumbar</text>
            <text x="440" y="150" textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">Glutes</text>
            <text x="455" y="225" textAnchor="start" className="fill-slate-500 text-[10px] font-medium">Hams</text>
            <text x="400" y="250" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">Stifle</text>
          </svg>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MUSCLE_ZONES.map((zone) => {
            const sev = getSeverity(zone.id);
            const colors = SEVERITY_COLORS[sev];
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => handleZoneClick(zone.id)}
                className={`rounded-lg border px-2.5 py-2 text-left transition ${
                  selectedZone === zone.id
                    ? "border-emerald-500 ring-1 ring-emerald-500/30"
                    : "border-slate-150 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colors.fill, border: `1px solid ${colors.stroke}` }}
                  />
                  <span className="text-xs font-medium text-slate-800 truncate">
                    {zone.label}
                  </span>
                </div>
                <span className={`mt-1 block text-[10px] font-medium ${colors.text}`}>
                  {colors.label}
                </span>
              </button>
            );
          })}
        </div>

        {selectedInfo && selectedSeverity && (
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedInfo.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedInfo.description}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${SEVERITY_COLORS[selectedSeverity].bg} ${SEVERITY_COLORS[selectedSeverity].text}`}
              >
                {SEVERITY_COLORS[selectedSeverity].label}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
