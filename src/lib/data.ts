import { cache } from "react";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import {
  seedAdminUsers,
  seedApplications,
  seedEvents,
  seedGallery,
  seedMembers,
  seedNotices,
  seedSettings,
} from "./seed";
import type {
  AdminUser,
  Application,
  EventCategory,
  EventRecord,
  EventStatus,
  GalleryImage,
  JourneyMilestone,
  Member,
  MemberType,
  Notice,
  SettingsMap,
  SiteSettings,
  SiteStats,
} from "./types";

/**
 * Every public page and admin screen reads through this module — admin writes
 * land in Supabase and show up here with no code change. When no Supabase
 * project is configured yet we serve the curated seed content so the UI is
 * fully inspectable in preview.
 */

async function db() {
  if (!isSupabaseConfigured) return null;
  return createClient();
}

const today = () => new Date().toISOString().slice(0, 10);

/* ------------------------------- settings ------------------------------- */

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await db();
  let rows: SettingsMap = {};
  if (supabase) {
    const { data, error } = await supabase.from("settings").select("key,value");
    if (error) console.error("getSettings", error.message);
    rows = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
  }
  const merged = { ...seedSettings, ...rows } as SettingsMap;
  return merged as unknown as SiteSettings;
});

/* -------------------------------- members ------------------------------- */

export const listMembers = cache(async (options?: {
  type?: MemberType;
  activeOnly?: boolean;
}): Promise<Member[]> => {
  const supabase = await db();
  if (!supabase) {
    return seedMembers
      .filter((m) => (options?.type ? m.type === options.type : true))
      .filter((m) => (options?.activeOnly ? m.active : true))
      .sort((a, b) => a.sort_order - b.sort_order);
  }
  let query = supabase.from("members").select("*").order("sort_order", { ascending: true });
  if (options?.type) query = query.eq("type", options.type);
  if (options?.activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) {
    console.error("listMembers", error.message);
    return [];
  }
  return (data ?? []) as Member[];
});

/* -------------------------------- events -------------------------------- */

export interface EventFilters {
  category?: EventCategory | "all";
  status?: EventStatus | "all";
  search?: string;
}

export const listEvents = cache(async (filters: EventFilters = {}): Promise<EventRecord[]> => {
  const supabase = await db();
  let rows: EventRecord[];

  if (!supabase) {
    rows = [...seedEvents];
  } else {
    let query = supabase.from("events").select("*");
    if (filters.category && filters.category !== "all") query = query.eq("category", filters.category);
    if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
    const { data, error } = await query.order("date_ad", { ascending: false });
    if (error) {
      console.error("listEvents", error.message);
      return [];
    }
    rows = (data ?? []) as EventRecord[];
  }

  if (filters.category && filters.category !== "all") {
    rows = rows.filter((e) => e.category === filters.category);
  }
  if (filters.status && filters.status !== "all") {
    rows = rows.filter((e) => e.status === filters.status);
  }
  const term = filters.search?.trim().toLowerCase();
  if (term) {
    rows = rows.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.venue.toLowerCase().includes(term),
    );
  }
  return rows.sort((a, b) => (a.date_ad < b.date_ad ? 1 : -1));
});

export const getEvent = cache(async (id: string): Promise<EventRecord | null> => {
  const supabase = await db();
  if (!supabase) return seedEvents.find((e) => e.id === id) ?? null;
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getEvent", error.message);
    return null;
  }
  return (data as EventRecord) ?? null;
});

export const listJourneyMilestones = cache(async (): Promise<JourneyMilestone[]> => {
  const supabase = await db();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("journey_milestones")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("listJourneyMilestones", error.message);
    return [];
  }
  return (data ?? []) as JourneyMilestone[];
});

/** Nearest future upcoming event, or null when there is none. */
export async function getNextEvent(): Promise<EventRecord | null> {
  const events = await listEvents({ status: "upcoming" });
  const now = today();
  return (
    events
      .filter((e) => e.date_ad >= now)
      .sort((a, b) => (a.date_ad < b.date_ad ? -1 : 1))[0] ?? null
  );
}

