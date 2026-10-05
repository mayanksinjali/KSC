import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/site/Logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSettings } from "@/lib/data";

export default async function AdminLoginPage() {
  const settings = await getSettings();

  return (
    <div className="container-page flex min-h-dvh flex-col items-center justify-center py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-teal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to site
        </Link>

        <div className="card-surface p-7 sm:p-8">
          <span className="text-teal">
            <LogoMark className="h-10 w-10" />
          </span>
          <h1 className="mt-5 font-display text-2xl">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted">
            {settings.club_name} content management. Access is limited to approved committee members
            and teachers.
          </p>

          <div className="mt-7">
            <Suspense fallback={<div className="h-40" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-card border border-amber/30 bg-amber/[0.08] p-5 text-sm">
            <p className="font-medium text-amber">Supabase is not connected yet</p>
            <p className="mt-2 leading-relaxed text-muted">
              Copy <code className="font-mono text-xs">.env.example</code> to{" "}
              <code className="font-mono text-xs">.env.local</code>, add your project URL and anon
              key, run the SQL in <code className="font-mono text-xs">supabase/migrations</code>,
              then create the first Super Admin (see the README).
            </p>
            <Link
              href="/admin/dashboard"
              className="mt-4 inline-flex text-sm font-medium text-amber underline underline-offset-4"
            >
              Continue in read-only preview →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
