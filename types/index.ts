export type UserRole = "therapist" | "client";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Horse {
  id: string;
  therapist_id: string;
  name: string;
  breed: string | null;
  age: number | null;
  color: string | null;
  gender: "mare" | "gelding" | "stallion" | "unknown" | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionNote {
  id: string;
  therapist_id: string;
  client_id: string;
  horse_id: string | null;
  session_date: string;
  duration_minutes: number | null;
  title: string | null;
  goals: string | null;
  observations: string | null;
  interventions: string | null;
  client_response: string | null;
  plan_next: string | null;
  notes: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}
