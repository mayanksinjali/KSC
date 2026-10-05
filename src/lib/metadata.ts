import type { Metadata } from "next";
import type { SiteSettings } from "@/lib/types";

export function createPageMetadata(
  settings: SiteSettings,
  {
    title,
    description,
    canonical,
    image,
    type = "website",
  }: {
    title: string;
    description: string;
    canonical: string;
    image?: string | null;
    type?: "website" | "article";
  },
): Metadata {
  const socialImage = image || settings.og_image_url || "/opengraph-image";
  const socialTitle = `${title} · ${settings.club_name}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      siteName: settings.club_name,
      title: socialTitle,
      description,
      url: canonical,
      images: [{ url: socialImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage],
    },
  };
}
