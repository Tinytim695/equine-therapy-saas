import { createClient } from "@/lib/supabase/client";
import type { Horse } from "@/types";

export async function fetchTherapistHorses(therapistId: string): Promise<Horse[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("horses")
    .select("*")
    .eq("therapist_id", therapistId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("fetchTherapistHorses:", error.message);
    return [];
  }
  return (data ?? []) as Horse[];
}

export async function createHorse(
  therapistId: string,
  input: { name: string; breed?: string; age?: number; notes?: string }
): Promise<Horse | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("horses")
    .insert({
      therapist_id: therapistId,
      name: input.name,
      breed: input.breed ?? null,
      age: input.age ?? null,
      notes: input.notes ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("createHorse:", error.message);
    return null;
  }
  return data as Horse;
}
