export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            className="text-sm font-medium text-emerald-800 hover:text-emerald-900 px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-4 py-2 transition shadow-sm"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-emerald-950 tracking-tight leading-tight">
            Dual-sided Equine Therapy Platform
          </h1>
          <p className="mt-5 text-lg text-emerald-800/80 leading-relaxed">
            A modern SaaS for therapists and clients. Manage horses, document
            sessions, and support healing — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-8 py-3.5 text-sm transition shadow-md"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-800 font-medium px-8 py-3.5 text-sm transition"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="rounded-xl bg-white/70 border border-emerald-100 p-5 shadow-sm">
              <h3 className="font-semibold text-emerald-900">Therapist portal</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Manage horses, clients, and clinical session notes.
              </p>
            </div>
            <div className="rounded-xl bg-white/70 border border-emerald-100 p-5 shadow-sm">
              <h3 className="font-semibold text-emerald-900">Client portal</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                View sessions, track progress, and stay connected.
              </p>
            </div>
            <div className="rounded-xl bg-white/70 border border-emerald-100 p-5 shadow-sm">
              <h3 className="font-semibold text-emerald-900">Secure by design</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Role-based access with Supabase Auth &amp; RLS.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-emerald-700/60">
        Equine Therapy SaaS
      </footer>
    </div>
  );
}
