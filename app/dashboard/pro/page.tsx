"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MuscleMap from "@/components/MuscleMap";
import RehabBuilder from "@/components/RehabBuilder";
import type { ZoneState } from "@/types/muscle";
import type { RehabExercise } from "@/types/rehab";
import type { Profile } from "@/types";

export default function TherapistDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [muscleZones, setMuscleZones] = useState<ZoneState[]>([]);
  const [exercises, setExercises] = useState<RehabExercise[]>([]);
  const [sessionNote, setSessionNote] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data || data.role !== "therapist") {
        router.push("/dashboard/client");
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    }

    load();
  }, [router, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Placeholder for future Supabase sync
  function handleSaveSession() {
    // In Phase 3+ this will write muscleZones + exercises + sessionNote
    // into session_notes (or a related table).
    console.log("Session snapshot ready for sync:", {
      muscleZones,
      exercises,
      sessionNote,
    });
    alert(
      "Session data captured in local state.\n(Supabase sync comes in a later phase.)"
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-emerald-900">
              Equine Therapy
            </span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5">
              Therapist
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-slate-600">
              {profile?.full_name || profile?.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Session Workspace
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Map muscle tension and build a rehab plan for this session
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveSession}
            className="shrink-0 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-4 py-2.5 transition shadow-sm"
          >
            Save session snapshot
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Zones flagged
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {
                muscleZones.filter((z) => z.severity !== "normal").length
              }
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Severe
            </p>
            <p className="mt-1 text-xl font-semibold text-red-600">
              {muscleZones.filter((z) => z.severity === "severe").length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Exercises
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {exercises.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Phase
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">2</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <MuscleMap onChange={setMuscleZones} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <RehabBuilder onChange={setExercises} />

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Session notes
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Free-form observations for this visit
                </p>
              </div>
              <div className="p-4">
                <textarea
                  rows={5}
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  placeholder="Horse presentation, compensatory patterns, owner concerns…"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center">
          <p className="text-sm text-slate-500">
            Phase 2 complete — Muscle Map + Rehab Builder are live with local
            state. Supabase persistence &amp; client linking arrive in later
            phases.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
