"use client";

import { useMemo, useState } from "react";
import { CheckCheck, Download, Inbox, Search, Trash2, Undo2, UserRoundPlus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/admin/Toast";
import { acceptApplication, deleteApplication, setApplicationStatus } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import type { Application } from "@/lib/types";

export function ApplicationsInbox({ applications }: { applications: Application[] }) {
  const { push } = useToast();
  const [rows, setRows] = useState(applications);
  const [filter, setFilter] = useState<"all" | "new" | "reviewed">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!term) return true;
      return (
        a.name.toLowerCase().includes(term) ||
        a.class.toLowerCase().includes(term) ||
        a.contact.toLowerCase().includes(term)
      );
    });
  }, [rows, query, filter]);

  async function toggleStatus(app: Application) {
    if (app.accepted_member_id) return;
    const next = app.status === "new" ? "reviewed" : "new";
    const result = await setApplicationStatus(app.id, next);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: next } : a)));
    if (selected?.id === app.id) setSelected({ ...app, status: next });
    push(next === "reviewed" ? "Marked as reviewed." : "Moved back to new.", "success");
  }

  async function acceptAsMember(app: Application) {
    if (app.accepted_member_id || acceptingId) return;
    setAcceptingId(app.id);
    const result = await acceptApplication(app.id);
    setAcceptingId(null);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    const updated = {
      ...app,
      status: "reviewed" as const,
      accepted_member_id: result.data.memberId,
    };
    setRows((prev) => prev.map((row) => (row.id === app.id ? updated : row)));
    setSelected(updated);
    push(`${app.name} accepted as a member.`, "success");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteApplication(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    if (selected?.id === deleteTarget.id) setSelected(null);
    push("Application deleted.", "success");
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
            <label htmlFor="app-search" className="sr-only">
              Search applications
            </label>
            <input
              id="app-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, class, contact…"
              className="field pl-9"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter applications">
            {(["all", "new", "reviewed"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors ${
                  filter === value
                    ? "border-teal bg-teal text-paper"
                    : "border-line bg-surface text-muted hover:border-teal/50"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <a href="/api/admin/applications/export" className="btn-ghost" download>
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </a>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No applications here."
          description="Applications submitted through the Join Us form arrive here for review."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <ul className="space-y-2">
            {filtered.map((app) => (
              <li key={app.id}>
                <button
                  type="button"
                  onClick={() => setSelected(app)}
                  className={`card-surface w-full p-4 text-left transition-colors ${
                    selected?.id === app.id ? "border-teal" : "hover:border-teal/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{app.name}</p>
                      <p className="text-xs text-faint">
                        {app.class} · {formatDate(app.created_at)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted">{app.message}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${
                        app.accepted_member_id
                          ? "border-teal/40 bg-teal/10 text-teal"
                          : app.status === "new"
                          ? "border-amber/40 bg-amber/10 text-amber"
                          : "border-forest/30 text-forest"
                      }`}
                    >
                      {app.accepted_member_id
                        ? "Accepted"
                        : app.status === "new"
                          ? "New"
                          : "Reviewed"}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            {selected ? (
              <div className="card-surface p-5">
                <h2 className="font-display text-lg">{selected.name}</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-faint">Class</dt>
                    <dd className="text-ink">{selected.class}</dd>
                  </div>
                  <div>
                    <dt className="text-faint">Contact</dt>
                    <dd className="break-words text-ink">{selected.contact}</dd>
                  </div>
                  <div>
                    <dt className="text-faint">Submitted</dt>
                    <dd className="text-ink">{formatDate(selected.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-faint">Message</dt>
                    <dd className="mt-1 whitespace-pre-line leading-relaxed text-muted">
                      {selected.message}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selected.accepted_member_id ? (
                    <a href="/admin/members" className="btn-primary">
                      <CheckCheck className="h-4 w-4" aria-hidden="true" />
                      Accepted · View members
                    </a>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={acceptingId !== null}
                        onClick={() => acceptAsMember(selected)}
                      >
                        <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
                        {acceptingId === selected.id ? "Accepting…" : "Accept as member"}
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => toggleStatus(selected)}>
                        {selected.status === "new" ? (
                          <>
                            <CheckCheck className="h-4 w-4" aria-hidden="true" />
                            Mark reviewed
                          </>
                        ) : (
                          <>
                            <Undo2 className="h-4 w-4" aria-hidden="true" />
                            Move to new
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setDeleteTarget(selected)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-surface p-6 text-sm text-faint">
                Select an application to read the full message and update its status.
              </div>
            )}
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this application?"
        description={deleteTarget ? `${deleteTarget.name}'s application will be permanently removed.` : ""}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
