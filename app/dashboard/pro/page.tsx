import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TherapistDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "therapist") {
    redirect("/dashboard/client");
  }

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-emerald-900">
              Equine Therapy
            </span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5">
              Therapist
            </span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-1 text-slate-600 text-sm">
            Professional dashboard — Phase 1 foundation
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Horses</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your therapy horses (coming in Phase 2)
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Clients</h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage client sessions
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Session Notes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Clinical documentation &amp; progress tracking
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-slate-500">
            Phase 1 complete. Interactive UI, muscle maps, and rehab builders
            will be added in subsequent phases.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
