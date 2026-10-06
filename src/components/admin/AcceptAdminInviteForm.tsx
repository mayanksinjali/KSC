"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { completeAdminInvite } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";

export function AcceptAdminInviteForm() {
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setError("The account service is unavailable.");
      setChecking(false);
      return;
    }

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSessionReady(Boolean(session));
      setChecking(false);
    });

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setSessionReady(Boolean(data.session));
      setChecking(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!sessionReady) {
      setError("This invitation link is invalid or expired. Ask a Super Admin to send another.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("The account service is unavailable.");
      return;
    }

    setSaving(true);
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      setSaving(false);
      setError(passwordError.message);
      return;
    }

    const result = await completeAdminInvite();
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="card-surface p-7 sm:p-8">
      <span className="text-teal">
        <ShieldCheck className="h-10 w-10" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-display text-2xl">Set your admin password</h1>
      <p className="mt-2 text-sm text-muted">
        Choose a password to finish setting up your KSC Admin account.
      </p>

      {checking ? (
        <div className="mt-7 flex items-center gap-2 text-sm text-muted" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Checking your invitation…
        </div>
      ) : sessionReady ? (
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="new-password" className="label">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="field"
            />
          </div>
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-soft bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? "Saving password…" : "Finish account setup"}
          </button>
        </form>
      ) : (
        <div className="mt-7 space-y-4">
          <p role="alert" className="rounded-soft bg-danger/10 p-3 text-sm text-danger">
            {error || "This invitation link is invalid or expired."}
          </p>
          <p className="text-sm text-muted">
            Ask a Super Admin to appoint you again and send a new invitation.
          </p>
          <Link href="/admin/login" className="btn-ghost">
            Go to admin sign in
          </Link>
        </div>
      )}
    </div>
  );
}
