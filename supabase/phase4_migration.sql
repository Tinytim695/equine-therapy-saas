-- Phase 4: Structured session payloads for muscle map + rehab plan
-- Run in Supabase SQL Editor after the base schema.sql

alter table public.session_notes
  add column if not exists muscle_map jsonb not null default '[]'::jsonb;

alter table public.session_notes
  add column if not exists rehab_plan jsonb not null default '[]'::jsonb;

comment on column public.session_notes.muscle_map is
  'Array of { zoneId, severity, notes? } from therapist MuscleMap';

comment on column public.session_notes.rehab_plan is
  'Array of RehabExercise objects from therapist RehabBuilder';
