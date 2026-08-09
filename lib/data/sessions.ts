import { createClient } from "@/lib/supabase/client";
import type { ZoneState } from "@/types/muscle";
import type { RehabExercise } from "@/types/rehab";

export interface SessionRecord {
  id: string;
  therapist_id: string;
  client_id: string;
  horse_id: string | null;
  session_date: string;
  duration_minutes: number | null;
  title: string | null;
  notes: string | null;
  observations: string | null;
  goals: string | null;
  muscle_map: ZoneState[];
  rehab_plan: RehabExercise[];
  created_at: string;
  updated_at: string;
  horses?: { id: string; name: string } | null;
}

export interface SaveSessionInput {
  therapistId: string;
  clientId: string;
  horseId?: string | null;
  sessionDate?: string;
  notes?: string;
  muscleMap: ZoneState[];
  rehabPlan: RehabExercise[];
  title?: string;
}

export async function saveSessionNote(
  input: SaveSessionInput
): Promise<{ data: SessionRecord | null; error: string | null }> {
  const supabase = createClient();

  const payload = {
    therapist_id: input.therapistId,
    client_id: input.clientId,
    horse_id: input.horseId ?? null,
    session_date: input.sessionDate ?? new Date().toISOString().slice(0, 10),
    notes: input.notes ?? null,
    title: input.title ?? "Therapy session",
    muscle_map: input.muscleMap,
    rehab_plan: input.rehabPlan,
  };

  const { data, error } = await supabase
    .from("session_notes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("saveSessionNote:", error.message);
    return { data: null, error: error.message };
  }

  return { data: data as SessionRecord, error: null };
}

export async function fetchClientSessions(
  clientId: string
): Promise<SessionRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("session_notes")
    .select("*, horses(id, name)")
    .eq("client_id", clientId)
    .order("session_date", { ascending: false })
    .limit(20);

  if (error) {
    console.error("fetchClientSessions:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    muscle_map: (row.muscle_map as ZoneState[]) ?? [],
    rehab_plan: (row.rehab_plan as RehabExercise[]) ?? [],
  })) as SessionRecord[];
}

export async function fetchTherapistSessions(
  therapistId: string
): Promise<SessionRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("session_notes")
    .select("*, horses(id, name)")
    .eq("therapist_id", therapistId)
    .order("session_date", { ascending: false })
    .limit(20);

  if (error) {
    console.error("fetchTherapistSessions:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    muscle_map: (row.muscle_map as ZoneState[]) ?? [],
    rehab_plan: (row.rehab_plan as RehabExercise[]) ?? [],
  })) as SessionRecord[];
}

export async function fetchClientsForTherapist(
  therapistId: string
): Promise<{ id: string; full_name: string | null; email: string | null }[]> {
  const supabase = createClient();

  const { data: fromSessions, error } = await supabase
    .from("session_notes")
    .select("client_id, profiles!session_notes_client_id_fkey(id, full_name, email)")
    .eq("therapist_id", therapistId);

  if (error) {
    const { data: allClients } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "client")
      .order("full_name");
    return allClients ?? [];
  }

  const map = new Map<string, { id: string; full_name: string | null; email: string | null }>();
  for (const row of fromSessions ?? []) {
    const p = row.profiles as unknown as {
      id: string;
      full_name: string | null;
      email: string | null;
    } | null;
    if (p?.id) map.set(p.id, p);
  }

  if (map.size === 0) {
    const { data: allClients } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "client")
      .order("full_name");
    return allClients ?? [];
  }

  return Array.from(map.values());
}
