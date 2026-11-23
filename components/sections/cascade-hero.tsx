"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { withBasePath } from "@/lib/i18n";
import { EASE } from "@/lib/motion";

export type CascadePhoto = { src: string; alt: string };

/**
 * Entrada "pratos em cascata" (/menu e /bar).
 * Ao abrir, as fotos reais aparecem espalhadas pela tela, uma a uma, ao redor do título;
 * ao rolar, elas se organizam num grid arrumado (como o da carta logo abaixo) e a tela solta.
 */

// posições espalhadas (centro, em % da tela) e tamanho relativo — fora da área do título
const SCATTER = [
  { x: 9, y: 20, s: 1.25, r: -4 },
  { x: 27, y: 9, s: 0.9, r: 3 },
  { x: 80, y: 13, s: 1.15, r: 5 },
  { x: 93, y: 43, s: 0.95, r: -3 },
  { x: 7, y: 56, s: 1, r: 4 },
  { x: 19, y: 85, s: 1.2, r: -5 },
  { x: 43, y: 91, s: 0.85, r: 2 },
  { x: 66, y: 87, s: 1.15, r: -2 },
  { x: 88, y: 77, s: 1, r: 4 },
  { x: 70, y: 28, s: 0.8, r: -6 },
];

type Layout = { W: number; H: number; tile: number; gap: number; cols: number; n: number; top: number };

export function CascadeHero({
  eyebrow,
  title,
  intro,
  photos,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  photos: CascadePhoto[];
}) {
  const box = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: box, offset: ["start start", "end end"] });
  const [L, setL] = useState<Layout | null>(null);

  useEffect(() => {
    const measure = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const mobile = W < 768;
      const cols = mobile ? 4 : 5;
      const n = Math.min(photos.length, cols * 2);
      const gap = mobile ? 8 : 14;
      const tile = Math.min(mobile ? (W - 32 - gap * 3) / 4 : 150, (H * 0.36 - gap) / 2);
      setL({ W, H, tile, gap, cols, n, top: H * (mobile ? 0.5 : 0.48) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [photos.length]);

  const titleY = useTransform(p, [0, 0.45], ["0vh", "-21vh"]);
  const titleS = useTransform(p, [0, 0.45], [1, 0.8]);
  const fade = useTransform(p, [0.9, 1], [1, 0]);

  return (
    <div ref={box} className="relative h-[175vh] md:h-[190vh]">
      <motion.div style={{ opacity: fade }} className="sticky top-0 h-[100svh] overflow-hidden">
        {/* luz quente atrás do título */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_42%,rgba(198,161,91,0.10),transparent_70%)]" />
        {L ? photos.slice(0, L.n).map((ph, i) => <Tile key={ph.src} ph={ph} i={i} L={L} p={p} />) : null}

        <motion.div style={{ y: titleY, scale: titleS }} className="pointer-events-none relative z-20 flex h-full flex-col items-center justify-center px-[var(--spacing-gutter)] text-center">
          <motion.p
            className="mk-eyebrow"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            className="mt-6 font-display text-display-xl font-light leading-[0.95] text-washi"
            initial={{ opacity: 0, filter: "blur(16px)", y: 24 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-[40ch] text-[0.95rem] leading-relaxed text-washi-dim"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
          >
            {intro}
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Tile({ ph, i, L, p }: { ph: CascadePhoto; i: number; L: Layout; p: MotionValue<number> }) {
  const sc = SCATTER[i % SCATTER.length];
  // posição final no grid (2 linhas centralizadas)
  const col = i % L.cols;
  const row = Math.floor(i / L.cols);
  const gridW = L.cols * L.tile + (L.cols - 1) * L.gap;
  const fx = (L.W - gridW) / 2 + col * (L.tile + L.gap);
  const fy = L.top + row * (L.tile + L.gap);
  // posição espalhada (o tamanho espalhado é maior que o do grid)
  const big = L.tile * (L.W < 768 ? 1.05 : 1.25) * sc.s;
  const sx = (sc.x / 100) * L.W - big / 2;
  const sy = (sc.y / 100) * L.H - big / 2;
  const k = big / L.tile;

  // o título sobe primeiro; as fotos se arrumam logo depois (sem cruzar o texto)
  const from = 0.12;
  const end = 0.78;
  const x = useTransform(p, [from, end], [sx - fx, 0]);
  const y = useTransform(p, [from, end], [sy - fy, 0]);
  const scale = useTransform(p, [from, end], [k, 1]);
  const rotate = useTransform(p, [from, end], [sc.r, 0]);
  const dim = useTransform(p, [from, end], [0.55, 1]);

  return (
    <motion.div
      className="absolute left-0 top-0 z-10 origin-top-left"
      style={{ x, y, scale, rotate, left: fx, top: fy, width: L.tile, height: L.tile }}
    >
      <motion.div
        className="relative size-full overflow-hidden border border-line bg-carvao"
        initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.35 + i * 0.09 }}
      >
        <motion.div style={{ opacity: dim }} className="absolute inset-0">
          <Image src={withBasePath(ph.src)} alt="" fill sizes="(min-width:768px) 190px, 26vw" className="object-cover" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
