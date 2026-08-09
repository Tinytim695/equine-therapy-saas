"use client";

import { useState } from "react";
import type { RehabExercise, RehabExerciseInput } from "@/types/rehab";

interface RehabBuilderProps {
  initialExercises?: RehabExercise[];
  onChange?: (exercises: RehabExercise[]) => void;
  readOnly?: boolean;
}

const EMPTY_FORM: RehabExerciseInput = {
  name: "",
  sets: 3,
  reps: "8-10",
  frequency: "1x daily",
  instructions: "",
};

function createId() {
  return `ex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function RehabBuilder({
  initialExercises = [],
  onChange,
  readOnly = false,
}: RehabBuilderProps) {
  const [exercises, setExercises] = useState<RehabExercise[]>(initialExercises);
  const [form, setForm] = useState<RehabExerciseInput>(EMPTY_FORM);
  const [isAdding, setIsAdding] = useState(false);

  const updateExercises = (next: RehabExercise[]) => {
    setExercises(next);
    onChange?.(next);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const next: RehabExercise = {
      id: createId(),
      ...form,
      name: form.name.trim(),
      instructions: form.instructions.trim(),
    };

    updateExercises([...exercises, next]);
    setForm(EMPTY_FORM);
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    updateExercises(exercises.filter((ex) => ex.id !== id));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Rehab Exercise Builder
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescribe stretches and exercises for this session
          </p>
        </div>
        {!readOnly && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="shrink-0 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium px-3 py-2 transition"
          >
            + Add exercise
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {isAdding && !readOnly && (
          <form
            onSubmit={handleAdd}
            className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Exercise name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Carrot stretch – left"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.sets}
                  onChange={(e) =>
                    setForm({ ...form, sets: Number(e.target.value) || 1 })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reps / Duration
                </label>
                <input
                  type="text"
                  value={form.reps}
                  onChange={(e) => setForm({ ...form, reps: e.target.value })}
                  placeholder="8-10 or 30s"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({ ...form, frequency: e.target.value })
                  }
                  placeholder="2x daily"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Special instructions
              </label>
              <textarea
                rows={2}
                value={form.instructions}
                onChange={(e) =>
                  setForm({ ...form, instructions: e.target.value })
                }
                placeholder="Hold at end range, avoid if horse braces…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-medium transition"
              >
                Save exercise
              </button>
            </div>
          </form>
        )}

        {exercises.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
            <p className="text-sm text-slate-500">No exercises prescribed yet</p>
            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="mt-3 text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Add the first exercise
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {exercises.map((ex, index) => (
              <li
                key={ex.id}
                className="rounded-xl border border-slate-150 bg-slate-50/40 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-800">
                        {index + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {ex.name}
                      </h3>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-600">
                        {ex.sets} sets
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-600">
                        {ex.reps}
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-600">
                        {ex.frequency}
                      </span>
                    </div>
                    {ex.instructions && (
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {ex.instructions}
                      </p>
                    )}
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemove(ex.id)}
                      className="shrink-0 rounded-md p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      aria-label={`Remove ${ex.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.436a.75.75 0 10.53 1.402c.777-.19 1.57-.32 2.365-.384v10.436A2.75 2.75 0 008.75 18.75h2.5A2.75 2.75 0 0014 16.083V5.647c.795.064 1.588.194 2.365.384a.75.75 0 10.53-1.402 15.93 15.93 0 00-2.365-.436V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 6.75a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 0110 6.75z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {exercises.length > 0 && (
          <p className="text-[11px] text-slate-400 text-right">
            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} prescribed
          </p>
        )}
      </div>
    </div>
  );
}
