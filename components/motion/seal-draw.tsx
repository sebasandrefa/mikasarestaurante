"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Selo dourado que se desenha com um traço de 1px ao entrar na tela (o conteúdo vai no centro). */
export function SealDraw({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <div ref={ref} className={cn("relative grid place-items-center", className)}>
      <svg aria-hidden viewBox="0 0 200 200" className="absolute inset-0 size-full -rotate-90">
        <motion.circle
          cx="100"
          cy="100"
          r="98"
          fill="none"
          stroke="var(--color-ouro)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : undefined}
          transition={{ duration: 2, ease: EASE }}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="var(--color-ouro)"
          strokeOpacity="0.35"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : undefined}
          transition={{ duration: 2.2, delay: 0.25, ease: EASE }}
        />
      </svg>
      {children}
    </div>
  );
}