/** Timeline shows finished work only — never upcoming, postponed or cancelled. */
export const listTimeline = cache(async (): Promise<EventRecord[]> => {
  const events = await listEvents({ status: "completed" });
  return events.sort((a, b) => (a.date_ad < b.date_ad ? 1 : -1));
});

/* -------------------------------- notices ------------------------------- */

export const listNotices = cache(async (): Promise<Notice[]> => {
  const supabase = await db();
  let rows: Notice[];
  if (!supabase) {
    rows = [...seedNotices];
  } else {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) {
      console.error("listNotices", error.message);
      return [];
    }
    rows = (data ?? []) as Notice[];
  }
  return rows.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.published_at < b.published_at ? 1 : -1;
  });
});

export const getNotice = cache(async (id: string): Promise<Notice | null> => {
  const supabase = await db();
  if (!supabase) return seedNotices.find((n) => n.id === id) ?? null;
  const { data, error } = await supabase.from("notices").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getNotice", error.message);
    return null;
  }
  return (data as Notice) ?? null;
});

/* -------------------------------- gallery ------------------------------- */

export const listGallery = cache(async (filters?: {
  category?: string;
  eventId?: string;
  search?: string;
}): Promise<GalleryImage[]> => {
  const supabase = await db();
  let rows: GalleryImage[];
  if (!supabase) {
    rows = [...seedGallery];
  } else {
    let query = supabase.from("gallery").select("*");
    if (filters?.category && filters.category !== "all")
      query = query.eq("category", filters.category);
    if (filters?.eventId) query = query.eq("event_id", filters.eventId);
    const { data, error } = await query.order("uploaded_at", { ascending: false });
    if (error) {
      console.error("listGallery", error.message);
      return [];
    }
    rows = (data ?? []) as GalleryImage[];
  }
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((g) => g.category === filters.category);
  }
  if (filters?.eventId) rows = rows.filter((g) => g.event_id === filters.eventId);
  const term = filters?.search?.trim().toLowerCase();
  if (term) {
    rows = rows.filter(
      (g) => g.caption.toLowerCase().includes(term) || g.alt_text.toLowerCase().includes(term),
    );
  }
  return rows;
});

/* ----------------------------- applications ----------------------------- */

export const listApplications = cache(async (): Promise<Application[]> => {
  const supabase = await db();
  if (!supabase) return [...seedApplications];
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listApplications", error.message);
    return [];
  }
  return (data ?? []) as Application[];
});

export interface AdminDashboardData {
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  pendingApplications: number;
  publishedNotices: number;
  galleryPhotos: number;
  recentApplications: Pick<Application, "id" | "name" | "class" | "status" | "created_at">[];
  recentEvents: Pick<
    EventRecord,
    "id" | "title" | "date_bs" | "date_ad" | "category" | "status"
  >[];
}

