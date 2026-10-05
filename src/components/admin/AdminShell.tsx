"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  History,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, superOnly: false },
  { href: "/admin/members", label: "Members", icon: Users, superOnly: false },
  { href: "/admin/events", label: "Events", icon: CalendarDays, superOnly: false },
  { href: "/admin/journey", label: "Journey", icon: History, superOnly: false },
  { href: "/admin/notices", label: "Notices", icon: FileText, superOnly: false },
  { href: "/admin/gallery", label: "Gallery", icon: Images, superOnly: false },
  { href: "/admin/applications", label: "Applications", icon: BadgeCheck, superOnly: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, superOnly: true },
  { href: "/admin/admin-users", label: "Admin Users", icon: ShieldCheck, superOnly: true },
] as const;

export function AdminShell({
  children,
  admin,
  clubName,
}: {
  children: React.ReactNode;
  admin: { email: string; role: "super_admin" | "editor"; preview: boolean };
  clubName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const items = NAV.filter((item) => !item.superOnly || admin.role === "super_admin");

  async function signOut() {
    setSigningOut(true);
    try {
      if (!admin.preview) {
        const { createClient } = await import("@/lib/supabase/client");
        await createClient()?.auth.signOut();
      }
      router.push("/admin/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="text-teal">
          <LogoMark className="h-8 w-8" />
        </span>
        <div>
          <p className="font-display text-sm leading-tight">KSC Admin</p>
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-faint">
            {admin.preview ? "Preview mode" : admin.role === "super_admin" ? "Super Admin" : "Editor"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Admin">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm transition-colors",
                active ? "bg-teal/10 font-medium text-teal" : "text-muted hover:bg-paper-2 hover:text-ink",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View public site
        </Link>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="truncate text-xs text-faint" title={admin.email}>
            {admin.email}
          </span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-soft px-3 py-2.5 text-sm text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-surface lg:block">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {admin.preview && (
          <div className="border-b border-amber/30 bg-amber/10 px-5 py-2.5 text-center text-xs text-amber sm:text-left">
            Preview mode — no Supabase project is connected, so changes are disabled. Add
            credentials to <code className="font-mono">.env.local</code> to enable the CMS.
          </div>
        )}

        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="font-display text-sm">{clubName} Admin</span>
          <ThemeToggle />
        </header>

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] border-r border-line bg-surface">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close admin navigation"
              className="absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-line"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
