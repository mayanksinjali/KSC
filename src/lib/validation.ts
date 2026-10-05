import { z } from "zod";
import { ADMIN_ROLES, APPLICATION_STATUSES, EVENT_CATEGORIES, EVENT_STATUSES, MEMBER_TYPES } from "./types";

/** Requires real text — generic placeholders are rejected. */
const noPlaceholder = (max: number) =>
  z
    .string()
    .trim()
    .min(3, "This field is required")
    .max(max, "This is too long")
    .refine(
      (v) =>
        !/^(n\/?a|na|none|null|test|asdf|placeholder|image|photo|exhibition view|group photo|-+)$/i.test(
          v,
        ),
      {
        message: "Please write something meaningful, not a placeholder",
      },
    );

function isValidBsDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 32;
}

function isValidAdDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  class: z.string().trim().min(1, "Please enter your class").max(40),
  contact: z
    .string()
    .trim()
    .min(7, "Enter a phone number or email")
    .max(80)
    .refine((v) => /^[+\d][\d\s-]{5,}$/.test(v) || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), {
      message: "Enter a valid phone number or email address",
    }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us at least a sentence about why you want to join")
    .max(1000),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const memberSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  role: z.string().trim().min(2, "Role is required").max(80),
  type: z.enum(MEMBER_TYPES),
  session: z.string().trim().max(40).optional().or(z.literal("")),
  class: z.string().trim().max(40).optional().or(z.literal("")),
  photo_url: z.string().trim().url("Enter a valid image URL").optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean().default(true),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(140),
  category: z.enum(EVENT_CATEGORIES),
  description: z.string().trim().min(10, "Description is required").max(4000),
  date_bs: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid Bikram Sambat date, e.g. 2083-01-15")
    .refine(isValidBsDate, "Enter a valid Bikram Sambat date, e.g. 2083-01-15"),
  date_ad: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid AD date, e.g. 2026-04-28")
    .refine(isValidAdDate, "Enter a valid AD calendar date, e.g. 2026-04-28"),
  venue: z.string().trim().min(3, "Venue is required").max(160),
  status: z.enum(EVENT_STATUSES),
  cover_url: z.string().trim().url("Enter a valid image URL").optional().or(z.literal("")),
  registration_url: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  result: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const noticeSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(140),
  body: z.string().trim().min(10, "Body is required").max(8000),
  attachment_url: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  image_url: z.string().trim().url("Enter a valid image URL").optional().or(z.literal("")),
  pinned: z.coerce.boolean().default(false),
});

export const gallerySchema = z.object({
  image_url: z.string().trim().url("A valid image URL is required"),
  caption: noPlaceholder(200),
  alt_text: noPlaceholder(200),
  category: z.string().trim().min(1, "Category is required").max(60),
  event_id: z.string().trim().optional().or(z.literal("")),
});

export const settingsSchema = z.record(z.string(), z.string().max(4000));

export const adminUserSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(ADMIN_ROLES),
});

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});
