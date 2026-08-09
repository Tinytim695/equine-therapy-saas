export interface RehabExercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "8-10" or "30 seconds"
  frequency: string; // e.g. "2x daily", "Every other day"
  instructions: string;
  targetZones?: string[]; // optional link to muscle zones
}

export type RehabExerciseInput = Omit<RehabExercise, "id">;
