"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useScrollTo } from "@/components/providers/smooth-scroll";
import { withBasePath } from "@/lib/i18n";
import { EASE } from "@/lib/motion";

export type HeroDish = { src: string; alt: string };
export type IndexEntry = { id: string; name: string; count: string };

/** Tratamento único de cor: fotos de sessões diferentes parecem da mesma (mais escuras, contraste suave). */
export const PHOTO_GRADE = "saturate(0.88) contrast(1.06) brightness(0.9)";

/**
 * Entrada da carta, versão contida: um prato por vez em tela cheia, escurecido,
 * trocando devagar atrás do título — e, logo abaixo, o índice só em tipografia,
 * como o cardápio impresso de um restaurante estrelado.
 */
export function MenuHero({ eyebrow, title, intro, dishes }: { eyebrow: string; title: string; intro: string; dishes: HeroDish[] }) {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoO = useTransform(p, [0, 0.8], [1, 0]);
  const photoS = useTransform(p, [0, 1], [1, 1.08]);
  const textY = useTransform(p, [0, 1], ["0vh", "-12vh"]);
  const textO = useTransform(p, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (dishes.length < 2) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % dishes.length), 5200);
    return () => window.clearInterval(id);
  }, [dishes.length]);

  return (
    <section ref={ref} className="relative h-[100svh] overflow-hidden bg-sumi">
      <motion.div aria-hidden style={{ opacity: photoO, scale: photoS }} className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={dishes[i]?.src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          >
            <motion.div className="absolute inset-0" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 7, ease: "linear" }}>
              {dishes[i] ? (
                <Image src={withBasePath(dishes[i].src)} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" style={{ filter: PHOTO_GRADE }} />
              ) : null}
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {/* escurece e apaga as bordas: o título manda */}
        <div className="absolute inset-0 bg-sumi/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,11,0.85)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-sumi to-transparent" />
      </motion.div>

      <motion.div style={{ y: textY, opacity: textO }} className="relative z-10 flex h-full flex-col items-center justify-center px-[var(--spacing-gutter)] text-center">
        <motion.p className="mk-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}>
          {eyebrow}
        </motion.p>
        <motion.h1
          className="mt-7 font-display text-[clamp(4rem,2.5rem+8vw,10rem)] font-light leading-[0.9] tracking-[-0.01em] text-washi"
          initial={{ opacity: 0, filter: "blur(14px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.35 }}
        >
          {title}
        </motion.h1>
        <motion.span
          aria-hidden
          className="mt-9 block h-px w-24 origin-center bg-ouro/80"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.9 }}
        />
        <motion.p
          className="mt-8 max-w-[40ch] text-[0.95rem] leading-relaxed text-washi-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE, delay: 1.1 }}
        >
          {intro}
        </motion.p>
      </motion.div>
    </section>
  );
}

/** Índice tipográfico dos capítulos, centralizado — clicar desliza até o capítulo. */
export function MenuIndex({ label, entries }: { label: string; entries: IndexEntry[] }) {
  const scrollTo = useScrollTo();
  return (
    <nav aria-label={label} className="mx-auto max-w-3xl px-[var(--spacing-gutter)] pb-20 pt-6 md:pb-28">
      <motion.p
        className="mk-eyebrow text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        {label}
      </motion.p>
      <ol className="mt-10 border-t border-line">
        {entries.map((e, n) => (
          <motion.li
            key={e.id}
            className="border-b border-line"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -6% 0px" }}
            transition={{ duration: 1, ease: EASE, delay: n * 0.06 }}
          >
            <a
              href={`#${e.id}`}
              onClick={(ev) => {
                const el = document.getElementById(e.id);
                if (!el) return;
                ev.preventDefault();
                scrollTo(el, -140);
              }}
              className="group flex items-baseline gap-5 py-4 md:gap-8 md:py-5"
            >
              <span className="w-8 shrink-0 font-sans text-[0.62rem] tracking-[0.3em] text-washi-mute tabular-nums">{String(n + 1).padStart(2, "0")}</span>
              <span className="font-display text-[clamp(1.4rem,1.1rem+1.2vw,2.3rem)] font-light leading-tight text-washi transition-colors duration-700 group-hover:text-ouro-claro">
                {e.name}
              </span>
              <span aria-hidden className="mk-leader opacity-60" />
              <span className="shrink-0 font-sans text-[0.6rem] uppercase tracking-[0.26em] text-washi-mute">{e.count}</span>
            </a>
          </motion.li>
        ))}
      </ol>
    </nav>
  );
}
