"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { SceneVideo as SceneVideoData } from "@/data/media";
import { withBasePath } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** tela em pé (celular): usa o recorte retrato do vídeo */
const PORTRAIT = "(max-aspect-ratio: 3/4)";

/**
 * Vídeo de uma cena: toca sozinho (câmera lenta, ida e volta já no arquivo) só enquanto
 * `box` está na tela; ao sair, pausa e volta ao início — quem voltar vê desde o começo.
 * Vídeo real (decodificado pelo aparelho): todos os quadros, liso e nítido.
 * Arquivo H.264 High nível 4.0 (o que todo celular toca); no celular, recorte retrato. Ver `data/media.ts`.
 * Começa a baixar quando a cena se aproxima (ou já, com `eager`). Movimento reduzido: só o poster.
 *
 * iPhone: não toca vídeo invisível (opacity 0 / fora da tela) — quem usa este componente não deve
 * esconder o vídeo com opacity; para "acender", ponha um véu por cima e apague o véu.
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
    let tries = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let lastError = "";
    const play = () => {
      if (!visible || !v.paused) return;
      v.play().then(
        () => (tries = 0),
        (err: unknown) => {
          lastError = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
          // o celular às vezes recusa o primeiro play (dados ainda chegando, economia de bateria…)
          if (visible && tries++ < 8) retry = setTimeout(play, 600);
        },
      );
    };
    // se o play() chegou antes dos dados (comum no celular), tenta de novo quando der
    v.addEventListener("loadeddata", play);
    v.addEventListener("canplay", play);
    // navegador que bloqueia vídeo automático (modo economia de bateria, Safari "nunca reproduzir"):
    // o primeiro toque/clique/tecla na página libera o play
    const unlock = () => {
      tries = 0;
      play();
    };
    const gesture = { capture: true, passive: true } as const;
    for (const ev of ["pointerdown", "touchend", "keydown"]) window.addEventListener(ev, unlock, gesture);
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
        clearTimeout(retry);
        if (visible) {
          tries = 0;
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
    // diagnóstico em aparelho real: abrir o site com ?debug=video mostra o estado do vídeo
    let probe: ReturnType<typeof setInterval> | undefined;
    let panel: HTMLPreElement | undefined;
    if (new URLSearchParams(location.search).get("debug") === "video") {
      panel = document.createElement("pre");
      panel.style.cssText =
        "position:absolute;left:8px;bottom:8px;z-index:50;max-width:calc(100% - 16px);margin:0;padding:8px;font:11px/1.4 monospace;white-space:pre-wrap;color:#fff;background:rgba(0,0,0,.75)";
      el.appendChild(panel);
      const states = ["EMPTY", "IDLE", "LOADING", "NO_SOURCE"];
      probe = setInterval(() => {
        if (!panel) return;
        panel.textContent = [
          `src: ${v.currentSrc.split("/").pop() || "-"}`,
          `ready ${v.readyState} · rede ${states[v.networkState]} · ${v.paused ? "PAUSADO" : "TOCANDO"} · t ${v.currentTime.toFixed(1)}s`,
          `visível ${visible} · mudo ${v.muted} · tentativas ${tries}`,
          `erro vídeo: ${v.error ? `${v.error.code} ${v.error.message}` : "-"}`,
          `erro play: ${lastError || "-"}`,
          navigator.userAgent,
        ].join("\n");
      }, 500);
    }
    return () => {
      clearInterval(probe);
      panel?.remove();
      near.disconnect();
      seen.disconnect();
      clearTimeout(retry);
      for (const ev of ["pointerdown", "touchend", "keydown"]) window.removeEventListener(ev, unlock, gesture);
      v.removeEventListener("loadeddata", play);
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
      <source src={withBasePath(video.mobile)} type="video/mp4" media={PORTRAIT} />
      <source src={withBasePath(video.src)} type="video/mp4" />
    </video>
  );
}
