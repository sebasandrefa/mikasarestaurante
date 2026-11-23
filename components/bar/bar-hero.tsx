"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { withBasePath } from "@/lib/i18n";
import { EASE } from "@/lib/motion";

export type BarHeroPhoto = { src: string; alt: string };

/**
 * Entrada do /bar — "Depois do ocaso".
 * A página abre num âmbar de pôr do sol que se põe atrás de uma linha de horizonte dourada
 * e baixa para a luz do bar; o título aparece e as três fotos reais sobem em tríptico.
 */
export function BarHero({ eyebrow, title, intro, line, photos }: { eyebrow: string; title: string; intro: string; line: string; photos: BarHeroPhoto[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const lift = [useTransform(p, [0, 1], ["0%", "-10%"]), useTransform(p, [0, 1], ["0%", "-22%"]), useTransform(p, [0, 1], ["0%", "-14%"])];

  return (
    <section ref={ref} className="relative isolate overflow-hidden pb-16 pt-[calc(var(--header-h)+clamp(3rem,8vh,6rem))] md:pb-24">
      {/* o sol se põe: o brilho âmbar desce atrás do horizonte e a luz baixa */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[120%]"
        initial={{ opacity: 1, y: "-6%" }}
        animate={{ opacity: 0.55, y: "18%" }}
        transition={{ duration: 2.6, ease: EASE }}
        style={{ background: "radial-gradient(70% 45% at 50% 38%, rgba(214,120,48,0.42), rgba(168,50,42,0.16) 42%, rgba(10,10,11,0) 72%)" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-sumi"
        initial={{ opacity: 0.15 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2.6, ease: EASE }}
      />

      <div className="mx-auto max-w-[100rem] px-[var(--spacing-gutter)] text-center">
        <motion.p className="mk-eyebrow" initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 1, ease: EASE, delay: 0.3 }}>
          {eyebrow}
        </motion.p>
        <motion.h1
          className="mx-auto mt-6 max-w-[16ch] font-display text-display-xl font-light leading-[0.95] text-washi"
          initial={{ opacity: 0, filter: "blur(16px)", y: 24 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.5 }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mt-5 font-display text-xl italic text-ouro-claro md:text-2xl"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.9 }}
        >
          {line}
        </motion.p>
        {/* horizonte dourado */}
        <motion.span
          aria-hidden
          className="mx-auto mt-10 block h-px w-full max-w-3xl origin-center bg-gradient-to-r from-transparent via-ouro to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.6 }}
        />
        <motion.p
          className="mx-auto mt-8 max-w-[52ch] text-[0.95rem] leading-relaxed text-washi-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 1.1 }}
        >
          {intro}
        </motion.p>
      </div>

      {/* tríptico: as três fotos reais sobem de trás de uma máscara */}
      <div className="mx-auto mt-14 grid max-w-[78rem] grid-cols-3 items-end gap-3 px-[var(--spacing-gutter)] sm:gap-5 md:mt-20 md:gap-8">
        {photos.slice(0, 3).map((ph, i) => (
          <motion.div key={ph.src} style={{ y: lift[i] }} className={i === 1 ? "md:-mb-10" : undefined}>
            <motion.div
              className="relative aspect-[3/4] overflow-hidden border border-line bg-carvao"
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 1.4, ease: EASE, delay: 1.2 + i * 0.15 }}
            >
              <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE, delay: 1.2 + i * 0.15 }}>
                <Image src={withBasePath(ph.src)} alt={ph.alt} fill priority={i === 1} sizes="(min-width:768px) 26vw, 32vw" className="object-cover" />
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
