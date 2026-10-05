"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  destructive = true,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? "confirm-desc" : undefined}
        className="relative z-10 w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-lift"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              destructive ? "bg-danger/12 text-danger" : "bg-teal/12 text-teal"
            }`}
          >
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="confirm-title" className="font-display text-lg">
              {title}
            </h2>
            {description && (
              <p id="confirm-desc" className="mt-2 text-sm leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={
              destructive
                ? "btn bg-danger text-white hover:opacity-90"
                : "btn-primary"
            }
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
