"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { SceneVideo as SceneVideoData } from "@/data/media";
import { withBasePath } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Vídeo de uma cena: toca sozinho (câmera lenta, ida e volta já no arquivo) só enquanto
 * `box` está na tela; ao sair, pausa e volta ao início — quem voltar vê desde o começo.
 * Vídeo real (decodificado pelo aparelho): todos os quadros, liso e nítido.
 * Arquivo H.264 High nível 4.0 (o que todo celular toca); ver `data/media.ts`.
 * Começa a baixar quando a cena se aproxima (ou já, com `eager`). Movimento reduzido: só o poster.
 */
export function SceneVideo({
  video,
  box,
  eager = false,
  className,
}: {
  video: SceneVideoData;
  box: RefObject<HTMLElement | null>;
  eager?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    const el = box.current;
    if (!v || !el || reduce) return;
    // iPhone só toca sozinho vídeo mudo: garante o "mudo" como propriedade e como atributo
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    let visible = false;
    const play = () => {
      if (visible) v.play().catch(() => {});
    };
    // se o play() chegou antes dos dados (comum no celular), tenta de novo quando der
    v.addEventListener("canplay", play);
    // baixar antes de chegar
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        v.preload = "auto";
        near.disconnect();
      },
      { rootMargin: "120% 0px" },
    );
    // tocar só com a cena na tela; ao sair, volta ao início
    const seen = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          if (v.preload !== "auto") v.preload = "auto";
          play();
        } else {
          v.pause();
          if (v.currentTime > 0) v.currentTime = 0;
        }
      },
      { threshold: 0.35 },
    );
    near.observe(el);
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
      v.removeEventListener("canplay", play);
    };
  }, [box, reduce]);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop
      playsInline
      disablePictureInPicture
      preload={eager ? "auto" : "metadata"}
      poster={withBasePath(video.poster)}
      className={cn("absolute inset-0 size-full object-cover", className)}
      style={{ objectPosition: video.position }}
    >
      <source src={withBasePath(video.src)} type="video/mp4" />
    </video>
  );
}
