"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserRole } from "@/types";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // If email confirmation is disabled, we can redirect immediately
      if (data.session) {
        const redirectPath =
          role === "therapist" ? "/dashboard/pro" : "/dashboard/client";
        router.push(redirectPath);
        router.refresh();
      } else {
        setSuccess(true);
      }
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur shadow-xl rounded-2xl border border-emerald-100 p-8 text-center">
          <h2 className="text-xl font-semibold text-emerald-900 mb-2">
            Check your email
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-5 py-2.5 text-sm transition"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">
            Equine Therapy
          </h1>
          <p className="mt-2 text-sm text-emerald-700/80">
            Create your account
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl border border-emerald-100 p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    role === "client"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setRole("therapist")}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    role === "therapist"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Therapist
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium py-2.5 text-sm transition shadow-sm"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
