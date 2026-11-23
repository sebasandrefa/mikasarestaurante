"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Embers } from "@/components/effects/embers";
import { robataFire } from "@/data/media";
import { useFrameSequence } from "@/components/media/use-frame-sequence";

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
  const { scrollYProgress: p } = useScroll({ target: box, offset: ["start start", "end end"] });
  useFrameSequence({ seq: robataFire, box, canvas, progress: p, from: SEQ_FROM, to: SEQ_TO, anchorY: 0.62 });

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
