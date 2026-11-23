"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";
import { withBasePath } from "@/lib/i18n";

export type FrameSequence = {
  /** pasta dos quadros no PC (vídeo inteiro, 16:9) */
  desktop: string;
  /** pasta dos quadros no celular em pé (recorte vertical) */
  mobile: string;
  frames: number;
};

type Opts = { from: number; to: number; anchorX: number; anchorY: number; eager: boolean };

/** Monta o canvas e o carregamento dos quadros; devolve `draw(progresso)` e a limpeza. */
function setupSequence(el: HTMLElement, cv: HTMLCanvasElement, seq: FrameSequence, o: Opts, initial: number) {
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  const portrait = window.matchMedia("(orientation: portrait) and (max-width: 900px)").matches;
  const dir = portrait ? seq.mobile : seq.desktop;
  const N = seq.frames;
  const imgs: (HTMLImageElement | null)[] = Array(N).fill(null);
  const frameOf = (prog: number) => Math.round(Math.min(1, Math.max(0, (prog - o.from) / (o.to - o.from))) * (N - 1));
  let last = -1;
  let want = frameOf(initial);

  const paint = (f: number) => {
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
    ctx.drawImage(im, (W - w) * o.anchorX, (H - h) * o.anchorY, w, h);
  };
  const size = () => {
    // nitidez máxima: até 2x a densidade da tela
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(cv.clientWidth * dpr);
    cv.height = Math.round(cv.clientHeight * dpr);
    last = -1;
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
    for (let i = 0; i < N; i += 6) load(i);
    const rest = () => {
      for (let i = 0; i < N; i++) load(i);
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(rest, { timeout: 1200 });
    else setTimeout(rest, 300);
  };
  const io = new IntersectionObserver(([e]) => e.isIntersecting && start(), { rootMargin: "150% 0px" });
  if (o.eager) start();
  else io.observe(el);
  size();
  window.addEventListener("resize", size);
  return {
    draw: (prog: number) => {
      want = frameOf(prog);
      paint(want);
    },
    dispose: () => {
      io.disconnect();
      window.removeEventListener("resize", size);
    },
  };
}

/**
 * Desenha num canvas o quadro de um vídeo escolhido pela rolagem (`progress` 0–1).
 * Os quadros só carregam quando `box` se aproxima da tela: 1 a cada 6 primeiro
 * (a cena já funciona), depois o resto. Sem o quadro pedido, mostra o mais próximo já pronto.
 * `from`/`to`: faixa do progresso em que o vídeo anda. `anchorY`: onde o corte vertical encosta (0 topo, 1 base).
 */
export function useFrameSequence({
  seq,
  box,
  canvas,
  progress,
  from = 0,
  to = 1,
  anchorX = 0.5,
  anchorY = 0.5,
  eager = false,
}: {
  seq: FrameSequence;
  box: RefObject<HTMLElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  progress: MotionValue<number>;
  from?: number;
  to?: number;
  anchorX?: number;
  anchorY?: number;
  /** carregar já (cena no topo da página) */
  eager?: boolean;
}) {
  const draw = useRef<(p: number) => void>(() => {});
  useEffect(() => {
    if (!box.current || !canvas.current) return;
    const s = setupSequence(box.current, canvas.current, seq, { from, to, anchorX, anchorY, eager }, progress.get());
    if (!s) return;
    draw.current = s.draw;
    return s.dispose;
  }, [seq, box, canvas, progress, from, to, anchorX, anchorY, eager]);
  useMotionValueEvent(progress, "change", (v) => draw.current(v));
}
