"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { SceneVideo } from "@/components/media/scene-video";
import { MediaFrame } from "@/components/media/media-frame";
import { MaskReveal } from "@/components/motion/mask-reveal";
import { SplitText } from "@/components/motion/split-text";
import { SmartLink } from "@/components/layout/smart-link";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { placePhotos, placeVideo } from "@/data/media";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { homeAnchor, sectionIds } from "@/lib/nav";

/**
 * "El lugar" — a terraza de verdade (vídeo real do restaurante, `data/media.ts` → placeVideo).
 * O vídeo toca sozinho, devagar, só com a cena na tela; ao sair, volta ao início.
 * Embaixo, três quadros do mesmo vídeo.
 */
export function ThePlace({ lang }: { lang: Locale }) {
  const c = getCopy(lang).place;
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { amount: 0.35 });
  const strip = [placePhotos.terraza, placePhotos.mesa, placePhotos.letrero];

  return (
    <section aria-label={c.eyebrow} className="relative bg-sumi">
      <div ref={box} data-scene="the-place" className="relative h-[100svh] min-h-[36rem] overflow-hidden">
        <SceneVideo video={placeVideo} box={box} />
        {/* o vídeo entra saindo do escuro (véu por cima: o iPhone não toca vídeo invisível) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-sumi"
          initial={{ opacity: 1 }}
          animate={{ opacity: seen ? 0 : 1 }}
          transition={seen ? { duration: 1.8, ease: EASE, delay: 0.2 } : { duration: 0 }}
        />
        {/* leitura do texto: escurece embaixo e à esquerda */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.45)_38%,transparent_62%),linear-gradient(90deg,rgba(10,10,11,0.55)_0%,transparent_55%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sumi to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-end px-[var(--spacing-gutter)] pb-[clamp(4rem,10vh,7rem)]">
          <motion.p
            className="mk-eyebrow mb-6 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: seen ? 1 : 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: seen ? 0.6 : 0 }}
          >
            <span aria-hidden className="h-px w-10 bg-ouro" />
            {c.eyebrow}
          </motion.p>
          <SplitText as="h2" text={c.title} inView delay={0.8} className="max-w-[16ch] font-display text-display-lg font-light leading-[1.02] text-washi" />
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 1.2, ease: EASE, delay: seen ? 1.6 : 0 }}
          >
            <Button asChild size="lg">
              <SmartLink href={homeAnchor(lang, sectionIds.reservation)}>{c.cta}</SmartLink>
            </Button>
            <span className="font-sans text-[0.7rem] uppercase tracking-[0.28em] text-washi-dim">{site.address.full}</span>
          </motion.div>
        </div>
      </div>

      {/* três quadros do mesmo vídeo */}
      <ul className="mx-auto grid max-w-[100rem] grid-cols-1 gap-4 px-[var(--spacing-gutter)] pb-[var(--spacing-section)] pt-6 sm:grid-cols-3 lg:gap-6">
        {strip.map((asset, i) => (
          <li key={asset.id}>
            <MaskReveal className="relative aspect-[16/10] w-full" delay={i * 0.1}>
              <MediaFrame asset={asset} lang={lang} sizes="(min-width:640px) 33vw, 100vw" />
            </MaskReveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
