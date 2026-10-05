import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getSettings, listEvents, listGallery } from "@/lib/data";
import { GALLERY_CATEGORIES } from "@/lib/seed";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, images] = await Promise.all([getSettings(), listGallery()]);
  return createPageMetadata(settings, {
    title: "Gallery",
    description: `Photos from ${settings.club_name} programmes — exhibitions, quizzes, inspire sessions, coding events and more.`,
    canonical: "/gallery",
    image: images[0]?.image_url,
  });
}

export default async function GalleryPage() {
  const [images, events] = await Promise.all([listGallery(), listEvents()]);

  // Categories come from both the known set and whatever the database actually uses.
  const categories = Array.from(
    new Set<string>([...GALLERY_CATEGORIES, ...images.map((i) => i.category)]),
  );
  const eventOptions = events.map((e) => ({ id: e.id, title: e.title }));

  return (
    <>
      <PageHeader
        eyebrow="Moments from the club"
        title="Gallery"
        description="Photographs from our exhibitions, quizzes, talks and build events — published by the club committee."
      />
      <section className="w-full py-14 sm:py-16">
        <div className="container-page">
          <GalleryGrid images={images} categories={categories} events={eventOptions} />
        </div>
      </section>
    </>
  );
}
