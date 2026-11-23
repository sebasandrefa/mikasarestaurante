"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "motion/react";
import { useFrameSequence } from "@/components/media/use-frame-sequence";
import { barPour } from "@/data/media";
import { withBasePath } from "@/lib/i18n";
import { EASE } from "@/lib/motion";

export type BarHeroPhoto = { src: string; alt: string };

/**
 * Entrada do /bar — "Depois do ocaso".
 * Abre num âmbar de pôr do sol que baixa para a luz do bar; o whisky é servido sozinho sobre
 * a esfera de gelo, em câmera lenta, para frente e para trás, só enquanto a cena está na tela
 * (vídeo `data/media.ts` → barPour).
 * Em seguida, as três fotos reais do bar sobem em tríptico.
 */
export function BarHero({ eyebrow, title, intro, line, photos }: { eyebrow: string; title: string; intro: string; line: string; photos: BarHeroPhoto[] }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useFrameSequence({ seq: barPour, box, canvas, duration: 12, anchorX: 0.42, anchorY: 0.7, eager: true });

  return (
    <>
      <div ref={box} className="relative">
        <div className="relative h-[100svh] min-h-[36rem] overflow-hidden bg-sumi">
          {/* o whisky (aparece quando o "sol" se põe) */}
          <motion.canvas
            ref={canvas}
            aria-hidden
            className="absolute inset-0 size-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.4, ease: EASE, delay: 0.3 }}
          />
          {/* ocaso: o âmbar desce atrás do horizonte e some */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 1, y: "-4%" }}
            animate={{ opacity: 0, y: "22%" }}
            transition={{ duration: 2.8, ease: EASE }}
            style={{ background: "radial-gradient(70% 50% at 50% 40%, rgba(214,120,48,0.55), rgba(168,50,42,0.2) 45%, rgba(10,10,11,1) 78%)" }}
          />
          {/* leitura do texto: escurece o lado do título (direita no PC, topo no celular) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.9)_0%,rgba(10,10,11,0.55)_32%,transparent_55%)] md:bg-[linear-gradient(270deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.6)_34%,transparent_58%)]" />

          <div
            className="relative z-10 mx-auto flex h-full max-w-[100rem] flex-col items-center px-[var(--spacing-gutter)] pt-[calc(var(--header-h)+2.5rem)] text-center md:items-end md:justify-center md:pt-0 md:text-right"
          >
            <div className="md:max-w-[min(34rem,40vw)]">
              <motion.p className="mk-eyebrow" initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 1, ease: EASE, delay: 0.4 }}>
                {eyebrow}
              </motion.p>
              <motion.h1
                className="mt-5 font-display text-display-xl font-light leading-[0.95] text-washi md:text-[clamp(2.75rem,1rem+3.6vw,5.25rem)]"
                initial={{ opacity: 0, filter: "blur(16px)", y: 24 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.6 }}
              >
                {title}
              </motion.h1>
              <motion.p
                className="mt-4 font-display text-xl italic text-ouro-claro md:text-2xl"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: EASE, delay: 1 }}
              >
                {line}
              </motion.p>
              <motion.span
                aria-hidden
                className="mx-auto mt-7 block h-px w-40 origin-center bg-gradient-to-r from-transparent via-ouro to-transparent md:mr-0 md:origin-right md:bg-gradient-to-l md:from-ouro md:via-ouro/60"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, ease: EASE, delay: 1.1 }}
              />
              <motion.p
                className="mx-auto mt-6 hidden max-w-[44ch] text-[0.95rem] leading-relaxed text-washi-dim md:mr-0 md:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: EASE, delay: 1.3 }}
              >
                {intro}
              </motion.p>
            </div>
          </div>

          {/* passagem suave para o tríptico */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-sumi to-transparent" />
        </div>
      </div>

      {/* tríptico: as três fotos reais do bar sobem de trás de uma máscara */}
      <section className="pb-16 md:pb-24">
        <p className="mx-auto max-w-[44ch] px-[var(--spacing-gutter)] text-center text-[0.95rem] leading-relaxed text-washi-dim md:hidden">{intro}</p>
        <div className="mx-auto mt-10 grid max-w-[78rem] grid-cols-3 items-end gap-3 px-[var(--spacing-gutter)] sm:gap-5 md:mt-0 md:gap-8">
          {photos.slice(0, 3).map((ph, i) => (
            <motion.div
              key={ph.src}
              className={i === 1 ? "md:-mb-10" : undefined}
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1.4, ease: EASE, delay: i * 0.15 }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-carvao">
                <Image src={withBasePath(ph.src)} alt={ph.alt} fill sizes="(min-width:768px) 26vw, 32vw" className="object-cover" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
