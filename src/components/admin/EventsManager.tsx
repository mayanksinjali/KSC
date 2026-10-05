"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Pencil, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventStatusBadge } from "@/components/ui/Badge";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { STORAGE_BUCKETS } from "@/lib/upload";
import { deleteEvent, saveEvent } from "@/app/admin/actions";
import { formatBsAd } from "@/lib/utils";
import { EVENT_CATEGORIES, EVENT_STATUSES, type EventRecord } from "@/lib/types";

type FormState = {
  title: string;
  category: string;
  description: string;
  date_bs: string;
  date_ad: string;
  venue: string;
  status: string;
  cover_url: string;
  registration_url: string;
  result: string;
};

const emptyForm: FormState = {
  title: "",
  category: "Exhibition",
  description: "",
  date_bs: "",
  date_ad: "",
  venue: "",
  status: "upcoming",
  cover_url: "",
  registration_url: "",
  result: "",
};

export function EventsManager({ events, openNew = false }: { events: EventRecord[]; openNew?: boolean }) {
  const { push } = useToast();
  const [rows, setRows] = useState(events);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<EventRecord | null>(null);
  const [form, setForm] = useState<FormState | null>(openNew ? emptyForm : null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!term) return true;
      return e.title.toLowerCase().includes(term) || e.venue.toLowerCase().includes(term);
    });
  }, [rows, query, statusFilter]);

  function openEdit(event: EventRecord) {
    setEditing(event);
    setForm({
      title: event.title,
      category: event.category,
      description: event.description,
      date_bs: event.date_bs,
      date_ad: event.date_ad,
      venue: event.venue,
      status: event.status,
      cover_url: event.cover_url ?? "",
      registration_url: event.registration_url ?? "",
      result: event.result ?? "",
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const result = await saveEvent(editing?.id ?? null, form);
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    push(editing ? "Event updated." : "Event added.", "success");
    window.location.reload();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteEvent(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    push("Event deleted.", "success");
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
            <label htmlFor="event-admin-search" className="sr-only">
              Search events
            </label>
            <input
              id="event-admin-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events…"
              className="field pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {(["all", ...EVENT_STATUSES] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
                className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
                  statusFilter === value
                    ? "border-teal bg-teal text-paper"
                    : "border-line bg-surface text-muted hover:border-teal/50"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
          }}
        >
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Add event
        </button>
      </div>

      {form && (
        <form onSubmit={submit} className="card-surface mb-6 p-5 sm:p-6">
          <h2 className="font-display text-lg">{editing ? "Edit event" : "New event"}</h2>
          <p className="mt-1 text-sm text-muted">
            Both a Bikram Sambat and an AD date are required — they are shown together everywhere on
            the site.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="e-title" className="label">
                Title
              </label>
              <input
                id="e-title"
                required
                className="field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="e-category" className="label">
                Category
              </label>
              <select
                id="e-category"
                className="field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="e-status" className="label">
                Status
              </label>
              <select
                id="e-status"
                className="field capitalize"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="e-date-bs" className="label">
                Date (Bikram Sambat)
              </label>
              <input
                id="e-date-bs"
                required
                className="field"
                inputMode="numeric"
                placeholder="2083-01-15"
                pattern="\d{4}-\d{2}-\d{2}"
                value={form.date_bs}
                onChange={(e) => setForm({ ...form, date_bs: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="e-date-ad" className="label">
                Date (AD)
              </label>
              <input
                id="e-date-ad"
                type="date"
                required
                className="field"
                value={form.date_ad}
                onChange={(e) => setForm({ ...form, date_ad: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="e-venue" className="label">
                Venue
              </label>
              <input
                id="e-venue"
                required
                className="field"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="e-description" className="label">
                Description
              </label>
              <textarea
                id="e-description"
                required
                rows={4}
                className="field resize-y"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="e-registration" className="label">
                Registration URL (optional)
              </label>
              <input
                id="e-registration"
                className="field"
                placeholder="https://forms.gle/…"
                value={form.registration_url}
                onChange={(e) => setForm({ ...form, registration_url: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="e-result" className="label">
                Result / outcome (optional)
              </label>
              <textarea
                id="e-result"
                rows={3}
                className="field resize-y"
                placeholder="What happened — winners, participation, key outcomes."
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Cover image"
                value={form.cover_url || null}
                onChange={(url) => setForm({ ...form, cover_url: url ?? "" })}
                bucket={STORAGE_BUCKETS.eventImages}
                maxWidth={1800}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add event"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setForm(null);
                setEditing(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="No events found."
          description="Add your first event and it will appear on the home page, events page and journey automatically."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((event) => (
            <li key={event.id} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <EventStatusBadge status={event.status} />
                  <span className="text-xs uppercase tracking-[0.14em] text-faint">
                    {event.category}
                  </span>
                </div>
                <p className="mt-2 truncate font-medium text-ink">{event.title}</p>
                <p className="truncate text-xs text-faint">
                  {formatBsAd(event.date_bs, event.date_ad)} · {event.venue}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(event)}
                  aria-label={`Edit ${event.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-teal"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(event)}
                  aria-label={`Delete ${event.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this event?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed from the public site and Journey. This cannot be undone.` : ""}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
