"use client";

import { createClient } from "./supabase/client";

export const STORAGE_BUCKETS = {
  memberPhotos: "member-photos",
  eventImages: "event-images",
  galleryImages: "gallery-images",
  noticeAttachments: "notice-attachments",
  siteAssets: "site-assets",
} as const;

export type Bucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export interface PreparedImage {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  originalSize: number;
  size: number;
}

/**
 * Resizes and compresses an image in the browser before upload, converting to
 * WebP where the browser supports it. Keeps phone-camera originals from being
 * stored at full size.
 */
export async function prepareImage(
  input: File,
  { maxWidth = 1600, quality = 0.82 }: { maxWidth?: number; quality?: number } = {},
): Promise<PreparedImage> {
  if (!input.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  const bitmapUrl = URL.createObjectURL(input);
  try {
    const img = await loadImage(bitmapUrl);
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not process this image.");
    ctx.drawImage(img, 0, 0, width, height);

    const type = supportsWebp() ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, quality),
    );
    if (!blob) throw new Error("Could not compress this image.");

    const extension = type === "image/webp" ? "webp" : "jpg";
    const baseName = input.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
    const file = new File([blob], `${baseName || "image"}.${extension}`, { type });

    return {
      file,
      previewUrl: URL.createObjectURL(blob),
      width,
      height,
      originalSize: input.size,
      size: file.size,
    };
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This file could not be read as an image."));
    img.src = src;
  });
}

let webpSupport: boolean | null = null;
function supportsWebp() {
  if (webpSupport !== null) return webpSupport;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  webpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return webpSupport;
}

export async function uploadImage(
  file: File,
  bucket: Bucket,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const supabase = createClient();
  if (!supabase) throw new Error("Connect a Supabase project to upload images.");

  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name}`;
  onProgress?.(10);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error("Upload failed. Please try again.");

  onProgress?.(100);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
