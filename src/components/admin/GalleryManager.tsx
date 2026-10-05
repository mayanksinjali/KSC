"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Info,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/admin/Toast";
import { STORAGE_BUCKETS, prepareImage, uploadImage } from "@/lib/upload";
import { deleteGalleryImage, saveGalleryImage } from "@/app/admin/actions";
import { GALLERY_CATEGORIES } from "@/lib/seed";
import type { EventRecord, GalleryImage } from "@/lib/types";

interface Draft {
  key: string;
  previewUrl: string;
  file: File;
  caption: string;
  alt_text: string;
  category: string;
  event_id: string;
  uploading: boolean;
  uploaded: boolean;
}

export function GalleryManager({
  images,
  events,
}: {
  images: GalleryImage[];
  events: Pick<EventRecord, "id" | "title">[];
}) {
  const { push } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState(images);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const categories = Array.from(new Set<string>([...GALLERY_CATEGORIES, ...images.map((i) => i.category)]));

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((img) => {
      if (categoryFilter !== "all" && img.category !== categoryFilter) return false;
      if (!term) return true;
      return img.caption.toLowerCase().includes(term) || img.alt_text.toLowerCase().includes(term);
    });
  }, [rows, query, categoryFilter]);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    for (const file of list) {
      try {
        const prepared = await prepareImage(file);
        setDrafts((prev) => [
          ...prev,
          {
            key: crypto.randomUUID(),
            previewUrl: prepared.previewUrl,
            file: prepared.file,
            caption: "",
            alt_text: "",
            category: categoryFilter === "all" ? GALLERY_CATEGORIES[0] : categoryFilter,
            event_id: "",
            uploading: false,
            uploaded: false,
          },
        ]);
      } catch (err) {
        push(err instanceof Error ? err.message : "Could not process that image.", "error");
      }
    }
  }

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function moveDraft(key: string, direction: -1 | 1) {
    setDrafts((prev) => {
      const index = prev.findIndex((draft) => draft.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function uploadAll() {
    const pending = drafts.filter((d) => !d.uploaded);
    if (pending.length === 0) return;
    const invalid = pending.find(
      (d) => d.caption.trim().length < 3 || d.alt_text.trim().length < 3 || !d.category,
    );
    if (invalid) {
      push("Every photo needs a caption and alt text before uploading.", "error");
      return;
    }

    setBusy(true);
    let uploaded = 0;
    let failed = 0;
    for (const draft of pending) {
      updateDraft(draft.key, { uploading: true });
      try {
        const url = await uploadImage(draft.file, STORAGE_BUCKETS.galleryImages);
        const result = await saveGalleryImage({
          image_url: url,
          caption: draft.caption,
          alt_text: draft.alt_text,
          category: draft.category,
          event_id: draft.event_id,
        });
        if (!result.ok) {
          push(result.error, "error");
          updateDraft(draft.key, { uploading: false });
          failed += 1;
          continue;
        }
        updateDraft(draft.key, { uploading: false, uploaded: true });
        uploaded += 1;
      } catch (err) {
        push(err instanceof Error ? err.message : "Upload failed.", "error");
        updateDraft(draft.key, { uploading: false });
        failed += 1;
      }
    }
    setBusy(false);
    if (failed > 0) {
      push(`${uploaded} photo(s) uploaded; ${failed} failed. Fix the failed items and try again.`, "error");
      return;
    }
    push(`${uploaded} photo(s) uploaded.`, "success");
    window.location.reload();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteGalleryImage(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setRows((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    push("Photo removed.", "success");
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="card-surface mb-6 p-5">
        <div className="flex items-start gap-3 rounded-soft bg-amber/[0.08] p-3 text-xs text-amber">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p>
            Only upload photos that the school/club has approved for public posting, especially when
            students/minors are visible.
          </p>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void addFiles(e.dataTransfer.files);
          }}
          className="mt-4 flex flex-col items-center justify-center rounded-soft border border-dashed border-line bg-surface/60 p-8 text-center"
        >
          <UploadCloud className="h-7 w-7 text-teal" aria-hidden="true" />
          <button
            type="button"
            className="mt-3 text-sm font-medium text-teal underline underline-offset-4"
            onClick={() => inputRef.current?.click()}
          >
            Select photos
          </button>
          <p className="mt-1 text-xs text-faint">
            Drag and drop multiple files. Each is resized and converted to WebP automatically.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => void addFiles(e.target.files)}
          />
        </div>

        {drafts.length > 0 && (
          <div className="mt-5 space-y-3">
            <datalist id="gallery-category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            {drafts.map((draft, index) => (
              <div
                key={draft.key}
                className="grid gap-4 rounded-soft border border-line bg-surface p-3.5 sm:grid-cols-[7rem_1fr]"
              >
                <div className="relative h-24 w-full overflow-hidden rounded-soft bg-paper-2 sm:h-full">
                  <Image src={draft.previewUrl} alt="" fill sizes="120px" className="object-cover" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex justify-end gap-1 sm:col-span-2">
                    <button
                      type="button"
                      aria-label={`Move ${draft.file.name} up`}
                      title="Move up"
                      disabled={busy || draft.uploaded || index === 0}
                      onClick={() => moveDraft(draft.key, -1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${draft.file.name} down`}
                      title="Move down"
                      disabled={busy || draft.uploaded || index === drafts.length - 1}
                      onClick={() => moveDraft(draft.key, 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label text-xs" htmlFor={`cap-${draft.key}`}>
                      Caption (required)
                    </label>
                    <input
                      id={`cap-${draft.key}`}
                      className="field"
                      value={draft.caption}
                      disabled={draft.uploaded}
                      onChange={(e) => updateDraft(draft.key, { caption: e.target.value })}
                      placeholder="What is happening in this photo?"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label text-xs" htmlFor={`alt-${draft.key}`}>
                      Alt text (required)
                    </label>
                    <input
                      id={`alt-${draft.key}`}
                      className="field"
                      value={draft.alt_text}
                      disabled={draft.uploaded}
                      onChange={(e) => updateDraft(draft.key, { alt_text: e.target.value })}
                      placeholder="Describe the image for screen readers"
                    />
                  </div>
                  <div>
                    <label className="label text-xs" htmlFor={`cat-${draft.key}`}>
                      Category
                    </label>
                    <input
                      id={`cat-${draft.key}`}
                      className="field"
                      list="gallery-category-options"
                      value={draft.category}
                      disabled={draft.uploaded}
                      onChange={(e) => updateDraft(draft.key, { category: e.target.value })}
                      placeholder="Add or choose a category"
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <label className="label text-xs" htmlFor={`ev-${draft.key}`}>
                      Event (optional)
                    </label>
                    <select
                      id={`ev-${draft.key}`}
                      className="field"
                      value={draft.event_id}
                      disabled={draft.uploaded}
                      onChange={(e) => updateDraft(draft.key, { event_id: e.target.value })}
                    >
                      <option value="">No event</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={uploadAll} disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    Upload {drafts.filter((d) => !d.uploaded).length} photo(s)
                  </>
                )}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setDrafts([])} disabled={busy}>
                Clear queue
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <label htmlFor="gallery-admin-search" className="sr-only">
            Search photos
          </label>
          <input
            id="gallery-admin-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos…"
            className="field pl-9"
          />
        </div>
        <select
          aria-label="Filter by category"
          className="field sm:max-w-[12rem]"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ImagePlus}
          title="No photos yet."
          description="Upload the first photos from a club programme."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((image) => (
            <li key={image.id} className="group card-surface overflow-hidden">
              <div className="relative aspect-square bg-paper-2">
                <Image
                  src={image.image_url}
                  alt={image.alt_text}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setDeleteTarget(image)}
                  aria-label={`Delete photo: ${image.caption}`}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-xs text-muted">{image.caption}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-faint">
                  {image.category}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this gallery photo?"
        description={deleteTarget ? `"${deleteTarget.caption}" will be removed from the public gallery.` : ""}
        confirmLabel="Remove"
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
