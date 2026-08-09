"use client";

import { useState, useMemo, useEffect } from "react";
import type { RehabExercise } from "@/types/rehab";

interface ChecklistItem extends RehabExercise {
  completed: boolean;
}

interface ClientRehabChecklistProps {
  exercises?: RehabExercise[];
  /** Optional key to reset completion state (e.g. today's date) */
  dayKey?: string;
  onProgressChange?: (completed: number, total: number) => void;
}

const SAMPLE_EXERCISES: RehabExercise[] = [
  {
    id: "sample_1",
    name: "Carrot stretch – left",
    sets: 3,
    reps: "Hold 8–10 sec",
    frequency: "2x daily",
    instructions: "Offer treat toward left hip. Stop if horse braces or steps away.",
  },
  {
    id: "sample_2",
    name: "Belly lifts",
    sets: 2,
    reps: "5 holds",
    frequency: "1x daily",
    instructions: "Gently press along midline under belly; reward soft lift of back.",
  },
  {
    id: "sample_3",
    name: "Tail pulls (gentle)",
    sets: 1,
    reps: "3 slow pulls",
    frequency: "1x daily",
    instructions: "Light traction on tail in line with spine. Never force.",
  },
];

function storageKey(dayKey: string) {
  return `equine_rehab_checklist_${dayKey}`;
}

export default function ClientRehabChecklist({
  exercises,
  dayKey,
  onProgressChange,
}: ClientRehabChecklistProps) {
  const today = dayKey ?? new Date().toISOString().slice(0, 10);
  const source = exercises && exercises.length > 0 ? exercises : SAMPLE_EXERCISES;

  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (typeof window === "undefined") {
      return source.map((ex) => ({ ...ex, completed: false }));
    }
    try {
      const raw = localStorage.getItem(storageKey(today));
      if (raw) {
        const saved: Record<string, boolean> = JSON.parse(raw);
        return source.map((ex) => ({
          ...ex,
          completed: !!saved[ex.id],
        }));
      }
    } catch {
      /* ignore */
    }
    return source.map((ex) => ({ ...ex, completed: false }));
  });

  useEffect(() => {
    setItems((prev) => {
      const prevMap = Object.fromEntries(prev.map((i) => [i.id, i.completed]));
      return source.map((ex) => ({
        ...ex,
        completed: prevMap[ex.id] ?? false,
      }));
    });
  }, [source]);

  const completedCount = useMemo(
    () => items.filter((i) => i.completed).length,
    [items]
  );
  const total = items.length;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  useEffect(() => {
    onProgressChange?.(completedCount, total);
  }, [completedCount, total, onProgressChange]);

  const toggle = (id: string) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      try {
        const map = Object.fromEntries(next.map((i) => [i.id, i.completed]));
        localStorage.setItem(storageKey(today), JSON.stringify(map));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const resetDay = () => {
    setItems((prev) => prev.map((i) => ({ ...i, completed: false })));
    try {
      localStorage.removeItem(storageKey(today));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-amber-50 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Today&apos;s rehab checklist
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off each exercise as you finish it
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">
            {today}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-600">
              {completedCount} of {total} done
            </span>
            <span className="font-semibold text-emerald-700">{progress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
            <p className="text-sm text-slate-500">
              No exercises assigned yet. Your therapist will add them after a
              session.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <label
                  className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 cursor-pointer transition ${
                    item.completed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-150 bg-slate-50/40 hover:border-slate-250"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggle(item.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        item.completed
                          ? "text-slate-500 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-600">
                        {item.sets} sets
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-600">
                        {item.reps}
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-600">
                        {item.frequency}
                      </span>
                    </div>
                    {item.instructions && (
                      <p
                        className={`mt-1.5 text-xs leading-relaxed ${
                          item.completed ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {item.instructions}
                      </p>
                    )}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && completedCount > 0 && (
          <div className="mt-4 flex items-center justify-between">
            {progress === 100 ? (
              <p className="text-sm font-medium text-emerald-700">
                All done for today — great work!
              </p>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={resetDay}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Reset today
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
