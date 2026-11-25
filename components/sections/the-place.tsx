"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { SceneVideo } from "@/components/media/scene-video";
import { SplitText } from "@/components/motion/split-text";
import { SmartLink } from "@/components/layout/smart-link";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import {
  placeVideo,
  roomPhotos,
  roomVideo,
  terraceNights,
  type MediaAsset,
  type SceneVideo as SceneVideoData,
} from "@/data/media";
import { site } from "@/data/site";
import { withBasePath, type Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { homeAnchor, sectionIds } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * "El lugar" — a casa de verdade, em três atos:
 * 1. Pase adelante: o vídeo real do salão começa como uma janela pequena e abre até a tela
 *    toda conforme a rolagem; as duas palavras se afastam como uma porta.
 * 2. Recorra la casa: as fotos reais do salão passam na horizontal (a rolagem vertical move a
 *    faixa), cada uma com paralaxe dentro do quadro; termina no vídeo da terraza cheia.
 * 3. A terraza ao cair da noite (vídeo real) com o convite para reservar.
 */
export function ThePlace({ lang }: { lang: Locale }) {
  const c = getCopy(lang).place;
  return (
    <section aria-label={c.eyebrow} className="relative bg-sumi">
      <Aperture lang={lang} />
      <Tour lang={lang} />
      <Terrace lang={lang} />
    </section>
  );
}

/* ───────────── 1. Pase adelante ───────────── */

function Aperture({ lang }: { lang: Locale }) {
  const c = getCopy(lang).place;
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: wrap, offset: ["start start", "end end"] });

  // --c: 1 = janela pequena, 0 = tela toda · --s: quanto as palavras já se afastaram
  const closed = useTransform(p, [0.04, 0.62], [1, 0], { ease: easeInOut });
  const spread = useTransform(p, [0.04, 0.5], [0, 1], { ease: easeIn });
  const zoom = useTransform(p, [0, 1], [1.32, 1]);
  const wordsOpacity = useTransform(p, [0.3, 0.52], [1, 0]);
  const shade = useTransform(p, [0, 0.62], [0.35, 0]);
  const capOpacity = useTransform(p, [0.66, 0.84], [0, 1]);
  const capY = useTransform(p, [0.66, 0.84], [28, 0]);

  return (
    <div ref={wrap} className="relative h-[290svh]">
      <div ref={stage} data-scene="sala" className="sticky top-0 h-[100svh] overflow-hidden">
        {/* a janela que abre */}
        <motion.div
          className="absolute inset-0 overflow-hidden [clip-path:inset(calc(var(--c)*27%)_calc(var(--c)*11%))] md:[clip-path:inset(calc(var(--c)*24%)_calc(var(--c)*32%))]"
          style={{ "--c": closed } as MotionStyle}
        >
          <motion.div className="absolute inset-0" style={{ scale: zoom }}>
            <SceneVideo video={roomVideo} box={stage} eager={false} />
          </motion.div>
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-sumi" style={{ opacity: shade }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,11,0.88)_0%,rgba(10,10,11,0.35)_34%,transparent_58%)]" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sumi/80 to-transparent" />
        </motion.div>

        {/* moldura dourada fina da janela (some ao abrir) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute border border-ouro/40 [inset:calc(var(--c)*27%)_calc(var(--c)*11%)] md:[inset:calc(var(--c)*24%)_calc(var(--c)*32%)]"
          style={{ "--c": closed, opacity: closed } as MotionStyle}
        />

        {/* as palavras: abrem como uma porta */}
        <motion.h2
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center font-display text-display-lg font-light leading-none text-washi md:flex-row"
          style={{ "--s": spread, opacity: wordsOpacity } as MotionStyle}
        >
          <span className="block [translate:0_calc(var(--s)*-22svh)] md:[translate:calc(var(--s)*-26vw)_0]">{c.enter[0]}</span>
          <span aria-hidden className="block h-[calc(46svh+1.5rem)] w-px md:h-px md:w-[calc(36vw+2rem)]" />
          <span className="mk-sheen block pr-[0.08em] italic [translate:0_calc(var(--s)*22svh)] md:[translate:calc(var(--s)*26vw)_0]">
            {c.enter[1]}
          </span>
        </motion.h2>

        {/* legenda quando a sala está inteira na tela */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-[100rem] px-[var(--spacing-gutter)] pb-28 md:pb-[clamp(3rem,9vh,6rem)]"
          style={{ opacity: capOpacity, y: capY }}
        >
          <p className="mk-eyebrow mb-5 flex items-center gap-4">
            <span aria-hidden className="h-px w-10 bg-ouro" />
            {c.eyebrow}
          </p>
          <p className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-display text-display-sm font-light text-washi">
            {c.rooms.map((room, i) => (
              <span key={room} className="flex items-baseline gap-5">
                {i > 0 && <span aria-hidden className="text-ouro/70">·</span>}
                {room}
              </span>
            ))}
          </p>
          <p className="mt-4 font-sans text-[0.7rem] uppercase tracking-[0.28em] text-washi-dim">{site.address.full}</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────── 2. Recorra la casa ───────────── */

type Stop =
  | { kind: "photo"; asset: MediaAsset; label: string; shape: "portrait" | "landscape" }
  | { kind: "video"; video: SceneVideoData; label: string };

function Tour({ lang }: { lang: Locale }) {
  const c = getCopy(lang).place;
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dist = useMotionValue(0);
  const height = useMotionValue("100svh");
  const { scrollYProgress: p } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const x = useTransform(() => -p.get() * dist.get());
  // paralaxe dentro dos quadros: a foto anda um pouco menos que a faixa
  const drift = useTransform(p, [0, 1], ["7%", "-7%"]);
  const bar = useTransform(p, [0, 1], [0, 1]);
  // palavra gigante ao fundo, andando mais devagar que as fotos (profundidade)
  const backX = useTransform(p, [0, 1], ["12vw", "-55vw"]);

  // a altura da cena = o quanto a faixa precisa andar (mede de novo ao mudar o tamanho)
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const d = Math.max(0, el.scrollWidth - document.documentElement.clientWidth);
      dist.set(d);
      height.set(`calc(100svh + ${d}px)`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [dist, height]);

  const stops: Stop[] = [
    { kind: "photo", asset: roomPhotos.puerta, label: c.tour.puerta, shape: "portrait" },
    { kind: "photo", asset: roomPhotos.sala, label: c.tour.sala, shape: "portrait" },
    { kind: "photo", asset: roomPhotos.mesas, label: c.tour.mesas, shape: "landscape" },
    { kind: "photo", asset: roomPhotos.barra, label: c.tour.barra, shape: "portrait" },
    { kind: "photo", asset: roomPhotos.vitrina, label: c.tour.vitrina, shape: "portrait" },
    { kind: "video", video: terraceNights, label: c.tour.noches },
  ];
  const total = String(stops.length).padStart(2, "0");

  return (
    <motion.div ref={wrap} className="relative" style={{ height }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pb-24 md:pb-0">
        <motion.p
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[clamp(9rem,28vw,28rem)] font-light italic leading-none text-washi/[0.035]"
          style={{ x: backX }}
        >
          {c.eyebrow}
        </motion.p>
        <motion.div
          ref={track}
          className="flex w-max items-center gap-[clamp(1.75rem,5vw,6rem)] pl-[var(--spacing-gutter)] pr-[max(var(--spacing-gutter),12vw)]"
          style={{ x }}
        >
          <div className="w-[min(78vw,30rem)] shrink-0 self-center">
            <p className="mk-eyebrow mb-6 flex items-center gap-4">
              <span aria-hidden className="h-px w-10 bg-ouro" />
              {c.eyebrow}
            </p>
            <SplitText as="h3" text={c.tourTitle} inView className="font-display text-display-lg font-light leading-[1.02] text-washi" />
            <p className="mt-10 flex items-center gap-4 font-sans text-[0.7rem] uppercase tracking-[0.28em] text-washi-mute">
              {c.tourHint}
              <span aria-hidden className="relative h-px w-16 overflow-hidden bg-washi/15">
                <span className="mk-hint-line absolute inset-y-0 left-0 w-1/2 bg-ouro" />
              </span>
            </p>
          </div>

          {stops.map((stop, i) => (
            <Panel key={stop.label} stop={stop} index={i} total={total} drift={drift} lang={lang} />
          ))}
        </motion.div>

        {/* progresso do passeio */}
        <div aria-hidden className="absolute inset-x-[var(--spacing-gutter)] bottom-[6.5rem] h-px bg-washi/10 md:bottom-[clamp(1.5rem,5vh,3rem)]">
          <motion.div className="h-full origin-left bg-ouro/80" style={{ scaleX: bar }} />
        </div>
      </div>
    </motion.div>
  );
}

function Panel({
  stop,
  index,
  total,
  drift,
  lang,
}: {
  stop: Stop;
  index: number;
  total: string;
  drift: MotionValue<string>;
  lang: Locale;
}) {
  const box = useRef<HTMLDivElement>(null);
  const landscape = stop.kind === "photo" && stop.shape === "landscape";
  const video = stop.kind === "video";
  return (
    // quem observa a tela é o <figure> (sem recorte): o IntersectionObserver ignora elemento todo recortado
    <motion.figure
      className={cn(
        "relative shrink-0",
        // ritmo: um quadro mais alto, outro mais baixo
        index % 2 === 0 ? "-translate-y-[2svh] md:-translate-y-[4svh]" : "translate-y-[2svh] md:translate-y-[5svh]",
      )}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.div
        ref={box}
        className={cn(
          "relative overflow-hidden bg-carvao",
          landscape
            ? "aspect-[4/3] h-[34svh] sm:h-[44svh] md:h-[54svh]"
            : video
              ? "aspect-[9/16] h-[50svh] md:h-[68svh]"
              : "aspect-[3/4] h-[46svh] md:h-[66svh]",
        )}
        variants={{
          hidden: { clipPath: "inset(0% 0% 0% 100%)" },
          show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.3, ease: EASE } },
        }}
      >
        {stop.kind === "photo" ? (
          <motion.div className="absolute inset-y-0 -left-[9%] -right-[9%]" style={{ x: drift }}>
            <Image
              src={withBasePath(stop.asset.src)}
              alt={stop.asset.alt[lang]}
              fill
              sizes={landscape ? "(min-width:768px) 86vh, 70vw" : "(min-width:768px) 60vh, 50vw"}
              className="object-cover"
            />
          </motion.div>
        ) : (
          <VideoStop video={stop.video} box={box} />
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-washi/5" />
      </motion.div>
      <figcaption className="absolute inset-x-0 top-full mt-4 flex items-baseline gap-3">
        <span className="shrink-0 whitespace-nowrap font-display text-sm text-ouro">
          {String(index + 1).padStart(2, "0")}
          <span className="text-washi-mute"> / {total}</span>
        </span>
        <span className="font-sans text-[0.68rem] uppercase tracking-[0.26em] text-washi-dim">{stop.label}</span>
      </figcaption>
    </motion.figure>
  );
}

function VideoStop({ video, box }: { video: SceneVideoData; box: React.RefObject<HTMLDivElement | null> }) {
  const seen = useInView(box, { amount: 0.35 });
  return (
    <>
      <SceneVideo video={video} box={box} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-sumi"
        initial={{ opacity: 1 }}
        animate={{ opacity: seen ? 0 : 1 }}
        transition={seen ? { duration: 1.4, ease: EASE, delay: 0.2 } : { duration: 0 }}
      />
    </>
  );
}

/* ───────────── 3. A terraza ───────────── */

function Terrace({ lang }: { lang: Locale }) {
  const c = getCopy(lang).place;
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { amount: 0.35 });

  return (
    <div ref={box} data-scene="the-place" className="relative h-[100svh] min-h-[36rem] overflow-hidden">
      <SceneVideo video={placeVideo} box={box} />
      {/* o vídeo entra saindo do escuro (véu por cima: o iPhone não toca vídeo invisível) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-sumi"
        initial={{ opacity: 1 }}
        animate={{ opacity: seen ? 0 : 1 }}
        transition={seen ? { duration: 1.8, ease: EASE, delay: 0.2 } : { duration: 0 }}
      />
      {/* leitura do texto: escurece embaixo e à esquerda */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.45)_38%,transparent_62%),linear-gradient(90deg,rgba(10,10,11,0.55)_0%,transparent_55%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sumi to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-end px-[var(--spacing-gutter)] pb-[clamp(4rem,10vh,7rem)]">
        <SplitText as="h3" text={c.title} inView delay={0.6} className="max-w-[16ch] font-display text-display-lg font-light leading-[1.02] text-washi" />
        <motion.div
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 1.2, ease: EASE, delay: seen ? 1.4 : 0 }}
        >
          <Button asChild size="lg">
            <SmartLink href={homeAnchor(lang, sectionIds.reservation)}>{c.cta}</SmartLink>
          </Button>
          <span className="font-sans text-[0.7rem] uppercase tracking-[0.28em] text-washi-dim">{site.address.full}</span>
        </motion.div>
      </div>
    </div>
  );
}

/* curvas para as transformações de rolagem */
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeIn(t: number) {
  return t * t;
}
