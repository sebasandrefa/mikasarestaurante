"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { Moon } from "@/components/effects/moon";
import { OffscreenPause } from "@/components/effects/offscreen-pause";
import { SakuraTree } from "@/components/effects/sakura";
import { MediaFrame } from "@/components/media/media-frame";
import { CircularText } from "@/components/motion/circular-text";
import { SplitText } from "@/components/motion/split-text";
import { SmartLink } from "@/components/layout/smart-link";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { media } from "@/data/media";
import { localePath, type Locale } from "@/lib/i18n";
import { EASE, useReducedMotion } from "@/lib/motion";
import { homeAnchor, sectionIds } from "@/lib/nav";
import { useIntroReady } from "@/lib/hooks/use-intro-ready";

export function Hero({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  // Entra no 1º quadro, com ou sem intro: se ela está tocando, o hero se monta já
  // por baixo dela (a abertura em fenda revela a página pronta) e o título conta
  // como visível desde o início (LCP). Não depende do fim da intro, para não
  // re-renderizar o hero justo no quadro em que ela começa a sair.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  // a lua desce mais devagar que a página ao rolar (profundidade)
  const moonScroll = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  // a lua nasce quando a intro sai (por baixo dela ninguém veria)
  const introDone = useIntroReady();

  // profundidade com o mouse (só computador): lua e árvore se deslocam em sentidos opostos
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18, mass: 0.8 });
  const sy = useSpring(py, { stiffness: 40, damping: 18, mass: 0.8 });
  const moonX = useTransform(sx, (v) => v * -26);
  const moonY = useTransform(sy, (v) => v * -18);
  const treeX = useTransform(sx, (v) => v * 12);
  const treeY = useTransform(sy, (v) => v * 8);
  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, px, py]);

  const asset = media.heroLoop.available ? media.heroLoop : media.heroPoster;

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.2, ease: EASE, delay },
  });

  return (
    <section ref={ref} id="inicio" aria-label="MIKASA" className="relative h-[100svh] min-h-[600px] overflow-hidden bg-sumi short:min-h-[340px]">
      {/* Mídia */}
      <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : y }}>
        <MediaFrame
          asset={asset}
          lang={lang}
          priority
          kenBurns
          sizes="100vw"
          hideLabel
        />

        {/* Luz ambiente — muito lenta, apenas atmosfera */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[38%] size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 animate-[drift_22s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(closest-side, rgba(198,161,91,0.10), transparent 70%)" }}
        />
      </motion.div>

      {/* Véus para legibilidade */}
      <div aria-hidden className="absolute inset-0 bg-sumi/35" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-sumi via-sumi/70 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sumi/80 to-transparent" />

      {/* Lua cheia dourada atrás da cerejeira: nasce devagar quando a intro sai */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ y: reduce ? 0 : moonScroll }}>
        <motion.div className="absolute right-[9vw] top-[calc(var(--header-h)+0.25rem)] sm:right-[12vw] sm:top-[calc(var(--header-h)+2rem)] lg:right-[11vw] lg:top-[17%] 2xl:right-[14vw]" style={{ x: moonX, y: moonY }}>
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 70 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 3.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <Moon className="w-[clamp(118px,34vw,150px)] sm:w-[clamp(200px,30vw,300px)] lg:w-[clamp(280px,22vw,440px)] [@media(max-width:639px)_and_(max-height:620px)]:w-[96px]" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Cerejeira à direita com pétalas caindo (acima dos véus e da lua, abaixo do texto).
          As pétalas só começam depois que a intro sai (ver SakuraTree). */}
      {/* sem parallax de scroll: acompanha o scroll nativo (parallax aqui fazia as pétalas tremerem) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* sobra de 16px nas bordas: o deslocamento com o mouse nunca mostra a borda da camada */}
        <motion.div className="absolute -inset-4" style={{ x: treeX, y: treeY }}>
          <SakuraTree className="top-[calc(var(--header-h)*0.6+1rem)] h-[46%] opacity-75 sm:h-[64%] sm:opacity-85 lg:h-[calc(100%-var(--header-h)*0.6)] lg:opacity-100" />
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: reduce ? 1 : fade }}
        className="relative mx-auto flex h-full max-w-[100rem] flex-col justify-end px-[var(--spacing-gutter)] pb-[clamp(5.5rem,12vh,9rem)] short:pb-8"
      >
        <motion.p className="mk-eyebrow mb-7 flex items-center gap-4 short:mb-3" {...fadeUp(0.05)}>
          <span aria-hidden className="h-px w-10 bg-ouro" />
          {c.hero.eyebrow}
        </motion.p>

        <SplitText
          as="h1"
          text={c.hero.headline}
          play={ready}
          delay={0.15}
          accentLast={2}
          accentClassName="mk-sheen pr-[0.08em] italic"
          className="max-w-[20ch] font-display text-display-xl font-light text-washi short:max-w-[24ch] short:text-[clamp(1.75rem,9vh,2.6rem)]"
        />

        <motion.p
          className="mt-6 max-w-[40ch] font-display text-[clamp(1.1rem,0.95rem+0.6vw,1.5rem)] italic text-ouro-claro/90 short:mt-2 short:text-base"
          {...fadeUp(0.75)}
        >
          {c.hero.subline}
        </motion.p>

        <motion.div className="mt-10 flex flex-wrap items-center gap-x-9 gap-y-5 short:mt-4" {...fadeUp(1)}>
          <Button asChild size="lg">
            <SmartLink href={homeAnchor(lang, sectionIds.reservation)}>{c.hero.primary}</SmartLink>
          </Button>
          <Button asChild variant="link" size="none">
            <SmartLink href={localePath(lang, "/menu")}>{c.hero.secondary}</SmartLink>
          </Button>
        </motion.div>
      </motion.div>

      {/* Selo Restaurant Guru (some em telas baixas, onde encostaria no título) */}
      <motion.div
        className="absolute left-[var(--spacing-gutter)] top-[calc(var(--header-h)+1.25rem)] z-10 text-ouro md:bottom-[clamp(5.5rem,12vh,9rem)] md:left-auto md:right-[var(--spacing-gutter)] md:top-auto [@media(max-height:500px)]:hidden [@media(max-width:767px)_and_(max-height:740px)]:hidden"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1.4, ease: EASE, delay: 1.1 }}
      >
        <CircularText
          text={c.hero.badge}
          label="Restaurant Guru 2023, 2024, 2025, 2026"
          className="size-24 md:size-36 lg:size-40"
          center={<span className="font-display text-lg italic text-ouro-claro md:text-2xl">IV</span>}
        />
      </motion.div>

      <OffscreenPause targetId="inicio" />

      {/* Indicador de scroll */}
      <div aria-hidden className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex short:!hidden">
        <span className="font-sans text-[0.58rem] uppercase tracking-[0.36em] text-washi-mute">{c.hero.scroll}</span>
        <span className="relative block h-12 w-px overflow-hidden bg-line">
          <span className="mk-scroll-line absolute inset-0 bg-ouro" />
        </span>
      </div>
    </section>
  );
}
