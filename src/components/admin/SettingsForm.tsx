"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { STORAGE_BUCKETS } from "@/lib/upload";
import { saveSettings } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";

interface Field {
  key: keyof SiteSettings;
  label: string;
  type?: "text" | "textarea";
  hint?: string;
  lang?: string;
  full?: boolean;
}

const GROUPS: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Identity",
    description: "Club name and taglines shown across the site.",
    fields: [
      { key: "club_name", label: "Club name" },
      { key: "tagline_en", label: "Tagline (English)" },
      { key: "tagline_ne", label: "Tagline (Nepali)", lang: "ne" },
    ],
  },
  {
    title: "Home page",
    description: "The hero section and mission preview on the home page.",
    fields: [
      { key: "hero_heading", label: "Hero heading", full: true },
      { key: "hero_text", label: "Hero text", type: "textarea", full: true },
      { key: "mission_title", label: "Mission title", full: true },
      { key: "mission_body", label: "Mission body", type: "textarea", full: true },
    ],
  },
  {
    title: "About page",
    description: "Longer-form content for the About page.",
    fields: [
      { key: "about_intro", label: "Introduction", type: "textarea", full: true },
      { key: "vision", label: "Vision", type: "textarea", full: true },
      { key: "what_we_do", label: "What we do", type: "textarea", full: true },
      { key: "history", label: "History", type: "textarea", full: true },
    ],
  },
  {
    title: "Contact",
    description: "Shown in the footer, Join page and structured data.",
    fields: [
      { key: "contact_email", label: "Contact email" },
      { key: "facebook_url", label: "Facebook URL" },
      { key: "meeting_location", label: "Meeting location", full: true },
    ],
  },
  {
    title: "SEO & sharing",
    description: "Default metadata used when pages don't override it.",
    fields: [
      { key: "seo_title", label: "Default SEO title", full: true },
      { key: "seo_description", label: "Default SEO description", type: "textarea", full: true },
    ],
  },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { push } = useToast();
  const [values, setValues] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  function set(key: keyof SiteSettings, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await saveSettings(values as unknown as Record<string, string>);
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    push("Settings saved.", "success");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {GROUPS.map((group) => (
        <section key={group.title} className="card-surface p-5 sm:p-6">
          <h2 className="font-display text-lg">{group.title}</h2>
          <p className="mt-1 text-sm text-muted">{group.description}</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div key={field.key} className={field.full ? "sm:col-span-2" : ""}>
                <label htmlFor={`s-${field.key}`} className="label" lang={field.lang}>
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={`s-${field.key}`}
                    rows={4}
                    lang={field.lang}
                    className="field resize-y"
                    value={values[field.key] ?? ""}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    id={`s-${field.key}`}
                    lang={field.lang}
                    className="field"
                    value={values[field.key] ?? ""}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="card-surface p-5 sm:p-6">
        <h2 className="font-display text-lg">Brand assets</h2>
        <p className="mt-1 text-sm text-muted">
          Upload the club logo, browser icon and the image used when pages are shared on social media.
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <ImageUpload
            label="Logo"
            value={values.logo_url || null}
            onChange={(url) => set("logo_url", url ?? "")}
            bucket={STORAGE_BUCKETS.siteAssets}
            maxWidth={600}
          />
          <ImageUpload
            label="Favicon"
            value={values.favicon_url || null}
            onChange={(url) => set("favicon_url", url ?? "")}
            bucket={STORAGE_BUCKETS.siteAssets}
            maxWidth={128}
          />
          <ImageUpload
            label="Default social sharing image"
            value={values.og_image_url || null}
            onChange={(url) => set("og_image_url", url ?? "")}
            bucket={STORAGE_BUCKETS.siteAssets}
            maxWidth={1200}
          />
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" className="btn-primary shadow-lift" disabled={saving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
