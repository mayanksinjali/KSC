import { PageTitle } from "@/components/admin/PageTitle";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { listEvents, listGallery } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const [images, events] = await Promise.all([listGallery(), listEvents()]);

  return (
    <>
      <PageTitle
        title="Gallery"
        description="Upload photos from club programmes. Captions and alt text are required for every image."
        breadcrumb={[{ href: "/admin/gallery", label: "Gallery" }]}
      />
      <GalleryManager
        images={images}
        events={events.map((e) => ({ id: e.id, title: e.title }))}
      />
    </>
  );
}
