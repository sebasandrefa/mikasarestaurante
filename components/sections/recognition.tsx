import { ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { SealDraw } from "@/components/motion/seal-draw";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { reviews } from "@/data/reviews";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { sectionIds } from "@/lib/nav";

/** Reconhecimentos — Restaurant Guru 2023–2026, seguidores e avaliações reais. */
export function Recognition({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  return (
    <section id={sectionIds.recognition} className="relative border-y border-line py-[var(--spacing-section)] mk-washi">
      <div className="mx-auto max-w-[100rem] px-[var(--spacing-gutter)]">
        <SectionHeading index="07" eyebrow={c.recognition.eyebrow} title={c.recognition.title} align="center" />

        {/* Os números do prestígio: o selo se desenha e os números sobem contando, em ouro com reflexo */}
        <div className="mx-auto mt-16 grid max-w-6xl items-center gap-14 md:mt-20 md:grid-cols-[1fr_auto_1fr] md:gap-12">
          <Reveal className="relative flex flex-col items-center text-center">
            <Glow />
            <SealDraw className="size-[clamp(13rem,9rem+14vw,19rem)]">
              <CountUp
                to={site.awards.length}
                className="mk-sheen font-display text-[clamp(6rem,4rem+8vw,11rem)] font-light leading-none"
              />
            </SealDraw>
            <p className="mt-8 font-sans text-[0.7rem] uppercase tracking-[0.34em] text-ouro">{site.awards[0].name}</p>
            <p className="mt-3 font-display text-xl italic text-ouro-claro">{site.awards.map((a) => a.year).join(" · ")}</p>
          </Reveal>

          {/* fio dourado entre os dois números (só em telas largas) */}
          <span aria-hidden className="hidden h-48 w-px bg-gradient-to-b from-transparent via-ouro/60 to-transparent md:block" />

          <Reveal className="relative flex flex-col items-center text-center" delay={0.15}>
            <Glow />
            <CountUp
              to={site.social.followers.value}
              suffix={site.social.followers.suffix}
              className="mk-sheen font-display text-[clamp(6rem,4rem+8vw,11rem)] font-light leading-none"
            />
            <a
              href={site.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-10 items-center font-sans text-[0.7rem] uppercase tracking-[0.34em] text-washi-dim transition-colors hover:text-ouro-claro"
            >
              {c.recognition.followers} · {site.social.instagram.handle}
              <span className="sr-only"> {c.a11y.externalLink}</span>
            </a>
          </Reveal>
        </div>

        <div className="mx-auto mt-20 max-w-5xl md:mt-24">
          <h3 className="text-center font-display text-display-sm text-washi">{c.recognition.reviewsTitle}</h3>
          {reviews.length ? (
            <ul className="mt-12 grid gap-px bg-line md:grid-cols-3">
              {reviews.map((r, i) => (
                <li key={`${r.author}-${i}`} className="bg-sumi p-8">
                  <p className="text-ouro" aria-label={`${r.rating}/5`}>
                    {"★".repeat(r.rating)}
                    <span className="text-washi-mute">{"★".repeat(5 - r.rating)}</span>
                  </p>
                  <blockquote lang={r.lang} className="mt-5 font-display text-lg italic leading-relaxed text-washi">
                    “{r.text}”
                  </blockquote>
                  <p className="mt-6 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-washi-dim">
                    {r.author} · {c.recognition.sourceLabel}:{" "}
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-ouro hover:text-ouro-claro">
                        {r.source}
                      </a>
                    ) : (
                      r.source
                    )}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            // sem avaliações copiadas no site (nunca inventar): leva às avaliações reais no Google
            <div className="mt-6 flex flex-col items-center text-center">
              <p className="max-w-md text-washi-dim">{c.recognition.reviewsInvite}</p>
              <Button asChild variant="outline" size="lg" className="mt-8 gap-3">
                <a href={site.maps.url} target="_blank" rel="noopener noreferrer">
                  {c.recognition.reviewsGoogle}
                  <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.25} />
                  <span className="sr-only"> {c.a11y.externalLink}</span>
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Brilho dourado suave atrás de cada número (decorativo). */
function Glow() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[38%] -z-10 size-[min(34rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ background: "radial-gradient(closest-side, rgba(198,161,91,0.16), rgba(198,161,91,0.05) 55%, transparent 75%)" }}
    />
  );
}
