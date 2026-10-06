"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, Trash2, UserRoundPlus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import {
  appointMemberAsAdmin,
  removeAdminUser,
  saveAdminUser,
} from "@/app/admin/actions";
import type { AdminRole, AdminUser, AppointableMember } from "@/lib/types";

export function AdminUsersManager({
  admins,
  appointableMembers,
  currentId,
}: {
  admins: AdminUser[];
  appointableMembers: AppointableMember[];
  currentId: string;
}) {
  const { push } = useToast();
  const [rows, setRows] = useState(admins);
  const [members, setMembers] = useState(appointableMembers);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AppointableMember | null>(null);
  const [role, setRole] = useState<AdminRole>("editor");
  const [appointing, setAppointing] = useState(false);
  const [roleTarget, setRoleTarget] = useState<{ admin: AdminUser; role: AdminRole } | null>(null);
  const [changingRole, setChangingRole] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || selected) return [];
    return members
      .filter(
        (member) =>
          member.name.toLowerCase().includes(term) ||
          (member.class ?? "").toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [members, query, selected]);

  async function appoint() {
    if (!selected) return;
    setAppointing(true);
    const result = await appointMemberAsAdmin(selected.member_id, role);
    setAppointing(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }

    const updatedAdmin = {
      id: result.data.id,
      email: result.data.email,
      role,
      invitation_pending: result.data.invitationPending,
    };
    setRows((prev) => [
      ...prev.filter((admin) => admin.id !== updatedAdmin.id),
      updatedAdmin,
    ]);
    setMembers((prev) =>
      prev.map((member) =>
        member.member_id === selected.member_id
          ? {
              ...member,
              role,
              user_id: result.data.id,
              invitation_pending: result.data.invitationPending,
            }
          : member,
      ),
    );
    push(
      result.data.invitationPending
        ? `Invitation sent to ${result.data.email}. They can set a password from the email to access the Admin panel.`
        : `${selected.name} already has an account. Their role is now ${role === "super_admin" ? "Super Admin" : "Editor"}.`,
      "success",
    );
    setSelected(null);
    setQuery("");
  }

  async function confirmRoleChange() {
    if (!roleTarget) return;
    setChangingRole(true);
    const result = await saveAdminUser(roleTarget.admin.id, { role: roleTarget.role });
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
    setRows((prev) => prev.filter((admin) => admin.id !== deleteTarget.id));
    setMembers((prev) =>
      prev.map((member) =>
        member.user_id === deleteTarget.id ? { ...member, role: null } : member,
      ),
    );
    push("Admin removed.", "success");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <section className="card-surface p-5 sm:p-6">
        <h2 className="font-display text-lg">Appoint a KSC member</h2>
        <p className="mt-1 text-sm text-muted">
          Search accepted applicants by name or class, choose a role, and send an account setup
          invitation to the email on their application. Manually added members are not eligible.
        </p>
        <div className="relative mt-5 max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <label htmlFor="member-appointment-search" className="sr-only">
            Search eligible members by name or class
          </label>
          <input
            id="member-appointment-search"
            type="search"
            className="field pl-9"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
            }}
            placeholder="Type a member name…"
            autoComplete="off"
          />
          {matches.length > 0 && (
            <ul
              aria-label="Eligible members"
              className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-soft border border-line bg-surface shadow-lift"
            >
              {matches.map((member) => (
                <li key={member.member_id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(member);
                      setRole(member.role ?? "editor");
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-paper-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {member.name}
                      </span>
                      <span className="block truncate text-xs text-faint">
                        {member.class || member.account}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-teal">
                      {member.role
                        ? `${member.user_id ? "Current" : "Appointed"}: ${
                            member.role === "super_admin" ? "Super Admin" : "Editor"
                          }`
                        : "Eligible"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {query.trim() && matches.length === 0 && !selected && (
          <p className="mt-2 text-sm text-faint">
            No accepted applicants match. Manually added members are not eligible for admin
            appointments.
          </p>
        )}

        {selected && (
          <div className="mt-4 flex flex-col gap-4 rounded-soft border border-line bg-paper-2/50 p-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{selected.name}</p>
              <p className="text-xs text-faint">
                {selected.class || "Class not set"} · Invitation email: {selected.account}
              </p>
            </div>
            <div className="sm:w-48">
              <label htmlFor="member-admin-role" className="label">
                Appoint as
              </label>
              <select
                id="member-admin-role"
                className="field"
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
              >
                <option value="editor">Editor</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <button
              type="button"
              className="btn-primary"
              disabled={
                appointing ||
                selected.user_id === currentId ||
                !selected.account.includes("@")
              }
              onClick={appoint}
            >
              <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
              {appointing ? "Sending invitation…" : "Appoint & send invitation"}
            </button>
          </div>
        )}
        {selected && !selected.account.includes("@") && (
          <p className="mt-3 text-sm text-amber">
            This application has a phone number, not an email. An email address is required to
            send the account setup invitation.
          </p>
        )}
      </section>

      {members.some((member) => member.role) && (
        <section className="card-surface overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <UserRoundPlus className="h-4 w-4 text-teal" aria-hidden="true" />
            <h2 className="font-display text-lg">Appointed KSC members</h2>
          </div>
          <ul className="divide-y divide-line">
            {members
              .filter((member) => member.role)
              .map((member) => (
                <li
                  key={member.member_id}
                  className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{member.name}</p>
                    <p className="truncate text-xs text-faint">
                      {member.class || "Class not set"} · {member.account}
                    </p>
                  </div>
                  <span className="text-sm text-teal">
                    {member.role === "super_admin" ? "Super Admin" : "Editor"}
                    {member.invitation_pending
                      ? " · Invitation pending"
                      : member.user_id
                        ? ""
                        : " · Appointment recorded"}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="card-surface overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
          <h2 className="font-display text-lg">Admin users</h2>
        </div>
        <ul className="divide-y divide-line">
          {rows.map((admin) => (
            <li
              key={admin.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{admin.email}</p>
                <p className="text-xs text-faint">
                  {admin.role === "super_admin" ? "Super Admin" : "Editor"}
                  {admin.id === currentId ? " · you" : ""}
                  {admin.invitation_pending ? " · Invitation pending" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
      </section>

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
