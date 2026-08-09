"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientMuscleView from "@/components/ClientMuscleView";
import ClientRehabChecklist from "@/components/ClientRehabChecklist";
import type { Profile } from "@/types";
import type { ZoneState } from "@/types/muscle";
import type { RehabExercise } from "@/types/rehab";

/** Demo session history until Supabase linking is live */
const DEMO_SESSIONS = [
  {
    id: "s1",
    date: "2026-08-07",
    label: "Aug 7, 2026",
    therapistNote:
      "Mild tension through the lumbar and left hamstring. Focus on carrot stretches and belly lifts this week. Avoid deep work on the left stifle until next visit.",
  },
  {
    id: "s2",
    date: "2026-07-24",
    label: "Jul 24, 2026",
    therapistNote:
      "Overall improved from last month. Withers still reactive to saddle pressure — check pad fit. Continue gentle neck stretches.",
  },
  {
    id: "s3",
    date: "2026-07-10",
    label: "Jul 10, 2026",
    therapistNote:
      "Initial assessment. Poll and neck held tension; introduced basic mobility work.",
  },
];

const DEMO_ZONES: ZoneState[] = [
  { zoneId: "poll", severity: "normal" },
  { zoneId: "neck", severity: "mild" },
  { zoneId: "withers", severity: "normal" },
  { zoneId: "shoulder", severity: "normal" },
  { zoneId: "back", severity: "normal" },
  { zoneId: "lumbar", severity: "mild" },
  { zoneId: "glutes", severity: "normal" },
  { zoneId: "stifle", severity: "severe" },
  { zoneId: "hamstrings", severity: "mild" },
  { zoneId: "lower_legs", severity: "normal" },
];

const DEMO_EXERCISES: RehabExercise[] = [
  {
    id: "ex_carrot_l",
    name: "Carrot stretch – left",
    sets: 3,
    reps: "Hold 8–10 sec",
    frequency: "2x daily",
    instructions: "Offer treat toward left hip. Stop if horse braces or steps away.",
  },
  {
    id: "ex_belly",
    name: "Belly lifts",
    sets: 2,
    reps: "5 holds",
    frequency: "1x daily",
    instructions: "Gently press along midline under belly; reward soft lift of back.",
  },
  {
    id: "ex_tail",
    name: "Tail pulls (gentle)",
    sets: 1,
    reps: "3 slow pulls",
    frequency: "1x daily",
    instructions: "Light traction on tail in line with spine. Never force.",
  },
  {
    id: "ex_neck",
    name: "Neck flexion – right",
    sets: 2,
    reps: "Hold 6 sec",
    frequency: "2x daily",
    instructions: "Guide nose toward right shoulder. Keep movement slow and soft.",
  },
];

export default function ClientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState(DEMO_SESSIONS[0].id);
  const [checklistProgress, setChecklistProgress] = useState({ done: 0, total: 0 });
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

      if (!data || data.role !== "client") {
        router.push("/dashboard/pro");
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

  const selectedSession =
    DEMO_SESSIONS.find((s) => s.id === selectedSessionId) ?? DEMO_SESSIONS[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/40">
        <p className="text-sm text-slate-500">Loading your portal…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-amber-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-emerald-900">
              Equine Therapy
            </span>
            <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5">
              Client
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track how your horse is feeling and complete today&apos;s exercises
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Today&apos;s progress
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">
              {checklistProgress.total > 0
                ? `${checklistProgress.done}/${checklistProgress.total}`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Sessions
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {DEMO_SESSIONS.length}
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Areas flagged
            </p>
            <p className="mt-1 text-xl font-semibold text-amber-700">
              {DEMO_ZONES.filter((z) => z.severity !== "normal").length}
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Phase
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">3</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <ClientRehabChecklist
              exercises={DEMO_EXERCISES}
              onProgressChange={(done, total) =>
                setChecklistProgress({ done, total })
              }
            />
            <ClientMuscleView
              zones={DEMO_ZONES}
              lastUpdated={selectedSession.label}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-amber-50 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Session history
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Past visits and therapist notes
                </p>
              </div>
              <div className="p-3 space-y-1">
                {DEMO_SESSIONS.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`w-full text-left rounded-xl px-3.5 py-3 transition ${
                      selectedSessionId === session.id
                        ? "bg-amber-50 border border-amber-200"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {session.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {session.therapistNote}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-amber-50 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Therapist notes
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  From {selectedSession.label}
                </p>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedSession.therapistNote}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-amber-200 bg-white/50 p-6 text-center">
          <p className="text-sm text-slate-500">
            Phase 3 complete — Client muscle view, daily checklist, and session
            history are live. Demo data will be replaced by live Supabase session
            data in a later phase.
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
