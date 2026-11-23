"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { Embers } from "@/components/effects/embers";
import { robataFire } from "@/data/media";
import { withBasePath } from "@/lib/i18n";

/**
 * CENA 3 — "A brasa acorda" (protagonista).
 * A tela fica presa enquanto a rolagem acende o fogo da robata: uma faísca cai, a brasa
 * pega e a chama sobe — quadro a quadro de um vídeo (`data/media.ts` → robataFire),
 * escolhido pela posição da rolagem. O título "esquenta" do washi para a brasa.
 * No fim, a cena escurece e solta para o corte insignia, logo abaixo.
 */

/** faixa da rolagem (0–1) em que os quadros do vídeo andam */
const SEQ_FROM = 0.1;
const SEQ_TO = 0.86;

export function RobataFire({ eyebrow, title, tagline }: { eyebrow: string; title: string; tagline: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const draw = useRef<(p: number) => void>(() => {});
  const { scrollYProgress: p } = useScroll({ target: box, offset: ["start start", "end end"] });

  // quadros: carregados só quando a cena se aproxima (nada pesa no início da página)
  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    // celular em pé: recorte vertical do vídeo (bem mais leve)
    const portrait = window.matchMedia("(orientation: portrait) and (max-width: 900px)").matches;
    const dir = portrait ? robataFire.mobile : robataFire.desktop;
    const N = robataFire.frames;
    const imgs: (HTMLImageElement | null)[] = Array(N).fill(null);
    let last = -1;
    let want = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      last = -1;
      paint(want);
    };
    const paint = (f: number) => {
      // o quadro pedido, ou o mais próximo já carregado
      let i = f;
      while (i > 0 && !imgs[i]?.complete) i--;
      const im = imgs[i];
      if (!im?.complete || !im.naturalWidth || i === last) return;
      last = i;
      const W = cv.width;
      const H = cv.height;
      const k = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      const w = im.naturalWidth * k;
      const h = im.naturalHeight * k;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(im, (W - w) / 2, (H - h) * 0.62, w, h);
    };
    draw.current = (prog: number) => {
      want = Math.round(Math.min(1, Math.max(0, (prog - SEQ_FROM) / (SEQ_TO - SEQ_FROM))) * (N - 1));
      paint(want);
    };

    const load = (i: number) => {
      if (imgs[i]) return;
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        if (i <= want) {
          last = -1;
          paint(want);
        }
      };
      im.src = withBasePath(`${dir}/${String(i + 1).padStart(2, "0")}.webp`);
      imgs[i] = im;
    };
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      // 1 a cada 6 primeiro (a cena já funciona), depois o resto
      for (let i = 0; i < N; i += 6) load(i);
      const rest = () => {
        for (let i = 0; i < N; i++) load(i);
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(rest, { timeout: 1200 });
      else setTimeout(rest, 300);
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && start(), { rootMargin: "150% 0px" });
    io.observe(el);
    size();
    window.addEventListener("resize", size);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", size);
    };
  }, []);

  useMotionValueEvent(p, "change", (v) => draw.current(v));

  // faísca: cai do alto até a grelha e se apaga quando a brasa pega
  const sparkY = useTransform(p, [0, SEQ_FROM + 0.02], ["8vh", "64vh"]);
  const sparkO = useTransform(p, [0, 0.02, SEQ_FROM, SEQ_FROM + 0.04], [0, 1, 1, 0]);
  const sparkS = useTransform(p, [SEQ_FROM, SEQ_FROM + 0.04], [1, 4]);
  // vídeo acende; no fim a cena escurece (fumaça) e solta
  const fireO = useTransform(p, [SEQ_FROM, SEQ_FROM + 0.07], [0, 1]);
  const smoke = useTransform(p, [0.84, 1], [0, 0.92]);
  const titleY = useTransform(p, [0, 0.5], ["4vh", "-25vh"]);
  const titleO = useTransform(p, [0, 0.05, 0.88, 0.98], [0.35, 1, 1, 0]);

  const words = title.split(" ");

  return (
    <div ref={box} data-scene="robata-fire" className="relative h-[250vh] md:h-[340vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#050302]">
        <motion.canvas ref={canvas} aria-hidden style={{ opacity: fireO }} className="absolute inset-0 size-full" />
        {/* leitura do título sobre as chamas */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,3,2,0.85)_0%,rgba(5,3,2,0.35)_40%,transparent_62%,rgba(5,3,2,0.35)_100%)]" />
        <motion.div aria-hidden style={{ opacity: fireO }} className="absolute inset-0">
          <Embers count={30} />
        </motion.div>
        <motion.span
          aria-hidden
          style={{ y: sparkY, opacity: sparkO, scale: sparkS }}
          className="absolute left-1/2 top-0 -ml-1 size-2 rounded-full bg-[#ffd9a0] shadow-[0_0_14px_4px_rgba(255,170,90,0.75),0_0_42px_12px_rgba(217,119,43,0.35)]"
        />

        <motion.div style={{ y: titleY, opacity: titleO }} className="relative z-10 flex h-full flex-col items-center justify-center px-[var(--spacing-gutter)] text-center">
          <p className="mk-eyebrow">{eyebrow}</p>
          <h2 className="mt-6 font-display text-display-xl leading-[0.95] text-washi">
            <span className="sr-only">{title}</span>
            <span aria-hidden>
              {words.map((w, i) => (
                <span key={i}>
                  {i > 0 ? " " : null}
                  <HotWord word={w} p={p} at={0.22 + i * 0.07} />
                </span>
              ))}
            </span>
          </h2>
          <p className="mt-6 font-display text-xl italic text-ouro-claro md:text-2xl">{tagline}</p>
        </motion.div>

        <motion.div aria-hidden style={{ opacity: smoke }} className="pointer-events-none absolute inset-0 z-20 bg-[#0a0a0b]" />
      </div>
    </div>
  );
}

/** Palavra que "esquenta": washi → ouro claro → brasa, com brilho, quando a chama chega nela. */
function HotWord({ word, p, at }: { word: string; p: MotionValue<number>; at: number }) {
  const color = useTransform(p, [at, at + 0.06, at + 0.14], ["#efe9df", "#e6cf96", "#f0a25a"]);
  const glow = useTransform(p, [at, at + 0.14], ["0 0 0px rgba(240,140,60,0)", "0 0 34px rgba(240,140,60,0.55)"]);
  return (
    <motion.span style={{ color, textShadow: glow }} className="inline-block whitespace-nowrap">
      {word}
      {" "}
    </motion.span>
  );
}
