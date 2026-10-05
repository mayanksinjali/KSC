"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";

export function Navbar({ clubName, logoUrl }: { clubName: string; logoUrl?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (menuButtonRef.current) menuButtonRef.current.focus();
      else previous?.focus?.();
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-teal focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-line bg-paper/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="container-page flex h-[68px] items-center justify-between gap-6" aria-label="Main">
          <Link href="/" className="shrink-0" aria-label={`${clubName} — home`}>
            <Logo clubName={clubName} logoUrl={logoUrl} />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                  isActive(item.href)
                    ? "text-teal"
                    : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span
                    className="absolute inset-x-3.5 -bottom-0.5 h-px bg-amber"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Link href="/join" className="btn-primary hidden sm:inline-flex">
              Join Us
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-teal hover:text-teal lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[90] lg:hidden" id="mobile-nav">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-paper shadow-lift"
              initial={reduce ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="eyebrow">Menu</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-teal hover:text-teal"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-soft px-4 py-3 text-base transition-colors",
                          isActive(item.href)
                            ? "bg-teal/10 text-teal"
                            : "text-ink hover:bg-paper-2",
                        )}
                      >
                        {item.label}
                        <ArrowUpRight className="h-4 w-4 opacity-50" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 border-t border-line px-5 py-5">
                <Link href="/join" className="btn-primary w-full">
                  Join KSC
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Appearance</span>
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
