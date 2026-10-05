"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 text-balance text-3xl sm:text-4xl">We couldn&apos;t load this page.</h1>
      <p className="mt-3 max-w-md text-pretty text-muted">
        This is usually temporary. Try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link href="/" className="btn-ghost">
          Back to KSC
        </Link>
      </div>
    </div>
  );
}
