"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Embers } from "@/components/effects/embers";
import { robataFire } from "@/data/media";
import { SceneVideo } from "@/components/media/scene-video";
import { EASE, useReducedMotion } from "@/lib/motion";

/**
 * CENA 3 — "A brasa acorda" (protagonista).
 * Quando a cena entra na tela, uma faísca cai, a brasa pega e a chama sobe; o título
 * "esquenta" do washi para a brasa, palavra por palavra. Depois o fogo segue sozinho,
 * em câmera lenta, para frente e para trás (vídeo `data/media.ts` → robataFire) —
 * só enquanto a cena está na tela. Ao sair, tudo volta ao início.
 */

/** quando a faísca chega à grelha e o fogo acende (s) */
const IGNITE = 1.1;

export function RobataFire({ eyebrow, title, tagline }: { eyebrow: string; title: string; tagline: string }) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // sem "once": ao sair e voltar, a cena acende de novo desde o início
  const lit = useInView(box, { amount: 0.35 });

  const words = title.split(" ");
  const on = lit || reduce;

  return (
    <div ref={box} data-scene="robata-fire" className="relative h-[100svh] min-h-[36rem] overflow-hidden bg-[#050302]">
      {/* o vídeo fica sempre visível (o iPhone não toca vídeo com opacity 0); quem "acende" o fogo
          é o véu escuro por cima, que se apaga quando a brasa pega */}
      <SceneVideo video={robataFire} box={box} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#050302]"
        initial={{ opacity: 1 }}
        animate={{ opacity: on ? 0 : 1 }}
        transition={on ? { duration: 1.6, ease: EASE, delay: reduce ? 0 : IGNITE } : { duration: 0 }}
      />
      {/* leitura do título sobre as chamas */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,3,2,0.85)_0%,rgba(5,3,2,0.35)_40%,transparent_62%,rgba(5,3,2,0.35)_100%)]" />
      <motion.div aria-hidden className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0 }} transition={on ? { duration: 1.6, delay: reduce ? 0 : IGNITE } : { duration: 0 }}>
        <Embers count={30} />
      </motion.div>
      {/* faísca: cai do alto até a grelha e se apaga quando a brasa pega */}
      {!reduce ? (
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-0 -ml-1 size-2 rounded-full bg-[#ffd9a0] shadow-[0_0_14px_4px_rgba(255,170,90,0.75),0_0_42px_12px_rgba(217,119,43,0.35)]"
          initial={{ y: "8vh", opacity: 0, scale: 1 }}
          animate={lit ? { y: ["8vh", "64vh", "64vh"], opacity: [0, 1, 1, 0], scale: [1, 1, 4] } : { y: "8vh", opacity: 0, scale: 1 }}
          transition={lit ? { duration: IGNITE + 0.5, ease: "easeIn", times: [0, 0.7, 1] } : { duration: 0 }}
        />
      ) : null}

      {/* passagem suave para o corte insignia, logo abaixo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-sumi to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-[var(--spacing-gutter)] text-center">
        <motion.p className="mk-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 1.2, ease: EASE }}>
          {eyebrow}
        </motion.p>
        <h2 className="mt-6 font-display text-display-xl leading-[0.95] text-washi">
          <span className="sr-only">{title}</span>
          <span aria-hidden>
            {words.map((w, i) => (
              <span key={i}>
                {i > 0 ? " " : null}
                <HotWord word={w} lit={on} delay={reduce ? 0 : IGNITE + 0.5 + i * 0.35} />
              </span>
            ))}
          </span>
        </h2>
        <motion.p
          className="mt-6 font-display text-xl italic text-ouro-claro md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{ duration: 1.4, ease: EASE, delay: reduce ? 0 : IGNITE + 0.6 + words.length * 0.35 }}
        >
          {tagline}
        </motion.p>
      </div>
    </div>
  );
}

/** Palavra que "esquenta": washi → ouro claro → brasa, com brilho, quando a chama chega nela. */
function HotWord({ word, lit, delay }: { word: string; lit: boolean; delay: number }) {
  return (
    <motion.span
      className="inline-block whitespace-nowrap"
      initial={{ color: "#efe9df", textShadow: "0 0 0px rgba(240,140,60,0)" }}
      animate={lit ? { color: ["#efe9df", "#e6cf96", "#f0a25a"], textShadow: "0 0 34px rgba(240,140,60,0.55)" } : { color: "#efe9df", textShadow: "0 0 0px rgba(240,140,60,0)" }}
      transition={lit ? { duration: 1.4, ease: "easeOut", delay } : { duration: 0 }}
    >
      {word}{" "}
    </motion.span>
  );
}
