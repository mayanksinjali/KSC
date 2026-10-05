"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, Loader2, Trash2, UploadCloud } from "lucide-react";
import { prepareImage, uploadImage, type Bucket } from "@/lib/upload";

export function ImageUpload({
  value,
  onChange,
  bucket,
  label = "Image",
  hint,
  maxWidth = 1600,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket: Bucket;
  label?: string;
  hint?: string;
  maxWidth?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError("");
    setProgress(5);
    try {
      const prepared = await prepareImage(file, { maxWidth });
      setProgress(35);
      const url = await uploadImage(prepared.file, bucket, setProgress);
      onChange(url);
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setProgress(null);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>

      {value ? (
        <div className="flex items-center gap-4 rounded-soft border border-line bg-surface p-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-soft bg-paper-2">
            <Image src={value} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <p className="flex-1 truncate text-xs text-faint">{value}</p>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-danger hover:text-danger"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center rounded-soft border border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-teal bg-teal/5" : "border-line bg-surface/60"
          }`}
        >
          {progress !== null ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-teal" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted">Uploading… {progress}%</p>
              <div className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-teal transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-teal" aria-hidden="true" />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 text-sm font-medium text-teal underline underline-offset-4"
              >
                Choose an image
              </button>
              <p className="mt-1 text-xs text-faint">or drag and drop — JPG, PNG or WebP</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-faint">
                <ImageUp className="h-3.5 w-3.5" aria-hidden="true" />
                Resized and converted to WebP automatically
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
