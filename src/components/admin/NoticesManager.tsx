"use client";

import { useMemo, useState } from "react";
import { Megaphone, Pencil, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { STORAGE_BUCKETS } from "@/lib/upload";
import { deleteNotice, saveNotice, toggleNoticePin } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/lib/types";

type FormState = {
  title: string;
  body: string;
  attachment_url: string;
  image_url: string;
  pinned: boolean;
};

const emptyForm: FormState = { title: "", body: "", attachment_url: "", image_url: "", pinned: false };

export function NoticesManager({ notices, openNew = false }: { notices: Notice[]; openNew?: boolean }) {
  const { push } = useToast();
  const [rows, setRows] = useState(notices);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState<FormState | null>(openNew ? emptyForm : null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((n) => !term || n.title.toLowerCase().includes(term) || n.body.toLowerCase().includes(term));
  }, [rows, query]);

  function openEdit(notice: Notice) {
    setEditing(notice);
    setForm({
      title: notice.title,
      body: notice.body,
      attachment_url: notice.attachment_url ?? "",
      image_url: notice.image_url ?? "",
      pinned: notice.pinned,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const result = await saveNotice(editing?.id ?? null, form);
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    push(editing ? "Notice updated." : "Notice published.", "success");
    window.location.reload();
  }

  async function togglePin(notice: Notice) {
    const result = await toggleNoticePin(notice.id, !notice.pinned);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) => prev.map((n) => (n.id === notice.id ? { ...n, pinned: !n.pinned } : n)));
    push(notice.pinned ? "Notice unpinned." : "Notice pinned.", "success");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteNotice(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    push("Notice deleted.", "success");
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <label htmlFor="notice-search" className="sr-only">
            Search notices
          </label>
          <input
            id="notice-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notices…"
            className="field pl-9"
          />
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New notice
        </button>
      </div>

      {form && (
        <form onSubmit={submit} className="card-surface mb-6 p-5 sm:p-6">
          <h2 className="font-display text-lg">{editing ? "Edit notice" : "New notice"}</h2>
          <div className="mt-5 grid gap-5">
            <div>
              <label htmlFor="n-title" className="label">
                Title
              </label>
              <input
                id="n-title"
                required
                className="field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="n-body" className="label">
                Body
              </label>
              <textarea
                id="n-body"
                required
                rows={6}
                className="field resize-y"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="n-attachment" className="label">
                Attachment URL (optional)
              </label>
              <input
                id="n-attachment"
                className="field"
                placeholder="https://…"
                value={form.attachment_url}
                onChange={(e) => setForm({ ...form, attachment_url: e.target.value })}
              />
            </div>
            <ImageUpload
              label="Notice image (optional)"
              value={form.image_url || null}
              onChange={(url) => setForm({ ...form, image_url: url ?? "" })}
              bucket={STORAGE_BUCKETS.noticeAttachments}
            />
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="h-4 w-4 rounded border-line accent-teal"
              />
              Pin this notice to the top
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Publish notice"}
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
          icon={Megaphone}
          title="No notices yet."
          description="Publish announcements, registration openings and results here."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((notice) => (
            <li key={notice.id} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {notice.pinned && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber">
                      <Pin className="h-3 w-3" aria-hidden="true" />
                      Pinned
                    </span>
                  )}
                  <span className="text-xs text-faint">{formatDate(notice.published_at)}</span>
                </div>
                <p className="mt-1.5 truncate font-medium text-ink">{notice.title}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => togglePin(notice)}
                  aria-label={notice.pinned ? `Unpin ${notice.title}` : `Pin ${notice.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-amber"
                >
                  {notice.pinned ? (
                    <PinOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Pin className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(notice)}
                  aria-label={`Edit ${notice.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-teal"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(notice)}
                  aria-label={`Delete ${notice.title}`}
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
        title="Delete this notice?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed from the public Notices page.` : ""}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
