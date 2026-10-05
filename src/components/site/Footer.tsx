import Link from "next/link";
import { Facebook, Mail, MapPin } from "lucide-react";
import { LogoMark } from "./Logo";
import { NAV_ITEMS } from "@/lib/nav";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-paper-2/50">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-16">
        <div>
          <span className="text-teal">
            <LogoMark className="h-9 w-9" />
          </span>
          <p className="mt-4 max-w-sm font-display text-xl leading-snug">
            {settings.club_name}
          </p>
          <p lang="ne" className="mt-2 text-sm text-teal">
            {settings.tagline_ne}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {settings.tagline_en}
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow mb-4">Explore</h2>
          <ul className="space-y-2.5 text-sm">
            {NAV_ITEMS.filter((i) => i.href !== "/").map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-underline text-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/join"
                className="link-underline text-muted transition-colors hover:text-ink"
              >
                Join Us
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-4">Reach us</h2>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
              <span>{settings.meeting_location}</span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
              <a className="link-underline hover:text-ink" href={`mailto:${settings.contact_email}`}>
                {settings.contact_email}
              </a>
            </li>
            {settings.facebook_url && (
              <li className="flex gap-2.5">
                <Facebook className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <a
                  className="link-underline hover:text-ink"
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow on Facebook
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.club_name}, Kanti Secondary School, Butwal.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-ink">
              Sitemap
            </Link>
            <Link href="/admin" className="hover:text-ink">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
