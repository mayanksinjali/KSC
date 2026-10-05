"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (!supabase) {
        setError("No Supabase project is connected yet. See the setup steps below.");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Those credentials didn't work. Please check your email and password.");
        return;
      }
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/admin") ? next : "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Could not sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          placeholder="you@kantiscienceclub.example"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-soft bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}
