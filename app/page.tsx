export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in, send them to the correct dashboard
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";
    redirect(role === "therapist" ? "/dashboard/pro" : "/dashboard/client");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-emerald-900 tracking-tight">
          Equine Therapy
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-emerald-800 hover:text-emerald-950 transition"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-900 transition shadow-sm"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-4">
          Dual-sided clinical platform
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight max-w-2xl leading-tight">
          Equine therapy sessions,{