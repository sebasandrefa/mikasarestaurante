"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { MediaFrame } from "@/components/media/media-frame";
import { BrushKanji } from "@/components/motion/brush-kanji";
import { Reveal } from "@/components/motion/reveal";
import { SmartLink } from "@/components/layout/smart-link";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { localePath, type Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import type { OmakaseFeature as Feature } from "@/lib/omakase";
import { homeAnchor, sectionIds } from "@/lib/nav";

/**
 * CENA 4 — Omakase em capítulos.
 * Cada destaque é um cartão que gruda no topo; o seguinte sobe por cima dele
 * e o de baixo recua (diminui e escurece) — um jantar servido em etapas.
 * Os destaques chegam prontos do servidor (o menu completo não vai para o navegador).
 */
export function Omakase({ lang, features }: { lang: Locale; features: Feature[] }) {
  const c = getCopy(lang);
  const stack = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stack, offset: ["start start", "end end"] });
  const n = features.length;

  return (
    <section id={sectionIds.omakase} aria-label={c.omakase.eyebrow} className="relative bg-sumi py-[var(--spacing-section)]">
      <div className="mx-auto grid max-w-[100rem] gap-10 px-[var(--spacing-gutter)] lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-7">
          <BrushKanji char="匠" className="mb-6 size-20 opacity-90 xl:size-24" />
          <div className="mb-7 flex items-center gap-4">
            <span aria-hidden className="h-px w-10 bg-ouro/70" />
            <span className="mk-eyebrow">{c.omakase.eyebrow}</span>
            <span aria-hidden className="font-jp text-sm text-ouro/60">匠</span>
          </div>
          <h2 className="font-display text-display-lg font-light text-washi">{c.omakase.title}</h2>
        </Reveal>
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15}>
          <p className="max-w-[36ch] text-[0.95rem] leading-relaxed text-washi-dim">{c.omakase.intro}</p>
          <Button asChild variant="outline" className="mt-8">
            <SmartLink href={homeAnchor(lang, sectionIds.reservation)}>{c.omakase.reserve}</SmartLink>
          </Button>
        </Reveal>
      </div>

      <div ref={stack} className="mx-auto mt-16 max-w-[100rem] px-[var(--spacing-gutter)] md:mt-24">
        {features.map((item, i) => (
          <Chapter key={item.id} item={item} index={i} total={n} progress={scrollYProgress} lang={lang} />
        ))}
      </div>
    </section>
  );
}

function Chapter({ item, index, total, progress, lang }: { item: Feature; index: number; total: number; progress: MotionValue<number>; lang: Locale }) {
  const c = getCopy(lang);
  // a partir do momento em que gruda, recua um pouco a cada cartão que chega por cima
  const depth = total - 1 - index;
  const scale = useTransform(progress, [index / total, 1], [1, 1 - depth * 0.045]);
  const shade = useTransform(progress, [index / total, 1], [0, depth * 0.2]);
  const href = `${localePath(lang, "/menu")}#${item.id === "hamachi-collection" ? "hamachi-collection" : "omakase-experience"}`;

  return (
    <div className="sticky mb-[8vh] last:mb-0" style={{ top: `calc(var(--header-h, 5rem) + ${index * 0.9}rem)` }}>
      <motion.article
        style={{ scale }}
        initial={{ clipPath: "inset(42% 0% 42% 0%)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 1.2, ease: EASE }}
        className="relative grid h-[min(80svh,46rem)] origin-top grid-rows-[1fr_auto] overflow-hidden border border-line bg-carvao md:grid-cols-[1.35fr_1fr] md:grid-rows-1"
      >
        <Link href={href} data-cursor={c.cursor.view} className="group relative block min-h-0 overflow-hidden">
          <div className="size-full scale-100 will-change-transform backface-hidden transition-transform duration-[1400ms] ease-[var(--ease-mikasa)] group-hover:scale-[1.04]">
            <MediaFrame asset={item.imagem} lang={lang} kanji="匠" sizes="(min-width:768px) 58vw, 92vw" />
          </div>
        </Link>
        <div className="flex flex-col justify-end gap-3 p-6 md:p-10 xl:p-14">
          <span aria-hidden className="font-display text-[clamp(2.5rem,1.5rem+3vw,4.5rem)] font-light leading-none text-ouro/45 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-display-md text-washi">{item.nome}</h3>
          {item.componentes?.length ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {item.componentes.map((p) => (
                <li key={p} className="font-display text-lg italic text-ouro-claro">
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="line-clamp-3 max-w-[40ch] text-sm leading-relaxed text-washi-dim md:line-clamp-none">
            {item.descricao ?? <span className="text-washi-mute">{c.menuPage.pendingDescription}</span>}
          </p>
          <p className="mt-1 flex items-baseline gap-4 font-sans text-[0.7rem] uppercase tracking-[0.24em] text-washi-mute">
            {item.porcao ? <span>{item.porcao}</span> : null}
            <span className="font-display text-xl normal-case tracking-normal text-ouro">{item.price ?? c.menuPage.pendingPrice}</span>
          </p>
        </div>
        {/* o cartão de baixo escurece quando o próximo sobe */}
        <motion.div aria-hidden style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-sumi" />
      </motion.article>
    </div>
  );
}
