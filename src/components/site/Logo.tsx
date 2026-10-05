import Image from "next/image";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <ellipse
        cx="24"
        cy="24"
        rx="20"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(-28 24 24)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="20"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.55"
        transform="rotate(38 24 24)"
      />
      <circle cx="24" cy="24" r="4.5" fill="currentColor" />
      <circle cx="41" cy="17" r="2.4" className="fill-amber" />
    </svg>
  );
}

export function Logo({
  clubName,
  logoUrl,
  className = "",
}: {
  clubName: string;
  logoUrl?: string;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-teal">
        {logoUrl ? (
          <Image src={logoUrl} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
        ) : (
          <LogoMark />
        )}
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-medium tracking-tight text-ink">
          {clubName}
        </span>
        <span className="mt-0.5 text-[0.62rem] uppercase tracking-[0.2em] text-faint">
          Kanti Secondary School · Butwal
        </span>
      </span>
    </span>
  );
}
