"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A quiet science motif: an electron-style orbit system with drifting nuclei.
 * Purely decorative, so it is aria-hidden and fully disabled for reduced motion.
 */
export function HeroOrbit() {
  const reduce = useReducedMotion();

  const rings = [
    { size: 320, duration: 46, dash: "2 10" },
    { size: 460, duration: 68, dash: "1 14" },
    { size: 600, duration: 92, dash: "1 20" },
  ];

  const dots = [
    { r: 160, dur: 18, delay: 0 },
    { r: 230, dur: 26, delay: 3 },
    { r: 300, dur: 34, delay: 6 },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      {/* soft atmospheric wash */}
      <div className="absolute h-[38rem] w-[38rem] rounded-full bg-teal/[0.07] blur-3xl dark:bg-teal/[0.13]" />
      <div className="absolute right-[8%] top-[12%] h-64 w-64 rounded-full bg-amber/[0.09] blur-3xl dark:bg-amber/[0.12]" />

      <div className="relative h-[620px] w-[620px] max-w-[140vw] max-h-[140vw] scale-75 opacity-90 sm:scale-90 lg:scale-100">
        {rings.map((ring) => (
          <div
            key={ring.size}
            className="absolute left-1/2 top-1/2 rounded-full border border-teal/20 dark:border-teal/25"
            style={{
              width: ring.size,
              height: ring.size,
              marginLeft: -ring.size / 2,
              marginTop: -ring.size / 2,
            }}
          />
        ))}

        {/* dashed rotating orbit */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: "1px dashed rgb(var(--teal) / 0.35)" }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />

        {/* central nucleus */}
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-amber/40"
              animate={reduce ? undefined : { scale: [1, 1.35], opacity: [0.6, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
            />
          ))}
          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-teal to-forest shadow-lift" />
        </div>

        {/* orbiting particles */}
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: dot.dur, repeat: Infinity, ease: "linear", delay: dot.delay }}
            style={{ transformOrigin: "0 0" }}
          >
            <span
              className="absolute h-2.5 w-2.5 rounded-full bg-amber"
              style={{ transform: `translateX(${dot.r}px) translateY(-50%)` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
