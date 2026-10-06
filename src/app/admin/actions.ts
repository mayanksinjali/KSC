"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminContext, requireAdmin, requireSuperAdmin } from "@/lib/auth";
import {
  adminRoleSchema,
  adminInviteEmailSchema,
  applicationStatusSchema,
  eventSchema,
  gallerySchema,
  journeyMilestoneSchema,
  memberSchema,
  noticeSchema,
  settingsSchema,
} from "@/lib/validation";
import type { ActionResult, AdminRole } from "@/lib/types";

const PREVIEW_ERROR =
  "Preview mode: connect a Supabase project (.env.local) to save changes. Nothing was written.";

function fail<T = void>(error: string): ActionResult<T> {
  return { ok: false, error };
}

async function guarded<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message === "UNAUTHORIZED") return fail("You need to sign in to do that.");
    if (message === "FORBIDDEN") return fail("Your role does not allow this action.");
    console.error("admin action failed:", message);
    return fail("Something went wrong. Nothing was saved.");
  }
}

function revalidateAll(paths: string[]) {
  for (const path of paths) revalidatePath(path);
}

/* -------------------------------- members ------------------------------- */

export async function saveMember(id: string | null, input: unknown): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = memberSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid member data");

    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const payload = {
      ...parsed.data,
      session: parsed.data.session || null,
      class: parsed.data.class || null,
      photo_url: parsed.data.photo_url || null,
    };

    const { error } = id
      ? await supabase.from("members").update(payload).eq("id", id)
      : await supabase.from("members").insert(payload);
    if (error) return fail(error.message);

    revalidateAll(["/admin/members", "/team", "/"]);
    return { ok: true, data: undefined };
  });
}

export async function deleteMember(id: string): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/members", "/team", "/"]);
    return { ok: true, data: undefined };
  });
}

export async function reorderMembers(orderedIds: string[]): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const results = await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("members").update({ sort_order: index }).eq("id", id),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return fail(failed.error.message);
    revalidateAll(["/admin/members", "/team"]);
    return { ok: true, data: undefined };
  });
}

/* -------------------------------- events -------------------------------- */

export async function saveEvent(id: string | null, input: unknown): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = eventSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid event data");

    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const payload = {
      ...parsed.data,
      cover_url: parsed.data.cover_url || null,
      registration_url: parsed.data.registration_url || null,
      result: parsed.data.result || null,
    };

    const { error } = id
      ? await supabase.from("events").update(payload).eq("id", id)
      : await supabase.from("events").insert(payload);
    if (error) return fail(error.message);

    revalidateAll(["/admin/events", "/events", "/journey", "/"]);
    return { ok: true, data: undefined };
  });
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/events", "/events", "/journey", "/"]);
    return { ok: true, data: undefined };
  });
}

/* -------------------------- journey milestones -------------------------- */

export async function saveJourneyMilestone(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = journeyMilestoneSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid journey milestone");
    }

    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = id
      ? await supabase.from("journey_milestones").update(parsed.data).eq("id", id)
      : await supabase.from("journey_milestones").insert(parsed.data);
    if (error) return fail(error.message);

    revalidateAll(["/admin/journey", "/journey"]);
    return { ok: true, data: undefined };
  });
}

export async function deleteJourneyMilestone(id: string): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = await supabase.from("journey_milestones").delete().eq("id", id);
    if (error) return fail(error.message);

    revalidateAll(["/admin/journey", "/journey"]);
    return { ok: true, data: undefined };
  });
}

/* -------------------------------- notices ------------------------------- */

export async function saveNotice(id: string | null, input: unknown): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = noticeSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid notice data");

    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const payload = {
      ...parsed.data,
      attachment_url: parsed.data.attachment_url || null,
      image_url: parsed.data.image_url || null,
    };

    const { error } = id
      ? await supabase.from("notices").update(payload).eq("id", id)
      : await supabase.from("notices").insert(payload);
    if (error) return fail(error.message);

    revalidateAll(["/admin/notices", "/notices", "/"]);
    return { ok: true, data: undefined };
  });
}

export async function deleteNotice(id: string): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/notices", "/notices"]);
    return { ok: true, data: undefined };
  });
}

