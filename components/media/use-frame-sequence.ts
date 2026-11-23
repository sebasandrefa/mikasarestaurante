"use client";

import { useEffect, useRef, type RefObject } from "react";
import { animate, useMotionValue, useMotionValueEvent, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import { withBasePath } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/motion";

export type FrameSequence = {
  /** pasta dos quadros no PC (vídeo inteiro, 16:9) */
  desktop: string;
  /** pasta dos quadros no celular em pé (recorte vertical) */
  mobile: string;
  frames: number;
};

type Opts = { anchorX: number; anchorY: number; eager: boolean };

/** Monta o canvas e o carregamento dos quadros; devolve `draw(progresso)` e a limpeza. */
function setupSequence(el: HTMLElement, cv: HTMLCanvasElement, seq: FrameSequence, o: Opts, initial: number) {
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  const portrait = window.matchMedia("(orientation: portrait) and (max-width: 900px)").matches;
  const dir = portrait ? seq.mobile : seq.desktop;
  const N = seq.frames;
  const imgs: (HTMLImageElement | null)[] = Array(N).fill(null);
  /** posição contínua no vídeo (ex.: 41.37 = entre o quadro 41 e o 42) */
  const posOf = (prog: number) => Math.min(1, Math.max(0, prog)) * (N - 1);
  let last = "";
  let want = posOf(initial);

  const ready = (i: number) => !!imgs[i]?.complete && !!imgs[i]?.naturalWidth;
  const drawImg = (im: HTMLImageElement, alpha: number) => {
    const W = cv.width;
    const H = cv.height;
    const k = Math.max(W / im.naturalWidth, H / im.naturalHeight);
    const w = im.naturalWidth * k;
    const h = im.naturalHeight * k;
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, (W - w) * o.anchorX, (H - h) * o.anchorY, w, h);
  };
  // câmera lenta fluida: funde o quadro atual com o próximo conforme a fração
  const paint = (pos: number) => {
    let a = Math.floor(pos);
    let frac = pos - a;
    while (a > 0 && !ready(a)) {
      a--;
      frac = 0;
    }
    if (!ready(a)) return;
    const b = Math.min(N - 1, a + 1);
    if (!ready(b)) frac = 0;
    const key = `${a}:${Math.round(frac * 40)}:${cv.width}`;
    if (key === last) return;
    last = key;
    ctx.imageSmoothingQuality = "high";
    drawImg(imgs[a]!, 1);
    if (frac > 0.02) drawImg(imgs[b]!, frac);
    ctx.globalAlpha = 1;
  };
  const size = () => {
    // nitidez máxima: até 2x a densidade da tela
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(cv.clientWidth * dpr);
    cv.height = Math.round(cv.clientHeight * dpr);
    last = "";
    paint(want);
  };
  const load = (i: number) => {
    if (imgs[i]) return;
    const im = new Image();
    im.decoding = "async";
    im.onload = () => {
      if (i <= Math.ceil(want)) {
        last = "";
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
      want = posOf(prog);
      paint(want);
    },
    dispose: () => {
      io.disconnect();
      window.removeEventListener("resize", size);
    },
  };
}

/**
 * Toca um vídeo (sequência de quadros) sozinho, em câmera lenta, para frente e para trás,
 * só enquanto a cena `box` está na tela — fora dela, pausa. Os quadros carregam quando a
 * cena se aproxima: 1 a cada 6 primeiro (já funciona), depois o resto.
 * `duration`: segundos de cada ida (e de cada volta). `anchorY`: onde o corte encosta (0 topo, 1 base).
 * Movimento reduzido: fica parado num quadro (`still`).
 */
export function useFrameSequence({
  seq,
  box,
  canvas,
  duration = 12,
  anchorX = 0.5,
  anchorY = 0.5,
  eager = false,
  still = 0.7,
}: {
  seq: FrameSequence;
  box: RefObject<HTMLElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  duration?: number;
  anchorX?: number;
  anchorY?: number;
  /** carregar já (cena no topo da página) */
  eager?: boolean;
  /** quadro fixo (0–1) com movimento reduzido */
  still?: number;
}): MotionValue<number> {
  const reduce = useReducedMotion();
  const t = useMotionValue(0);
  const draw = useRef<(p: number) => void>(() => {});

  useEffect(() => {
    if (!box.current || !canvas.current) return;
    const s = setupSequence(box.current, canvas.current, seq, { anchorX, anchorY, eager }, t.get());
    if (!s) return;
    draw.current = s.draw;
    return s.dispose;
  }, [seq, box, canvas, t, anchorX, anchorY, eager]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (reduce) {
      t.set(still);
      return;
    }
    let ctl: AnimationPlaybackControls | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (ctl) ctl.play();
          else ctl = animate(t, [0, 1], { duration, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" });
        } else ctl?.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      ctl?.stop();
    };
  }, [box, t, duration, reduce, still]);

  useMotionValueEvent(t, "change", (v) => draw.current(v));
  return t;
}
