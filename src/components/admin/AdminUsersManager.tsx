"use client";

import { useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { removeAdminUser, saveAdminUser } from "@/app/admin/actions";
import type { AdminRole, AdminUser } from "@/lib/types";

export function AdminUsersManager({
  admins,
  currentId,
}: {
  admins: AdminUser[];
  currentId: string;
}) {
  const { push } = useToast();
  const [rows, setRows] = useState(admins);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [saving, setSaving] = useState(false);
  const [roleTarget, setRoleTarget] = useState<{ admin: AdminUser; role: AdminRole } | null>(null);
  const [changingRole, setChangingRole] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await saveAdminUser(null, { email, role });
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    push(`Invitation sent to ${email}.`, "success");
    setEmail("");
  }

  async function confirmRoleChange() {
    if (!roleTarget) return;
    setChangingRole(true);
    const result = await saveAdminUser(roleTarget.admin.id, {
      email: roleTarget.admin.email,
      role: roleTarget.role,
    });
    setChangingRole(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) =>
      prev.map((admin) =>
        admin.id === roleTarget.admin.id ? { ...admin, role: roleTarget.role } : admin,
      ),
    );
    push("Role updated.", "success");
    setRoleTarget(null);
  }

  async function confirmRemove() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await removeAdminUser(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    push("Admin removed.", "success");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={invite} className="card-surface p-5 sm:p-6">
        <h2 className="font-display text-lg">Invite an admin</h2>
        <p className="mt-1 text-sm text-muted">
          The person receives an email invitation and sets their own password. Edits are enforced by
          database policies, not just this screen.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
          <div>
            <label htmlFor="admin-email" className="label">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="committee@example.com"
            />
          </div>
          <div>
            <label htmlFor="admin-role" className="label">
              Role
            </label>
            <select
              id="admin-role"
              className="field"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
            >
              <option value="editor">Editor (student committee)</option>
              <option value="super_admin">Super Admin (teacher)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {saving ? "Inviting…" : "Invite"}
          </button>
        </div>
      </form>

      <div className="card-surface overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
          <h2 className="font-display text-lg">Admin users</h2>
        </div>
        <ul className="divide-y divide-line">
          {rows.map((admin) => (
            <li key={admin.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{admin.email}</p>
                <p className="text-xs text-faint">
                  {admin.role === "super_admin" ? "Super Admin" : "Editor"}
                  {admin.id === currentId ? " · you" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">
                  {admin.role === "super_admin" ? "Super Admin" : "Editor"}
                </span>
                <button
                  type="button"
                  disabled={admin.id === currentId}
                  onClick={() =>
                    setRoleTarget({
                      admin,
                      role: admin.role === "super_admin" ? "editor" : "super_admin",
                    })
                  }
                  className="btn-ghost px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Change role
                </button>
                <button
                  type="button"
                  disabled={admin.id === currentId}
                  onClick={() => setDeleteTarget(admin)}
                  aria-label={`Remove ${admin.email}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(roleTarget)}
        title="Confirm admin role change"
        description={
          roleTarget
            ? `Change ${roleTarget.admin.email} from ${
                roleTarget.admin.role === "super_admin" ? "Super Admin" : "Editor"
              } to ${roleTarget.role === "super_admin" ? "Super Admin" : "Editor"}? ${
                roleTarget.role === "super_admin"
                  ? "This grants full control over site settings and admin accounts."
                  : "This removes access to site settings and admin account management."
              }`
            : ""
        }
        confirmLabel="Confirm role change"
        destructive={roleTarget?.role === "editor"}
        pending={changingRole}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this admin?"
        description={
          deleteTarget
            ? `${deleteTarget.email} will lose access to the admin panel immediately.`
            : ""
        }
        confirmLabel="Remove"
        pending={deleting}
        onConfirm={confirmRemove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
