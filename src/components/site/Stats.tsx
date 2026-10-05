"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import type { SiteStats } from "@/lib/types";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function Stats({ stats }: { stats: SiteStats }) {
  const items = [
    { label: "Active members", value: stats.activeMembers },
    { label: "Events held", value: stats.eventsHeld },
    { label: "Years running", value: stats.yearsRunning },
  ].filter((item) => item.value > 0);

  // Never render an empty or fake statistics block.
  if (items.length === 0) return null;

  return (
    <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-6 py-8 sm:py-10">
          <dd className="font-display text-4xl text-teal sm:text-5xl">
            <Counter value={item.value} />
          </dd>
          <dt className="mt-2 text-sm uppercase tracking-[0.14em] text-faint">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}
