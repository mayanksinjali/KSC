"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { STORAGE_BUCKETS } from "@/lib/upload";
import { deleteMember, reorderMembers, saveMember } from "@/app/admin/actions";
import type { Member, MemberType } from "@/lib/types";

type FormState = {
  name: string;
  role: string;
  type: MemberType;
  session: string;
  class: string;
  photo_url: string;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  role: "",
  type: "student",
  session: "",
  class: "",
  photo_url: "",
  active: true,
};

export function MembersManager({ members, openNew = false }: { members: Member[]; openNew?: boolean }) {
  const { push } = useToast();
  const [rows, setRows] = useState(members);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MemberType>("all");
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<FormState | null>(openNew ? emptyForm : null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (!term) return true;
      return m.name.toLowerCase().includes(term) || m.role.toLowerCase().includes(term);
    });
  }, [rows, query, typeFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
  }

  function openEdit(member: Member) {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      type: member.type,
      session: member.session ?? "",
      class: member.class ?? "",
      photo_url: member.photo_url ?? "",
      active: member.active,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const result = await saveMember(editing?.id ?? null, { ...form, sort_order: editing?.sort_order ?? rows.length });
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    push(editing ? "Member updated." : "Member added.", "success");
    setForm(null);
    setEditing(null);
    window.location.reload();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteMember(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    push("Member removed.", "success");
    setDeleteTarget(null);
  }

  async function move(id: string, direction: -1 | 1) {
    const index = rows.findIndex((m) => m.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    const result = await reorderMembers(next.map((m) => m.id));
    if (!result.ok) push(result.error, "error");
  }

  async function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = rows.findIndex((m) => m.id === dragId);
    const to = rows.findIndex((m) => m.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next);
    setDragId(null);
    const result = await reorderMembers(next.map((m) => m.id));
    if (!result.ok) push(result.error, "error");
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <label htmlFor="member-search" className="sr-only">
              Search members
            </label>
            <input
              id="member-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              className="field pl-9"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter by type">
            {(["all", "student", "teacher"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTypeFilter(value)}
                aria-pressed={typeFilter === value}
                className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors ${
                  typeFilter === value
                    ? "border-teal bg-teal text-paper"
                    : "border-line bg-surface text-muted hover:border-teal/50"
                }`}
              >
                {value === "all" ? "All" : value}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add member
        </button>
      </div>

      {form && (
        <form onSubmit={submit} className="card-surface mb-6 p-5 sm:p-6">
          <h2 className="font-display text-lg">{editing ? "Edit member" : "New member"}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="m-name" className="label">
                Name
              </label>
              <input
                id="m-name"
                required
                className="field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="m-role" className="label">
                Role
              </label>
              <input
                id="m-role"
                required
                className="field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. President"
              />
            </div>
            <div>
              <label htmlFor="m-type" className="label">
                Type
              </label>
              <select
                id="m-type"
                className="field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MemberType })}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Advisor</option>
              </select>
            </div>
            <div>
              <label htmlFor="m-session" className="label">
                Session
              </label>
              <input
                id="m-session"
                className="field"
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
                placeholder="e.g. 2082/2083"
              />
            </div>
            <div>
              <label htmlFor="m-class" className="label">
                Class
              </label>
              <input
                id="m-class"
                className="field"
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                placeholder="e.g. Grade 11 — Science"
              />
            </div>
            <label className="flex items-center gap-2.5 self-end pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-line accent-teal"
              />
              Active (shown on the public Team page)
            </label>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Photo"
                value={form.photo_url || null}
                onChange={(url) => setForm({ ...form, photo_url: url ?? "" })}
                bucket={STORAGE_BUCKETS.memberPhotos}
                maxWidth={900}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add member"}
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
          icon={Users}
          title="No members found."
          description="Add committee members and advisors so they appear on the public Team page."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((member) => (
            <li
              key={member.id}
              draggable
              onDragStart={() => setDragId(member.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(member.id)}
              className="card-surface flex items-center gap-4 p-3.5"
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-faint" aria-hidden="true" />
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-paper-2">
                {member.photo_url ? (
                  <Image src={member.photo_url} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center font-display text-lg text-teal/50">
                    {member.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{member.name}</p>
                <p className="truncate text-xs text-faint">
                  {member.role} · {member.type === "student" ? "Student" : "Teacher"}
                  {member.session ? ` · ${member.session}` : ""}
                </p>
              </div>
              <span
                className={`hidden shrink-0 rounded-full border px-2.5 py-0.5 text-xs sm:inline-block ${
                  member.active ? "border-forest/30 text-forest" : "border-line text-faint"
                }`}
              >
                {member.active ? "Active" : "Inactive"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(member.id, -1)}
                  aria-label={`Move ${member.name} up`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(member.id, 1)}
                  aria-label={`Move ${member.name} down`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(member)}
                  aria-label={`Edit ${member.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-teal"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(member)}
                  aria-label={`Delete ${member.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this member?"
        description={deleteTarget ? `${deleteTarget.name} will be removed from the public Team page. This cannot be undone.` : ""}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