export async function toggleNoticePin(id: string, pinned: boolean): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = await supabase.from("notices").update({ pinned }).eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/notices", "/notices"]);
    return { ok: true, data: undefined };
  });
}

/* -------------------------------- gallery ------------------------------- */

export async function saveGalleryImage(input: unknown): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = gallerySchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid photo data");

    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = await supabase.from("gallery").insert({
      ...parsed.data,
      event_id: parsed.data.event_id || null,
    });
    if (error) return fail(error.message);
    revalidateAll(["/admin/gallery", "/gallery"]);
    return { ok: true, data: undefined };
  });
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/gallery", "/gallery"]);
    return { ok: true, data: undefined };
  });
}

/* ----------------------------- applications ----------------------------- */

export async function setApplicationStatus(id: string, status: string): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = applicationStatusSchema.safeParse({ status });
    if (!parsed.success) return fail("Invalid status");
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id)
      .is("accepted_member_id", null)
      .select("id")
      .maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail("Application not found or already accepted as a member.");
    revalidateAll(["/admin/applications", "/admin/dashboard"]);
    return { ok: true, data: undefined };
  });
}

export async function acceptApplication(
  id: string,
): Promise<ActionResult<{ memberId: string }>> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { data, error } = await supabase.rpc("accept_application", {
      p_application_id: id,
    });
    if (error) return fail(error.message);
    if (typeof data !== "string") return fail("The application was accepted but no member ID was returned.");
    revalidateAll(["/admin/applications", "/admin/members", "/admin/dashboard", "/team", "/"]);
    return { ok: true, data: { memberId: data } };
  });
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  return guarded(async () => {
    await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/applications"]);
    return { ok: true, data: undefined };
  });
}

/* -------------------------------- settings ------------------------------ */

export async function saveSettings(input: unknown): Promise<ActionResult> {
  return guarded(async () => {
    await requireSuperAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid settings payload");
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");

    const rows = Object.entries(parsed.data).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
    if (error) return fail(error.message);

    revalidateAll(["/admin/settings", "/", "/about", "/join", "/team"]);
    return { ok: true, data: undefined };
  });
}

/* ------------------------------ admin users ----------------------------- */

