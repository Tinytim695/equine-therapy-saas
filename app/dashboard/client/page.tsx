"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientMuscleView from "@/components/ClientMuscleView";
import ClientRehabChecklist from "@/components/ClientRehabChecklist";
import { fetchClientSessions, type SessionRecord } from "@/lib/data/sessions";
import type { Profile } from "@/types";
import type { ZoneState } from "@/types/muscle";
import type { RehabExercise } from "@/types/rehab";

function formatDate(iso: string) {
  try {
    return new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString(
      undefined,
      { year: "numeric", month: "short", day: "numeric" }
    );
  } catch {
    return iso;
  }
}

export default function ClientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [checklistProgress, setChecklistProgress] = useState({ done: 0, total: 0 });
  const [fetchError, setFetchError] = useState<string | null>(null);
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

      const liveSessions = await fetchClientSessions(user.id);
      setSessions(liveSessions);
      if (liveSessions.length > 0) {
        setSelectedSessionId(liveSessions[0].id);
      }
      setFetchError(null);
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
    sessions.find((s) => s.id === selectedSessionId) ?? sessions[0] ?? null;

  const muscleZones: ZoneState[] = selectedSession?.muscle_map?.length
    ? selectedSession.muscle_map
    : [];
  const exercises: RehabExercise[] = selectedSession?.rehab_plan?.length
    ? selectedSession.rehab_plan
    : [];

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
            <span className="text-lg font-semibold text-emerald-900">Equine Therapy</span>
            <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5">Client</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-slate-600">{profile?.full_name || profile?.email}</span>
            <button type="button" onClick={handleSignOut} className="text-sm text-slate-600 hover:text-slate-900 transition">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Live data from your therapist&apos;s sessions · complete today&apos;s exercises
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Today&apos;s progress</p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">
              {checklistProgress.total > 0 ? `${checklistProgress.done}/${checklistProgress.total}` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Sessions</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{sessions.length}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Areas flagged</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">
              {muscleZones.filter((z) => z.severity !== "normal").length}
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Phase</p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">4</p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-10 text-center">
            <h2 className="text-base font-semibold text-slate-900">No sessions yet</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              When your therapist saves a session with your account selected, the muscle map and rehab exercises will appear here automatically.
            </p>
            {fetchError && <p className="mt-3 text-xs text-red-600">{fetchError}</p>}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <ClientRehabChecklist
                exercises={exercises}
                dayKey={selectedSession?.session_date}
                onProgressChange={(done, total) => setChecklistProgress({ done, total })}
              />
              <ClientMuscleView
                zones={muscleZones.length ? muscleZones : undefined}
                lastUpdated={selectedSession ? formatDate(selectedSession.session_date) : undefined}
              />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-amber-50 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">Session history</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Loaded from Supabase</p>
                </div>
                <div className="p-3 space-y-1 max-h-72 overflow-y-auto">
                  {sessions.map((session) => (
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
                        {formatDate(session.session_date)}
                        {session.horses?.name ? ` · ${session.horses.name}` : ""}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {session.notes || session.title || "Session notes"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-amber-50 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">Therapist notes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedSession ? formatDate(selectedSession.session_date) : "—"}
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedSession?.notes ||
                      selectedSession?.observations ||
                      "No written notes for this session."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 rounded-xl border border-dashed border-amber-200 bg-white/50 p-6 text-center">
          <p className="text-sm text-slate-500">
            Phase 4 complete — Client dashboard reads live{" "}
            <code className="text-xs bg-slate-100 px-1 rounded">session_notes</code>{" "}
            (muscle_map + rehab_plan) from Supabase.
          </p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
