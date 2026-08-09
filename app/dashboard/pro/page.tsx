"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MuscleMap from "@/components/MuscleMap";
import RehabBuilder from "@/components/RehabBuilder";
import DownloadSessionPdf from "@/components/DownloadSessionPdf";
import Spinner from "@/components/ui/Spinner";
import Toast, { type ToastState } from "@/components/ui/Toast";
import { fetchTherapistHorses, createHorse } from "@/lib/data/horses";
import {
  saveSessionNote,
  fetchClientsForTherapist,
  fetchTherapistSessions,
  type SessionRecord,
} from "@/lib/data/sessions";
import type { ZoneState } from "@/types/muscle";
import type { RehabExercise } from "@/types/rehab";
import type { Profile, Horse } from "@/types";

export default function TherapistDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [clients, setClients] = useState<
    { id: string; full_name: string | null; email: string | null }[]
  >([]);
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [muscleZones, setMuscleZones] = useState<ZoneState[]>([]);
  const [exercises, setExercises] = useState<RehabExercise[]>([]);
  const [sessionNote, setSessionNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [newHorseName, setNewHorseName] = useState("");
  const [addingHorse, setAddingHorse] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastSaved, setLastSaved] = useState<SessionRecord | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const loadRoster = useCallback(async (therapistId: string) => {
    const [horseList, clientList, sessions] = await Promise.all([
      fetchTherapistHorses(therapistId),
      fetchClientsForTherapist(therapistId),
      fetchTherapistSessions(therapistId),
    ]);
    setHorses(horseList);
    setClients(clientList);
    setRecentSessions(sessions.slice(0, 5));
    if (horseList.length) setSelectedHorseId((p) => p || horseList[0].id);
    if (clientList.length) setSelectedClientId((p) => p || clientList[0].id);
  }, []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!data || data.role !== "therapist") { router.push("/dashboard/client"); return; }
      setProfile(data as Profile);
      await loadRoster(user.id);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleAddHorse(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !newHorseName.trim()) return;
    setAddingHorse(true);
    const horse = await createHorse(profile.id, { name: newHorseName.trim() });
    if (horse) {
      setHorses((prev) => [...prev, horse].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedHorseId(horse.id);
      setNewHorseName("");
      setToast({ message: `Horse "${horse.name}" added.`, tone: "success" });
    } else {
      setToast({ message: "Could not add horse. Check Supabase RLS and schema.", tone: "error" });
    }
    setAddingHorse(false);
  }

  async function handleSaveSession() {
    if (!profile) return;
    if (!selectedClientId) {
      setToast({ message: "Select a client before saving.", tone: "error" });
      return;
    }
    setSaving(true);
    const { data, error } = await saveSessionNote({
      therapistId: profile.id,
      clientId: selectedClientId,
      horseId: selectedHorseId || null,
      notes: sessionNote,
      muscleMap: muscleZones,
      rehabPlan: exercises,
      title: `Session ${new Date().toLocaleDateString()}`,
    });
    if (error) {
      setToast({ message: `Save failed: ${error}`, tone: "error" });
    } else {
      setLastSaved(data);
      if (data) setRecentSessions((prev) => [data, ...prev].slice(0, 5));
      setToast({ message: "Session saved to Supabase. Client can view it now.", tone: "success" });
    }
    setSaving(false);
  }

  const selectedHorse = horses.find((h) => h.id === selectedHorseId);
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner label="Loading therapist workspace\u2026" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-emerald-900">Equine Therapy</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5">Therapist</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-slate-600">{profile?.full_name || profile?.email}</span>
            <button type="button" onClick={handleSignOut} className="text-sm text-slate-600 hover:text-slate-900 transition">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Session Workspace</h1>
            <p className="mt-1 text-sm text-slate-600">Live Supabase data \u00b7 export professional PDF summaries</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(lastSaved || muscleZones.length > 0 || exercises.length > 0) && (
              <DownloadSessionPdf
                session={{
                  horseName: selectedHorse?.name,
                  clientName: selectedClient?.full_name || selectedClient?.email || undefined,
                  therapistName: profile?.full_name || profile?.email || undefined,
                  sessionDate: lastSaved?.session_date || new Date().toISOString().slice(0, 10),
                  notes: sessionNote || lastSaved?.notes,
                  muscleMap: lastSaved?.muscle_map?.length ? lastSaved.muscle_map : muscleZones,
                  rehabPlan: lastSaved?.rehab_plan?.length ? lastSaved.rehab_plan : exercises,
                  title: lastSaved?.title || "Current session draft",
                }}
              />
            )}
            <button type="button" onClick={handleSaveSession} disabled={saving} className="rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 transition shadow-sm">
              {saving ? "Saving\u2026" : "Save session to Supabase"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Horse</label>
            {horses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center">
                <p className="text-sm text-slate-500">No horses assigned yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your first horse below</p>
              </div>
            ) : (
              <select value={selectedHorseId} onChange={(e) => setSelectedHorseId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">\u2014 Select horse \u2014</option>
                {horses.map((h) => (<option key={h.id} value={h.id}>{h.name}{h.breed ? ` (${h.breed})` : ""}</option>))}
              </select>
            )}
            <form onSubmit={handleAddHorse} className="mt-3 flex gap-2">
              <input type="text" value={newHorseName} onChange={(e) => setNewHorseName(e.target.value)} placeholder="Add horse name" className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              <button type="submit" disabled={addingHorse || !newHorseName.trim()} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50">{addingHorse ? "\u2026" : "Add"}</button>
            </form>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Client</label>
            {clients.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center">
                <p className="text-sm text-slate-500">No clients found yet</p>
                <p className="text-xs text-slate-400 mt-1">Have a user sign up as Client, then refresh</p>
              </div>
            ) : (
              <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">\u2014 Select client \u2014</option>
                {clients.map((c) => (<option key={c.id} value={c.id}>{c.full_name || c.email || c.id.slice(0, 8)}</option>))}
              </select>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Horses</p><p className="mt-1 text-xl font-semibold text-slate-900">{horses.length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Zones flagged</p><p className="mt-1 text-xl font-semibold text-slate-900">{muscleZones.filter((z) => z.severity !== "normal").length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Exercises</p><p className="mt-1 text-xl font-semibold text-slate-900">{exercises.length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Phase</p><p className="mt-1 text-xl font-semibold text-emerald-700">5</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3"><MuscleMap onChange={setMuscleZones} /></div>
          <div className="lg:col-span-2 space-y-6">
            <RehabBuilder onChange={setExercises} />
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Session notes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Included in PDF export</p>
              </div>
              <div className="p-4">
                <textarea rows={5} value={sessionNote} onChange={(e) => setSessionNote(e.target.value)} placeholder="Horse presentation, compensatory patterns\u2026" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
              </div>
            </div>
            {recentSessions.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">Recent sessions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Export any saved session as PDF</p>
                </div>
                <ul className="divide-y divide-slate-100">
                  {recentSessions.map((s) => (
                    <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{s.session_date}{s.horses?.name ? ` \u00b7 ${s.horses.name}` : ""}</p>
                        <p className="text-xs text-slate-500 truncate">{s.notes || s.title || "Session"}</p>
                      </div>
                      <DownloadSessionPdf session={{ horseName: s.horses?.name, therapistName: profile?.full_name || profile?.email || undefined, sessionDate: s.session_date, notes: s.notes, muscleMap: s.muscle_map || [], rehabPlan: s.rehab_plan || [], title: s.title }} label="PDF" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center">
          <p className="text-sm text-slate-500">Phase 5 complete \u2014 PDF export, toasts, spinners, and empty states are live.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800">\u2190 Back to home</Link>
        </div>
      </main>
    </div>
  );
}