export async function saveAdminUser(id: string, input: unknown): Promise<ActionResult> {
  return guarded(async () => {
    const actor = await requireSuperAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = adminRoleSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid admin role");

    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    if (id === actor.id) return fail("You cannot change your own admin role.");
    const { data: target, error: targetError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", id)
      .maybeSingle();
    if (targetError) return fail(targetError.message);
    if (!target) return fail("Admin account not found.");
    if (target.role === "super_admin" && parsed.data.role === "editor") {
      const { count, error: countError } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin");
      if (countError) return fail(countError.message);
      if ((count ?? 0) <= 1) return fail("The last Super Admin cannot be demoted.");
    }

    const { error } = await supabase
      .from("admin_users")
      .update({ role: parsed.data.role })
      .eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/admin-users"]);
    return { ok: true, data: undefined };
  });
}

export async function appointMemberAsAdmin(
  memberId: string,
  role: AdminRole,
): Promise<ActionResult<{ id: string; email: string; invitationPending: boolean }>> {
  return guarded(async () => {
    const actor = await requireSuperAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const parsedRole = adminRoleSchema.safeParse({ role });
    if (!parsedRole.success) return fail("Choose a valid admin role.");

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id,active")
      .eq("id", memberId)
      .eq("active", true)
      .maybeSingle();
    if (memberError) return fail(memberError.message);
    if (!member) return fail("Active member not found.");

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("id,contact")
      .eq("accepted_member_id", memberId)
      .maybeSingle();
    if (applicationError) return fail(applicationError.message);
    if (!application) return fail("Only accepted applicants can be appointed.");

    const parsedEmail = adminInviteEmailSchema.safeParse(application.contact);
    if (!parsedEmail.success) {
      return fail("This application has no valid email address. Ask them to update their application contact before inviting.");
    }
    const email = parsedEmail.data.toLowerCase();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) return fail("Set NEXT_PUBLIC_SITE_URL to your deployed site URL before sending invitations.");
    let redirectTo: string;
    try {
      redirectTo = new URL("/admin/accept-invite", siteUrl).toString();
    } catch {
      return fail("NEXT_PUBLIC_SITE_URL must be a valid absolute URL before sending invitations.");
    }

    const service = createAdminClient();
    if (!service) {
      return fail("Set SUPABASE_SERVICE_ROLE_KEY on the server to send admin invitations.");
    }

    let invitedUser;
    let invitationPending = true;
    let page = 1;
    do {
      const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return fail(`Could not check existing accounts: ${error.message}`);
      invitedUser = data.users.find((user) => user.email?.toLowerCase() === email);
      if (invitedUser || data.users.length < 1000) break;
      page += 1;
    } while (true);

    if (invitedUser?.id === actor.id) return fail("You cannot change your own admin role.");
    const { data: currentRole, error: currentRoleError } = invitedUser
      ? await supabase
          .from("admin_users")
          .select("role")
          .eq("id", invitedUser.id)
          .maybeSingle()
      : { data: null, error: null };
    if (currentRoleError) return fail(currentRoleError.message);
    if (
      currentRole?.role === "super_admin" &&
      parsedRole.data.role === "editor"
    ) {
      const { count, error } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin");
      if (error) return fail(error.message);
      if ((count ?? 0) <= 1) return fail("The last Super Admin cannot be demoted.");
    }

    if (invitedUser?.email_confirmed_at) {
      invitationPending = false;
    } else if (invitedUser) {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) return fail(`Could not resend the account setup email: ${error.message}`);
    } else {
      const { data, error } = await service.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (error) return fail(`Could not send the account invitation: ${error.message}`);
      invitedUser = data.user;
    }

    if (!invitedUser) return fail("Invitation did not return an account. Please try again.");

    const { error: saveAdminError } = await service.from("admin_users").upsert(
      {
        id: invitedUser.id,
        email,
        role: parsedRole.data.role,
        invitation_pending: invitationPending,
      },
      { onConflict: "id" },
    );
    if (saveAdminError) {
      return fail(`The invitation was sent, but the admin role could not be saved: ${saveAdminError.message}`);
    }

    const { error: clearAppointmentError } = await service
      .from("applications")
      .update({ appointed_role: null })
      .eq("id", application.id);
    if (clearAppointmentError) {
      console.error("appointMemberAsAdmin clear appointment", clearAppointmentError.message);
      return fail(
        `Role saved and invitation sent, but the application appointment could not be cleared: ${clearAppointmentError.message}`,
      );
    }

    revalidateAll(["/admin/admin-users"]);
    return {
      ok: true,
      data: { id: invitedUser.id, email, invitationPending },
    };
  });
}

export async function completeAdminInvite(): Promise<ActionResult> {
  return guarded(async () => {
    const admin = await requireAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { data, error } = await supabase
      .from("admin_users")
      .select("invitation_pending")
      .eq("id", admin.id)
      .maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail("Admin account not found.");
    if (!data.invitation_pending) return { ok: true, data: undefined };

    const service = createAdminClient();
    if (!service) return fail("Admin invitation service is unavailable.");
    const { error: updateError } = await service
      .from("admin_users")
      .update({ invitation_pending: false })
      .eq("id", admin.id);
    if (updateError) return fail(updateError.message);
    revalidateAll(["/admin/admin-users"]);
    return { ok: true, data: undefined };
  });
}

export async function removeAdminUser(id: string): Promise<ActionResult> {
  return guarded(async () => {
    const admin = await requireSuperAdmin();
    if (admin.id === id) return fail("You cannot remove your own admin access.");
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
    const { data: target, error: targetError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", id)
      .maybeSingle();
    if (targetError) return fail(targetError.message);
    if (!target) return fail("Admin account not found.");
    if (target.role === "super_admin") {
      const { count, error: countError } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin");
      if (countError) return fail(countError.message);
      if ((count ?? 0) <= 1) return fail("The last Super Admin cannot be removed.");
    }
    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/admin-users"]);
    return { ok: true, data: undefined };
  });
}

/* --------------------------------- utils -------------------------------- */

export async function getViewerRole() {
  const admin = await getAdminContext();
  return admin?.role ?? null;
}