export const getAdminDashboardData = cache(async (): Promise<AdminDashboardData> => {
  const supabase = await db();
  if (!supabase) {
    const events = [...seedEvents].sort((a, b) => (a.date_ad < b.date_ad ? 1 : -1));
    const applications = [...seedApplications].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    );
    return {
      activeMembers: seedMembers.filter((member) => member.active).length,
      totalEvents: seedEvents.length,
      upcomingEvents: seedEvents.filter((event) => event.status === "upcoming").length,
      pendingApplications: seedApplications.filter((application) => application.status === "new")
        .length,
      publishedNotices: seedNotices.length,
      galleryPhotos: seedGallery.length,
      recentApplications: applications.slice(0, 4),
      recentEvents: events.slice(0, 4),
    };
  }

  const [
    activeMembersRes,
    totalEventsRes,
    upcomingEventsRes,
    pendingApplicationsRes,
    noticesRes,
    galleryRes,
    recentApplicationsRes,
    recentEventsRes,
  ] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "upcoming"),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase.from("notices").select("id", { count: "exact", head: true }),
    supabase.from("gallery").select("id", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("id,name,class,status,created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("events")
      .select("id,title,date_bs,date_ad,category,status")
      .order("date_ad", { ascending: false })
      .limit(4),
  ]);

  for (const [name, error] of [
    ["active members", activeMembersRes.error],
    ["total events", totalEventsRes.error],
    ["upcoming events", upcomingEventsRes.error],
    ["pending applications", pendingApplicationsRes.error],
    ["notices", noticesRes.error],
    ["gallery photos", galleryRes.error],
    ["recent applications", recentApplicationsRes.error],
    ["recent events", recentEventsRes.error],
  ] as const) {
    if (error) console.error(`getAdminDashboardData ${name}`, error.message);
  }

  return {
    activeMembers: activeMembersRes.count ?? 0,
    totalEvents: totalEventsRes.count ?? 0,
    upcomingEvents: upcomingEventsRes.count ?? 0,
    pendingApplications: pendingApplicationsRes.count ?? 0,
    publishedNotices: noticesRes.count ?? 0,
    galleryPhotos: galleryRes.count ?? 0,
    recentApplications: (recentApplicationsRes.data ?? []) as AdminDashboardData["recentApplications"],
    recentEvents: (recentEventsRes.data ?? []) as AdminDashboardData["recentEvents"],
  };
});

/* ----------------------------- admin users ------------------------------ */

export const listAdminUsers = cache(async (): Promise<AdminUser[]> => {
  const supabase = await db();
  if (!supabase) return [...seedAdminUsers];
  const { data, error } = await supabase.from("admin_users").select("*");
  if (error) {
    console.error("listAdminUsers", error.message);
    return [];
  }
  return (data ?? []) as AdminUser[];
});

export const getCurrentAdmin = cache(async (): Promise<
  { id: string; email: string; role: AdminUser["role"] } | null
> => {
  const supabase = await db();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    console.error("getCurrentAdmin", error.message);
    return null;
  }
  return data ?? null;
});

/* --------------------------------- stats -------------------------------- */

/**
 * Real database-derived numbers. Zero values are hidden by the UI instead of
 * rendered as "0".
 */
export const getStats = cache(async (): Promise<SiteStats> => {
  const supabase = await db();
  if (!supabase) {
    const activeMembers = seedMembers.filter((m) => m.active).length;
    const eventsHeld = seedEvents.filter((e) => e.status === "completed").length;
    const earliest = seedEvents
      .filter((event) => event.status === "completed")
      .map((e) => Number(e.date_ad.slice(0, 4)))
      .filter((y) => Number.isFinite(y))
      .sort((a, b) => a - b)[0];
    return {
      activeMembers,
      eventsHeld,
      yearsRunning:
        earliest && earliest <= new Date().getFullYear()
          ? new Date().getFullYear() - earliest + 1
          : 0,
    };
  }

  let activeMembers = 0;
  let eventsHeld = 0;
  let earliestYear = 0;

  try {
    const [membersRes, completedRes, earliestRes] = await Promise.all([
      supabase.from("members").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase
        .from("events")
        .select("date_ad")
        .eq("status", "completed")
        .order("date_ad", { ascending: true })
        .limit(1),
    ] as const);
    if (membersRes.error) console.error("getStats members", membersRes.error.message);
    if (completedRes.error) console.error("getStats completed events", completedRes.error.message);
    if (earliestRes.error) console.error("getStats earliest event", earliestRes.error.message);
    activeMembers = membersRes.count ?? 0;
    eventsHeld = completedRes.count ?? 0;
    const first = earliestRes.data?.[0]?.date_ad;
    earliestYear = first ? Number(String(first).slice(0, 4)) : 0;
  } catch (error) {
    console.error("getStats", error);
  }

  return {
    activeMembers,
    eventsHeld,
    yearsRunning:
      earliestYear && earliestYear <= new Date().getFullYear()
        ? new Date().getFullYear() - earliestYear + 1
        : 0,
  };
});
