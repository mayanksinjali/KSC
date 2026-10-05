"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function HeroOrbit() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <Image
        src="/kanti-science-club-emblem.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-[#0b1526]/15 to-[#0b1526]/95 lg:block" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b1526]/35 lg:hidden" />

      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-[34%] top-1/2 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 lg:w-[min(48vw,44rem)]">
          <motion.div
            className="absolute inset-0 rounded-full border border-teal/35"
            style={{ rotateX: 68, rotateZ: -18, transformStyle: "preserve-3d" }}
            animate={reduce ? undefined : { rotateZ: [-18, 342] }}
            transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber shadow-[0_0_24px_rgb(var(--amber)/0.8)] sm:h-3 sm:w-3" />
          </motion.div>
        </div>
        <div className="absolute left-[34%] top-1/2 aspect-square w-[54%] -translate-x-1/2 -translate-y-1/2 lg:w-[min(39vw,35rem)]">
          <motion.div
            className="absolute inset-0 rounded-full border border-dashed border-amber/40"
            style={{ rotateX: 72, rotateZ: 32, transformStyle: "preserve-3d" }}
            animate={reduce ? undefined : { rotateZ: [32, -328] }}
            transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute right-[14%] top-[12%] h-2 w-2 rounded-full bg-teal shadow-[0_0_20px_rgb(var(--teal)/0.8)] sm:h-2.5 sm:w-2.5" />
          </motion.div>
        </div>
        <div className="absolute left-[34%] top-1/2 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 lg:w-[min(29vw,26rem)]" />
      </div>
    </div>
  );
}
