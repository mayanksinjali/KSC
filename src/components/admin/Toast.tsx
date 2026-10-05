"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<{
  push: (message: string, kind?: ToastKind) => void;
}>({ push: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = { success: CheckCircle2, error: XCircle, info: Info } as const;
const styles: Record<ToastKind, string> = {
  success: "border-forest/30 text-forest",
  error: "border-danger/30 text-danger",
  info: "border-line text-ink",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[130] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.kind];
          return (
            <div
              key={toast.id}
              role={toast.kind === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-card border bg-surface p-3.5 shadow-lift",
                styles[toast.kind],
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-sm leading-relaxed text-ink">{toast.message}</p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-faint transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
