"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminContext, requireAdmin, requireSuperAdmin } from "@/lib/auth";
import {
  adminUserSchema,
  applicationStatusSchema,
  eventSchema,
  gallerySchema,
  memberSchema,
  noticeSchema,
  settingsSchema,
} from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

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
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return fail(error.message);
    revalidateAll(["/admin/applications", "/admin/dashboard"]);
    return { ok: true, data: undefined };
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

export async function saveAdminUser(id: string | null, input: unknown): Promise<ActionResult> {
  return guarded(async () => {
    await requireSuperAdmin();
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const parsed = adminUserSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid admin data");

    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");

    // Admin accounts are created through Supabase Auth (invite) and linked by id.
    if (!id) {
      const { error } = await supabase.auth.admin
        ? await supabase.auth.admin.inviteUserByEmail(parsed.data.email)
        : { error: { message: "Admin invites require the service role key on the server." } };
      if (error) return fail(error.message);
      revalidateAll(["/admin/admin-users"]);
      return { ok: true, data: undefined };
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

export async function removeAdminUser(id: string): Promise<ActionResult> {
  return guarded(async () => {
    const admin = await requireSuperAdmin();
    if (admin.id === id) return fail("You cannot remove your own admin access.");
    if (!isSupabaseConfigured) return fail(PREVIEW_ERROR);
    const supabase = await createClient();
    if (!supabase) return fail("Database unavailable");
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
