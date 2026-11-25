"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { getCopy } from "@/data/copy";
import { gallery, type GalleryItem } from "@/data/media";
import { withBasePath, type Locale } from "@/lib/i18n";
import { sectionIds } from "@/lib/nav";

const GalleryLightbox = dynamic(() => import("@/components/sections/gallery-lightbox").then((m) => m.GalleryLightbox), { ssr: false });

/** pseudo-aleatório fixo (igual no servidor e no navegador) */
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Galeria "Instantes de la casa" — as fotos saem do centro.
 * A cena gruda na tela: as fotos começam empilhadas no meio, como um monte de cartões;
 * com a rolagem se espalham pela tela em profundidades diferentes e revelam o título.
 * Depois o campo inteiro sobe, cada foto na velocidade da sua profundidade (paralaxe 3D).
 * Clicar numa foto abre o lightbox, como antes.
 */
export function Gallery({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const [opened, setOpened] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  // tamanho da tela (as posições finais dependem dele)
  const W = useMotionValue(1440);
  const H = useMotionValue(900);

  useEffect(() => {
    const measure = () => {
      W.set(document.documentElement.clientWidth);
      H.set(window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [W, H]);

  const go = useCallback((step: number) => {
    setDir(step);
    setIndex((i) => (i === null ? i : (i + step + gallery.length) % gallery.length));
  }, []);

  // o título aparece quando as fotos já abriram espaço
  const titleOpacity = useTransform(p, [0.14, 0.34], [0, 1]);
  const titleScale = useTransform(p, [0.14, 0.4], [0.92, 1]);
  const hintOpacity = useTransform(p, [0, 0.08], [1, 0]);

  return (
    <section id={sectionIds.gallery} aria-label={c.gallery.eyebrow} className="relative">
      <div ref={wrap} className="relative h-[320svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* título no centro, revelado quando as fotos se afastam */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 grid place-items-center px-[var(--spacing-gutter)] text-center"
            style={{ opacity: titleOpacity, scale: titleScale }}
          >
            {/* sombra suave atrás do título: as fotos que passam por trás escurecem, o texto fica legível */}
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[min(26rem,60svh)] w-[min(44rem,110vw)] -translate-x-1/2 -translate-y-1/2"
              style={{ background: "radial-gradient(closest-side, rgba(10,10,11,0.88), rgba(10,10,11,0.6) 55%, transparent)" }}
            />
            <div className="relative [text-shadow:0_2px_28px_rgba(10,10,11,0.95)]">
              <p className="mk-eyebrow mb-5 flex items-center justify-center gap-4">
                <span aria-hidden className="h-px w-10 bg-ouro" />
                {c.gallery.eyebrow}
                <span aria-hidden className="h-px w-10 bg-ouro" />
              </p>
              <h2 className="mx-auto max-w-[12ch] font-display text-display-lg font-light leading-[1.02] text-washi">{c.gallery.title}</h2>
            </div>
          </motion.div>

          {/* camada 3D separada: o título (acima) nunca fica atrás das fotos */}
          <ul className="absolute inset-0 z-10 [perspective:1100px] [transform-style:preserve-3d]">
            {gallery.map((item, i) => (
              <Card
                key={item.asset.id}
                item={item}
                i={i}
                n={gallery.length}
                p={p}
                W={W}
                H={H}
                lang={lang}
                label={c.cursor.open}
                onOpen={() => {
                  setDir(1);
                  setIndex(i);
                  setOpened(true);
                }}
              />
            ))}
          </ul>

          <motion.p
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-28 z-30 text-center font-sans text-[0.65rem] uppercase tracking-[0.3em] text-washi-mute md:bottom-10"
            style={{ opacity: hintOpacity }}
          >
            {c.omakase.hint}
          </motion.p>
        </div>
      </div>

      {/* lightbox carregado só no primeiro clique (menos JavaScript na Home) */}
      {opened ? <GalleryLightbox lang={lang} index={index} dir={dir} onClose={() => setIndex(null)} go={go} /> : null}
    </section>
  );
}

const aspect: Record<GalleryItem["ratio"], number> = { portrait: 4 / 3, landscape: 3 / 4, square: 1 };

function Card({
  item,
  i,
  n,
  p,
  W,
  H,
  lang,
  label,
  onOpen,
}: {
  item: GalleryItem;
  i: number;
  n: number;
  p: MotionValue<number>;
  W: MotionValue<number>;
  H: MotionValue<number>;
  lang: Locale;
  label: string;
  onOpen: () => void;
}) {
  // posição final: grade com variação, num campo mais alto que a tela (que depois sobe)
  const place = () => {
    const w = W.get();
    const h = H.get();
    const cols = w < 640 ? 4 : w < 1024 ? 5 : 6;
    const rows = Math.ceil(n / cols);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cw = cardWidth(w);
    let x = ((col + 0.5) / cols - 0.5) * w * 0.96 + (rnd(i, 1) - 0.5) * cw * 0.7;
    // linhas ímpares deslocadas (sem cara de grade)
    if (row % 2) x += (w * 0.96) / cols / 2.4;
    let y = ((row + 0.5) / rows - 0.5) * h * 1.75 + (rnd(i, 2) - 0.5) * cw * 0.6 + h * 0.32;
    // deixa o centro da primeira tela livre para o título
    if (Math.abs(x) < w * 0.24 && Math.abs(y) < h * 0.2) y += (y < 0 ? -1 : 1) * h * 0.24;
    return { x, y, cw };
  };
  const depth = -260 + rnd(i, 3) * 460; // longe (-) … perto (+)
  const tilt = (rnd(i, 4) - 0.5) * 30;

  const spread = useTransform(() => easeInOut(clamp((p.get() - 0.02) / 0.36, 0, 1)));
  // depois de aberto, o campo sobe; o que está mais perto sobe mais rápido
  const rise = useTransform(() => clamp((p.get() - 0.4) / 0.6, 0, 1));
  const x = useTransform(() => place().x * spread.get());
  const y = useTransform(() => {
    const h = H.get();
    return place().y * spread.get() - rise.get() * h * (0.9 + depth / 700);
  });
  const z = useTransform(() => depth * spread.get());
  const rotate = useTransform(() => tilt * (1 - spread.get() * 0.85));
  // o monte começa grande no centro e cada foto encolhe um pouco ao se afastar
  const scale = useTransform(() => 1.45 - 0.45 * spread.get());
  const width = useTransform(() => `${cardWidth(W.get())}px`);
  const marginLeft = useTransform(() => `${-cardWidth(W.get()) / 2}px`);
  const marginTop = useTransform(() => `${(-cardWidth(W.get()) * aspect[item.ratio]) / 2}px`);

  return (
    <motion.li
      className="absolute left-1/2 top-1/2"
      style={{ x, y, z, rotate, scale, width, marginLeft, marginTop }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={item.asset.alt[lang]}
        data-cursor={label}
        className="group relative block w-full overflow-hidden bg-carvao shadow-[0_18px_40px_rgba(0,0,0,0.45)] outline-offset-4"
        style={{ aspectRatio: item.ratio === "portrait" ? "3 / 4" : item.ratio === "landscape" ? "4 / 3" : "1 / 1" }}
      >
        <Image
          src={withBasePath(item.asset.src)}
          alt=""
          fill
          sizes="(min-width:1024px) 240px, 160px"
          className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-mikasa)] [@media(hover:hover)]:group-hover:scale-[1.06]"
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-washi/5 transition-colors duration-500 group-hover:ring-ouro/50" />
      </button>
    </motion.li>
  );
}

/** largura do cartão: cresce com a tela, sem passar de 230px */
function cardWidth(w: number) {
  return clamp(w * 0.135, 84, 230);
}
