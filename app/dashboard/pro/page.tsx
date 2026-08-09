"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MuscleMap from "@/components/MuscleMap";
import RehabBuilder from "@/components/RehabBuilder";
import { fetchTherapistHorses, createHorse } from "@/lib/data/horses";
import {
  saveSessionNote,
  fetchClientsForTherapist,
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
  const [selectedHorseId, setSelectedHorseId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [muscleZones, setMuscleZones] = useState<ZoneState[]>([]);
  const [exercises, setExercises] = useState<RehabExercise[]>([]);
  const [sessionNote, setSessionNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [newHorseName, setNewHorseName] = useState("");
  const [addingHorse, setAddingHorse] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const loadRoster = useCallback(async (therapistId: string) => {
    const [horseList, clientList] = await Promise.all([
      fetchTherapistHorses(therapistId),
      fetchClientsForTherapist(therapistId),
    ]);
    setHorses(horseList);
    setClients(clientList);
    if (horseList.length) setSelectedHorseId((prev) => prev || horseList[0].id);
    if (clientList.length) setSelectedClientId((prev) => prev || clientList[0].id);
  }, []);

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
    }
    setAddingHorse(false);
  }

  async function handleSaveSession() {
    if (!profile) return;
    if (!selectedClientId) {
      setSaveMessage("Select a client before saving.");
      return;
    }

    setSaving(true);
    setSaveMessage(null);

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
      setSaveMessage(`Save failed: ${error}`);
    } else {
      setSaveMessage(
        `Session saved${data?.id ? ` (${data.id.slice(0, 8)}…)` : ""}. Client can now see it.`
      );
    }
    setSaving(false);
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
            <p className="mt-1 text-sm text-slate-600">Live roster from Supabase · map tension · prescribe rehab · save to DB</p>
          </div>
          <button type="button" onClick={handleSaveSession} disabled={saving} className="shrink-0 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 transition shadow-sm">
            {saving ? "Saving…" : "Save session to Supabase"}
          </button>
        </div>

        {saveMessage && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            saveMessage.startsWith("Save failed")
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-emerald-50 text-emerald-800 border border-emerald-100"
          }`}>{saveMessage}</div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Horse</label>
            <select value={selectedHorseId} onChange={(e) => setSelectedHorseId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="">— Select horse —</option>
              {horses.map((h) => (
                <option key={h.id} value={h.id}>{h.name}{h.breed ? ` (${h.breed})` : ""}</option>
              ))}
            </select>
            <form onSubmit={handleAddHorse} className="mt-3 flex gap-2">
              <input type="text" value={newHorseName} onChange={(e) => setNewHorseName(e.target.value)} placeholder="Add horse name" className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              <button type="submit" disabled={addingHorse || !newHorseName.trim()} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50">{addingHorse ? "…" : "Add"}</button>
            </form>
            {horses.length === 0 && (<p className="mt-2 text-xs text-amber-700">No horses yet. Add one above (requires Supabase horses table + RLS).</p>)}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Client</label>
            <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="">— Select client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name || c.email || c.id.slice(0, 8)}</option>
              ))}
            </select>
            {clients.length === 0 && (<p className="mt-2 text-xs text-amber-700">No client profiles found. Have a user sign up with role &quot;Client&quot;, then refresh.</p>)}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Horses</p><p className="mt-1 text-xl font-semibold text-slate-900">{horses.length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Zones flagged</p><p className="mt-1 text-xl font-semibold text-slate-900">{muscleZones.filter((z) => z.severity !== "normal").length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Exercises</p><p className="mt-1 text-xl font-semibold text-slate-900">{exercises.length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Phase</p><p className="mt-1 text-xl font-semibold text-emerald-700">4</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3"><MuscleMap onChange={setMuscleZones} /></div>
          <div className="lg:col-span-2 space-y-6">
            <RehabBuilder onChange={setExercises} />
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Session notes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Saved to Supabase with muscle map + rehab plan</p>
              </div>
              <div className="p-4">
                <textarea rows={5} value={sessionNote} onChange={(e) => setSessionNote(e.target.value)} placeholder="Horse presentation, compensatory patterns, owner concerns…" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center">
          <p className="text-sm text-slate-500">Phase 4 — Live Supabase wire-up. Run <code className="text-xs bg-slate-100 px-1 rounded">supabase/phase4_migration.sql</code> if you have not already.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
