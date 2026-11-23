"use client";

import { CategoryTabs, useScrollSpy } from "@/components/menu/menu-explorer";
import { useScrollTo } from "@/components/providers/smooth-scroll";
import { BarPromos } from "@/components/bar/bar-promos";
import { Reveal } from "@/components/motion/reveal";
import { barCategories, barItemsByCategory, type BarCategory, type BarItem } from "@/data/bar";
import { getCopy } from "@/data/copy";
import type { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

function CocktailCard({ item, cat, lang }: { item: BarItem; cat: BarCategory; lang: Locale }) {
  const price = formatPrice(item.preco ?? cat.precoUnico ?? null, lang);
  return (
    <li className="group relative flex flex-col border border-line bg-sumi/60 p-6 transition-colors duration-700 hover:border-line-strong md:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[clamp(1.35rem,1.15rem+0.6vw,1.75rem)] leading-tight text-washi transition-colors duration-500 group-hover:text-ouro-claro">
          {item.nome}
        </h3>
        {item.preco != null && price ? <span className="shrink-0 font-display text-xl text-ouro tabular-nums">{price}</span> : null}
      </div>
      <span aria-hidden className="mt-4 block h-px w-8 bg-torii/80" />
      {item.descricao ? <p className="mt-4 text-sm leading-relaxed text-washi-dim">{item.descricao[lang]}</p> : null}
    </li>
  );
}

function ListRow({ item, lang }: { item: BarItem; lang: Locale }) {
  return (
    <li className="border-b border-line py-5">
      <div className="flex items-baseline">
        <h3 className="font-display text-[clamp(1.15rem,1rem+0.5vw,1.45rem)] leading-snug text-washi">
          {item.nome}
          {item.volume ? <span className="ml-3 font-sans text-[0.66rem] tracking-[0.18em] text-washi-mute">{item.volume}</span> : null}
        </h3>
        <span aria-hidden className="mk-leader hidden sm:block" />
        <span className="ml-auto shrink-0 whitespace-nowrap pl-4 font-display text-lg text-ouro tabular-nums sm:ml-0 sm:pl-0">
          {formatPrice(item.preco, lang)}
        </span>
      </div>
      {item.descricao ? <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-washi-dim">{item.descricao[lang]}</p> : null}
    </li>
  );
}

const GROUPS = ["cocteles", "destilados", "vinos", "otros"] as const;
const ROMAN = ["I", "II", "III", "IV"];

/** Bloco de uma categoria: título, nota e os itens (cartões para coquetéis, lista de preços para o resto). */
function CategoryBlock({ cat, lang }: { cat: BarCategory; lang: Locale }) {
  const b = getCopy(lang).barPage;
  const items = barItemsByCategory(cat.id);
  const cards = cat.grupo === "cocteles";
  return (
    <section id={cat.id} aria-labelledby={`${cat.id}-title`} className="scroll-mt-40">
      <header className="flex flex-col gap-3 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 id={`${cat.id}-title`} className="flex items-center gap-3 font-display text-[clamp(1.6rem,1.3rem+1vw,2.3rem)] font-light leading-tight text-washi">
            {cat.nome[lang]}
            {cat.destaque ? <span aria-hidden className="font-jp text-sm text-ouro/60">酒</span> : null}
          </h3>
          {cat.subtitulo ? <p className="mt-2 font-display text-lg italic text-ouro-claro/90">{cat.subtitulo[lang]}</p> : null}
          {cat.nota ? <p className="mt-2 max-w-[56ch] text-xs leading-relaxed text-washi-mute">{cat.nota[lang]}</p> : null}
        </div>
        {cat.precoUnico ? (
          <p className="font-display text-3xl text-ouro tabular-nums md:text-right">
            {formatPrice(cat.precoUnico, lang)}
            <span className="ml-2 font-sans text-[0.6rem] uppercase tracking-[0.24em] text-washi-mute">{b.each}</span>
          </p>
        ) : null}
      </header>
      {cards ? (
        <ul className={cn("mt-6 grid gap-4 sm:grid-cols-2", items.length >= 4 && "xl:grid-cols-4", items.length === 3 && "lg:grid-cols-3")}>
          {items.map((it) => (
            <CocktailCard key={it.id} item={it} cat={cat} lang={lang} />
          ))}
        </ul>
      ) : (
        <ul>
          {items.map((it) => (
            <ListRow key={it.id} item={it} lang={lang} />
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Carta do bar em 4 capítulos (Mixología · Destilados · Vinos · Otras bebidas).
 * Coquetéis em cartões editoriais; destilados e vinhos em listas de preço em duas colunas,
 * como numa carta de vinhos de hotel. Promoções logo depois da entrada.
 */
export function BarExplorer({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const b = c.barPage;
  const scrollTo = useScrollTo();
  const groups = GROUPS.map((g) => ({ id: `bar-${g}`, g, cats: barCategories.filter((x) => x.grupo === g) })).filter((x) => x.cats.length);
  const [active, setActive] = useScrollSpy(groups.map((x) => x.id));

  return (
    <div className="relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent,#0f0a07_20%,#0f0a07_80%,transparent)]" />

      <CategoryTabs
        tabs={groups.map((x) => ({ id: x.id, label: b.groups[x.g] }))}
        active={active}
        onSelect={(id) => {
          setActive(id);
          const el = document.getElementById(id);
          if (el) scrollTo(el, -140);
        }}
        label="Bar"
      />

      {/* Promoções */}
      <section aria-labelledby="bar-promos" className="mx-auto max-w-[100rem] px-[var(--spacing-gutter)] pt-16 md:pt-20">
        <h2 id="bar-promos" className="mk-eyebrow mb-8 flex items-center gap-4">
          <span aria-hidden className="h-px w-10 bg-ouro/70" />
          {b.promos}
        </h2>
        <BarPromos lang={lang} />
      </section>

      <div className="mx-auto max-w-[100rem] px-[var(--spacing-gutter)] pb-[var(--spacing-section)]">
        {groups.map((grp, gi) => (
          <section key={grp.id} id={grp.id} aria-labelledby={`${grp.id}-title`} className="scroll-mt-40 pt-24 md:pt-32">
            {/* abertura do capítulo */}
            <Reveal className="mb-12 flex items-end gap-6 md:mb-16">
              <span aria-hidden className="font-display text-[clamp(3.5rem,2.5rem+4vw,6.5rem)] font-light leading-[0.8] text-ouro/40">
                {ROMAN[gi]}
              </span>
              <div className="flex-1 border-b border-line-strong pb-3">
                <h2 id={`${grp.id}-title`} className="font-display text-display-lg font-light leading-none text-washi">
                  {b.groups[grp.g]}
                </h2>
              </div>
            </Reveal>
            <div className={cn("grid gap-16", grp.g !== "cocteles" && "lg:grid-cols-2 lg:gap-x-20")}>
              {grp.cats.map((cat) => (
                <Reveal key={cat.id}>
                  <CategoryBlock cat={cat} lang={lang} />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
        <p className="mt-20 text-center text-xs text-washi-mute">{b.responsibly}</p>
      </div>
    </div>
  );
}
