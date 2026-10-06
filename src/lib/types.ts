export const EVENT_CATEGORIES = [
  "Exhibition",
  "Quiz",
  "Talk",
  "Inspire",
  "Code",
  "Art",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_STATUSES = ["upcoming", "completed", "postponed", "cancelled"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const MEMBER_TYPES = ["student", "teacher"] as const;
export type MemberType = (typeof MEMBER_TYPES)[number];

export const APPLICATION_STATUSES = ["new", "reviewed"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const ADMIN_ROLES = ["super_admin", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface Member {
  id: string;
  name: string;
  role: string;
  type: MemberType;
  session: string | null;
  class: string | null;
  photo_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface EventRecord {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  date_bs: string;
  date_ad: string;
  venue: string;
  status: EventStatus;
  cover_url: string | null;
  registration_url: string | null;
  result: string | null;
  created_at: string;
}

export interface JourneyMilestone {
  id: string;
  title: string;
  year_label: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  attachment_url: string | null;
  image_url: string | null;
  pinned: boolean;
  published_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  alt_text: string;
  category: string;
  event_id: string | null;
  uploaded_at: string;
}

export interface Application {
  id: string;
  name: string;
  class: string;
  contact: string;
  message: string;
  status: ApplicationStatus;
  accepted_member_id?: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
}

export interface AppointableMember {
  member_id: string;
  name: string;
  class: string | null;
  account: string;
  user_id: string;
  role: AdminRole | null;
}

export type SettingsMap = Record<string, string>;

export interface SiteSettings {
  club_name: string;
  tagline_en: string;
  tagline_ne: string;
  hero_heading: string;
  hero_text: string;
  mission_title: string;
  mission_body: string;
  about_intro: string;
  vision: string;
  what_we_do: string;
  history: string;
  contact_email: string;
  facebook_url: string;
  meeting_location: string;
  logo_url: string;
  favicon_url: string;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
}

export type SiteStats = {
  activeMembers: number;
  eventsHeld: number;
  yearsRunning: number;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
