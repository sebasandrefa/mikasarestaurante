"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { GoldGradient } from "@/components/brand/logo";
import { LETTER_BOXES, letterId, WORDMARK_H, WORDMARK_VIEWBOX, WORDMARK_W } from "@/components/brand/logo-meta";
import { Fire } from "@/components/effects/fire";

function Letter({ i, progress }: { i: number; progress: MotionValue<number> }) {
  // cada letra entra numa janela própria do progresso → revelação letra a letra
  const start = i * 0.07;
  const end = start + 0.34;
  const y = useTransform(progress, [start, end], [WORDMARK_H * 1.05, 0], { clamp: true });
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1], { clamp: true });
  return (
    <motion.g style={{ y, opacity }}>
      <use href={`#${letterId(i)}`} />
    </motion.g>
  );
}

/**
 * CENA 11 — MIKASA em chamas.
 * As letras sobem de trás da linha de base e, chegando ao fim da página, o fogo
 * (o mesmo WebGL da intro) acende DENTRO delas, de baixo para cima.
 * Técnica: o canvas do fogo fica atrás; por cima, um véu Sumi com as letras
 * vazadas (máscara SVG) — só se vê fogo onde há letra.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const gid = useId();
  const clipId = useId();
  const maskId = useId();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const line = useTransform(scrollYProgress, [0, 0.5], [0, 1], { clamp: true });
  // o ouro cede lugar ao fogo no fim
  const gold = useTransform(scrollYProgress, [0.55, 1], [1, 0.22], { clamp: true });

  const intensity = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    intensity.current = Math.min(1.25, Math.max(0, (v - 0.5) / 0.5) * 1.25);
  });

  const letters = (p: MotionValue<number>) => LETTER_BOXES.map((_, i) => <Letter key={i} i={i} progress={p} />);

  return (
    <div ref={ref} aria-hidden className="relative mt-20 select-none">
      <div className="relative">
        {/* fogo atrás das letras — acende só no fim */}
        <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(70%_80%_at_50%_100%,rgba(120,40,14,0.55),rgba(10,10,11,1)_75%)]">
          <FireWhenNear intensity={intensity} />
        </div>
        <svg viewBox={WORDMARK_VIEWBOX} className="relative block w-full overflow-visible">
          <defs>
            <GoldGradient id={gid} />
            <clipPath id={clipId}>
              <rect x={-20} y={-WORDMARK_H} width={WORDMARK_W + 40} height={WORDMARK_H * 2} />
            </clipPath>
            <mask id={maskId} maskUnits="userSpaceOnUse" x={-200} y={-WORDMARK_H} width={WORDMARK_W + 400} height={WORDMARK_H * 3}>
              <rect x={-200} y={-WORDMARK_H} width={WORDMARK_W + 400} height={WORDMARK_H * 3} fill="#fff" />
              <g clipPath={`url(#${clipId})`} fill="#000">
                {letters(scrollYProgress)}
              </g>
            </mask>
          </defs>
          {/* véu Sumi com as letras vazadas */}
          <rect x={-200} y={-WORDMARK_H} width={WORDMARK_W + 400} height={WORDMARK_H * 3} fill="#0a0a0b" mask={`url(#${maskId})`} />
          {/* ouro por cima, que se apaga para o fogo aparecer */}
          <motion.g clipPath={`url(#${clipId})`} fill={`url(#${gid})`} style={{ opacity: gold }}>
            {letters(scrollYProgress)}
          </motion.g>
        </svg>
      </div>
      {/* linha de base vermelha que se estende do centro */}
      <motion.div className="mx-auto mt-6 h-px w-full origin-center bg-torii/70" style={{ scaleX: line }} />
    </div>
  );
}

/**
 * O WebGL só existe enquanto o rodapé está perto da tela: monta ao chegar, desmonta
 * ao sair (o laço do fogo para quando `activeRef` vira false e não recomeça sozinho).
 */
function FireWhenNear({ intensity }: { intensity: React.RefObject<number> }) {
  const box = useRef<HTMLDivElement>(null);
  const on = useRef(true);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "40% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="absolute inset-0">
      {near ? <Fire intensityRef={intensity} activeRef={on} scale={0.6} className="absolute inset-0" /> : null}
    </div>
  );
}
