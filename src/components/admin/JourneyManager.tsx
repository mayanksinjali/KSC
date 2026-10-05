"use client";

import { useState } from "react";
import { History, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/admin/Toast";
import {
  deleteJourneyMilestone,
  saveJourneyMilestone,
} from "@/app/admin/actions";
import type { JourneyMilestone } from "@/lib/types";

type FormState = {
  title: string;
  year_label: string;
  description: string;
  sort_order: number;
};

const emptyForm: FormState = {
  title: "",
  year_label: "",
  description: "",
  sort_order: 10,
};

export function JourneyManager({
  milestones,
  openNew = false,
}: {
  milestones: JourneyMilestone[];
  openNew?: boolean;
}) {
  const { push } = useToast();
  const [rows, setRows] = useState(milestones);
  const [editing, setEditing] = useState<JourneyMilestone | null>(null);
  const [form, setForm] = useState<FormState | null>(
    openNew ? { ...emptyForm, sort_order: (milestones.length + 1) * 10 } : null,
  );
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JourneyMilestone | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openEdit(milestone: JourneyMilestone) {
    setEditing(milestone);
    setForm({
      title: milestone.title,
      year_label: milestone.year_label,
      description: milestone.description,
      sort_order: milestone.sort_order,
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    const result = await saveJourneyMilestone(editing?.id ?? null, form);
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    push(editing ? "Journey milestone updated." : "Journey milestone added.", "success");
    window.location.reload();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteJourneyMilestone(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((current) => current.filter((row) => row.id !== deleteTarget.id));
    setDeleteTarget(null);
    push("Journey milestone deleted.", "success");
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setForm({ ...emptyForm, sort_order: (rows.length + 1) * 10 });
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add milestone
        </button>
      </div>

      {form && (
        <form onSubmit={submit} className="card-surface mb-6 p-5 sm:p-6">
          <h2 className="font-display text-lg">
            {editing ? "Edit milestone" : "Add a chapter to your story"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Start with your earliest known history. Use a year or date label such as “2075 BS ·
            2018 AD”. A lower order number appears earlier.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="journey-title">
                Milestone title
              </label>
              <input
                id="journey-title"
                required
                maxLength={140}
                className="field"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="journey-year">
                Year or date label
              </label>
              <input
                id="journey-year"
                required
                maxLength={80}
                placeholder="2075 BS · 2018 AD"
                className="field"
                value={form.year_label}
                onChange={(event) => setForm({ ...form, year_label: event.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="journey-order">
                Timeline order
              </label>
              <input
                id="journey-order"
                type="number"
                min={0}
                max={100000}
                required
                className="field"
                value={form.sort_order}
                onChange={(event) =>
                  setForm({ ...form, sort_order: Number(event.target.value) })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="journey-description">
                What happened?
              </label>
              <textarea
                id="journey-description"
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                className="field resize-y"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add milestone"}
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

      {rows.length === 0 ? (
        <EmptyState
          icon={History}
          title="Start your club’s story."
          description="Add the earliest chapter you know, then continue forward in time. Completed events appear on this page too."
        />
      ) : (
        <ol className="space-y-2">
          {rows.map((milestone) => (
            <li
              key={milestone.id}
              className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-teal">
                  {milestone.year_label} · Order {milestone.sort_order}
                </p>
                <p className="mt-1 font-medium text-ink">{milestone.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{milestone.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(milestone)}
                  aria-label={`Edit ${milestone.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-teal"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(milestone)}
                  aria-label={`Delete ${milestone.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this milestone?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed from the public Journey page.`
            : ""
        }
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
