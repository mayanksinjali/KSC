import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="text-teal">
        <LogoMark className="h-16 w-16" />
      </span>
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="mt-4 text-balance text-4xl leading-tight sm:text-5xl">Lost in the lab?</h1>
      <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted">
        The page you were looking for isn&apos;t here. It may have been moved, or the link might be
        out of date.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to KSC
        </Link>
        <Link href="/events" className="btn-ghost">
          <Compass className="h-4 w-4" aria-hidden="true" />
          Browse events
        </Link>
      </div>
    </div>
  );
}
