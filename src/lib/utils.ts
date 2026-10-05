import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Renders a BS + AD date pair consistently across the whole site.
 * Always "2083 BS (2026)" — never BS alone or AD alone.
 */
export function formatBsAd(dateBs: string | null | undefined, dateAd: string | null | undefined) {
  const bs = (dateBs ?? "").trim();
  const ad = (dateAd ?? "").trim();
  const bsYear = /^(\d{4})(?:-|$)/.exec(bs)?.[1];
  const adYear = /^(\d{4})-\d{2}-\d{2}$/.exec(ad)?.[1];
  return bsYear && adYear ? `${bsYear} BS (${adYear})` : "Date to be announced";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toIsoDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
