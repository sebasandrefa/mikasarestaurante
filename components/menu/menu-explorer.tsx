"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { PHOTO_GRADE } from "@/components/menu/menu-hero";
import { useScrollTo } from "@/components/providers/smooth-scroll";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getCopy } from "@/data/copy";
import { menuCategories, menuItems, type MenuItem, type MenuTag } from "@/data/menu";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { EASE } from "@/lib/motion";
import { homeAnchor, sectionIds } from "@/lib/nav";
import { cn } from "@/lib/utils";

const filterTags: MenuTag[] = ["vegetariano", "picante", "signature"];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/* ─────────────── Tabs sticky ─────────────── */

export function CategoryTabs({
  tabs,
  active,
  onSelect,
  label,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // mantém a tab ativa visível no mobile
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!list || !el) return;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const left = list.scrollLeft + (er.left - lr.left) - lr.width / 2 + er.width / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <div className="sticky top-[var(--header-offset)] z-30 border-y border-line bg-sumi/85 backdrop-blur-md transition-[top] duration-[900ms] ease-[var(--ease-mikasa)]">
      <div ref={listRef} data-lenis-prevent className="mk-no-scrollbar mx-auto max-w-[100rem] overflow-x-auto px-[var(--spacing-gutter)]">
        <nav aria-label={label}>
          <LayoutGroup id={label}>
            <ul className="flex w-max gap-7 md:gap-10">
              {tabs.map((tab) => {
                const isActive = tab.id === active;
                return (
                  <li key={tab.id} className="relative">
                    <a
                      href={`#${tab.id}`}
                      data-tab={tab.id}
                      aria-current={isActive ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelect(tab.id);
                      }}
                      className={cn(
                        "flex h-14 items-center whitespace-nowrap font-sans text-[0.68rem] uppercase tracking-[0.22em] transition-colors duration-500",
                        isActive ? "text-ouro-claro" : "text-washi-dim hover:text-washi",
                      )}
                    >
                      {tab.label}
                    </a>
                    {isActive ? (
                      <motion.span
                        layoutId="tab-indicator"
                        aria-hidden
                        className="absolute inset-x-0 -bottom-px h-px bg-ouro"
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        </nav>
      </div>
    </div>
  );
}

/** Scroll-spy: devolve o id da seção visível. */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");
  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return [active, setActive] as const;
}

/* ─────────────── Item ─────────────── */

function priceLabel(item: MenuItem, lang: Locale) {
  const p = formatPrice(item.preco, lang);
  if (!p) return null;
  return item.opcoes ? `${getCopy(lang).menuPage.from} ${p}` : p;
}

function Options({ item, lang }: { item: MenuItem; lang: Locale }) {
  if (!item.opcoes) return null;
  return (
    <div className="mt-3">
      <p className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-ouro">{item.opcoes.titulo[lang]}</p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-washi-dim">
        {item.opcoes.itens.map((o) => (
          <li key={o.nome.en}>
            {o.nome[lang]} <span className="font-display text-base text-ouro tabular-nums">{formatPrice(o.preco, lang)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TagList({ tags, lang }: { tags: MenuTag[]; lang: Locale }) {
  const c = getCopy(lang);
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t} className="border border-line px-2 py-0.5 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ouro">
          {c.tags[t]}
        </li>
      ))}
    </ul>
  );
}

function Price({ item, lang, className }: { item: MenuItem; lang: Locale; className?: string }) {
  const price = priceLabel(item, lang);
  return (
    <span className={cn("shrink-0 whitespace-nowrap font-display text-xl text-ouro tabular-nums", className)}>
      {price ?? <span className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-washi-mute">{getCopy(lang).menuPage.pendingPrice}</span>}
    </span>
  );
}

/**
 * Cartão de prato: foto quadrada pequena (todas do mesmo tamanho), nome, preço e duas
 * linhas de descrição. Tocar abre o detalhe completo. Grid: 2 (celular) · 3 · 4 colunas.
 */
function DishCard({ item, lang, index, onOpen }: { item: MenuItem; lang: Locale; index: number; onOpen: (i: MenuItem) => void }) {
  const c = getCopy(lang);
  const signature = item.tags.includes("signature") || item.tags.includes("chefs-choice");
  return (
    <motion.li
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay: (index % 4) * 0.07 }}
    >
      <button type="button" onClick={() => onOpen(item)} className="group flex h-full w-full flex-col text-left">
        <div className="relative aspect-square w-full overflow-hidden bg-carvao [&_img]:[filter:var(--mk-grade)]" style={{ ["--mk-grade" as string]: PHOTO_GRADE }}>
          {/* cantos levemente apagados: une fotos de sessões diferentes */}
          <span aria-hidden className="pointer-events-none absolute inset-0 z-[1] shadow-[inset_0_0_70px_rgba(10,10,11,0.55)]" />
          <MediaFrame
            asset={item.imagem}
            lang={lang}
            fallbackLabel={item.nome[lang]}
            kanji="匠"
            sizes="(min-width:1024px) 22vw, (min-width:640px) 31vw, 46vw"
            className="[&_img]:transition-transform [&_img]:duration-[1400ms] [&_img]:ease-[var(--ease-mikasa)] group-hover:[&_img]:scale-[1.05]"
          />
          {signature ? (
            <span className="absolute left-2 top-2 z-[2] border border-ouro/60 bg-sumi/75 px-2 py-0.5 font-sans text-[0.55rem] uppercase tracking-[0.2em] text-ouro-claro backdrop-blur-sm">
              {c.tags[item.tags.includes("signature") ? "signature" : "chefs-choice"]}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <h3 className="font-display text-[clamp(1.05rem,0.95rem+0.4vw,1.35rem)] leading-tight text-washi transition-colors duration-500 group-hover:text-ouro-claro">
            {item.nome[lang]}
          </h3>
          <Price item={item} lang={lang} className="ml-auto text-lg" />
        </div>
        {item.porcao ? <p className="mt-1 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-washi-mute">{item.porcao}</p> : null}
        <p className="mt-1.5 line-clamp-2 text-[0.8rem] leading-relaxed text-washi-dim">
          {item.descricao?.[lang] ?? (item.componentes?.join(" · ") || <span className="text-washi-mute">{c.menuPage.pendingDescription}</span>)}
        </p>
        {item.tags.filter((t) => t === "picante" || t === "vegetariano").length ? (
          <div className="mt-2">
            <TagList tags={item.tags.filter((t) => t === "picante" || t === "vegetariano")} lang={lang} />
          </div>
        ) : null}
      </button>
    </motion.li>
  );
}

function CategoryItems({ items, lang, onOpen }: { items: MenuItem[]; lang: Locale; onOpen: (i: MenuItem) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-16">
      {items.map((item, i) => (
        <DishCard key={item.id} item={item} lang={lang} index={i} onOpen={onOpen} />
      ))}
    </ul>
  );
}

/* ─────────────── Modal ─────────────── */

function ItemDialog({ item, lang, onClose }: { item: MenuItem | null; lang: Locale; onClose: () => void }) {
  const c = getCopy(lang);
  const cat = item ? menuCategories.find((x) => x.id === item.categoria) : null;
  const price = item ? priceLabel(item, lang) : null;
  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent closeLabel={c.a11y.close} className="grid md:grid-cols-2">
        {item ? (
          <>
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[520px]">
              <MediaFrame
                asset={item.video?.available ? item.video : item.imagem}
                lang={lang}
                fallbackLabel={item.nome[lang]}
                kanji="匠"
                sizes="(min-width:768px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-col p-8 md:p-12">
              <p className="mk-eyebrow">{cat?.nome[lang]}</p>
              <DialogTitle className="mt-5 font-display text-display-md font-light text-washi">{item.nome[lang]}</DialogTitle>
              {item.componentes?.length ? (
                <ul className="mt-4 flex flex-wrap gap-x-5">
                  {item.componentes.map((p) => (
                    <li key={p} className="font-display text-xl italic text-ouro-claro">
                      {p}
                    </li>
                  ))}
                </ul>
              ) : null}
              <DialogDescription className="mt-6 text-[0.95rem] leading-relaxed text-washi-dim">
                {item.descricao?.[lang] ?? c.menuPage.pendingDescription}
              </DialogDescription>
              {item.escolha ? <p className="mt-3 text-sm italic text-washi-mute">{item.escolha[lang]}</p> : null}
              <Options item={item} lang={lang} />
              <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-washi-mute">USD</dt>
                  <dd className="font-display text-2xl text-ouro">{price ?? <span className="font-sans text-xs uppercase tracking-[0.2em] text-washi-mute">{c.menuPage.pendingPrice}</span>}</dd>
                </div>
                {item.porcao ? (
                  <div className="flex justify-between">
                    <dt className="text-washi-mute">{c.menuPage.portion}</dt>
                    <dd className="text-washi">{item.porcao}</dd>
                  </div>
                ) : null}
                {cat?.nota ? (
                  <div className="flex justify-between gap-6">
                    <dt className="shrink-0 text-washi-mute">{c.menuPage.includes}</dt>
                    <dd className="text-right text-washi">{cat.lista ? cat.lista[lang].join(" · ") : cat.nota[lang]}</dd>
                  </div>
                ) : null}
              </dl>
              {item.tags.length ? (
                <div className="mt-6">
                  <TagList tags={item.tags} lang={lang} />
                </div>
              ) : null}
              <div className="mt-auto pt-10">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={homeAnchor(lang, sectionIds.reservation)}>{c.menuPage.reserve}</Link>
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────── Explorer ─────────────── */

export function MenuExplorer({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const m = c.menuPage;
  const scrollTo = useScrollTo();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MenuTag[]>([]);
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const searching = query.trim().length > 0 || filters.length > 0;
  // só exibe filtros que tenham ao menos um prato marcado na carta
  const availableTags = filterTags.filter((t) => menuItems.some((i) => i.tags.includes(t)));

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    return menuCategories
      .map((cat) => {
        const items = menuItems.filter((i) => {
          if (i.categoria !== cat.id) return false;
          if (filters.length && !filters.every((f) => i.tags.includes(f))) return false;
          if (!q) return true;
          const hay = normalize(
            [i.nome.es, i.nome.en, i.descricao?.[lang] ?? "", i.escolha?.[lang] ?? "", ...(i.componentes ?? []), ...(i.opcoes?.itens.map((o) => o.nome[lang]) ?? [])].join(" "),
          );
          return hay.includes(q);
        });
        return { cat, items };
      })
      .filter((g) => !searching || g.items.length > 0);
  }, [query, filters, lang, searching]);

  const ids = groups.map((g) => g.cat.id);
  const [active, setActive] = useScrollSpy(ids);

  const select = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) scrollTo(el, -140);
  };

  const toggle = (t: MenuTag) => setFilters((f) => (f.includes(t) ? f.filter((x) => x !== t) : [...f, t]));

  return (
    <>
      <CategoryTabs tabs={groups.map((g) => ({ id: g.cat.id, label: g.cat.nome[lang] }))} active={active} onSelect={select} label={c.nav.menu} />

      <div className="mx-auto max-w-[100rem] px-[var(--spacing-gutter)]">
        {/* Busca + filtros */}
        <div className="flex flex-col gap-6 border-b border-line py-10 md:flex-row md:items-end md:justify-between">
          <div className="relative w-full md:max-w-md">
            <label htmlFor="menu-search" className="mb-2 block font-sans text-[0.62rem] uppercase tracking-[0.28em] text-washi-dim">
              {m.search}
            </label>
            <Search aria-hidden strokeWidth={1.25} className="pointer-events-none absolute bottom-3.5 left-0 size-4 text-ouro" />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={m.searchPlaceholder}
              className="w-full border-0 border-b border-line-strong bg-transparent py-3 pl-8 pr-10 text-base text-washi placeholder:text-washi-mute focus:border-ouro focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label={m.clear} className="absolute bottom-1 right-0 grid size-10 place-items-center text-washi-dim hover:text-ouro-claro">
                <X className="size-4" strokeWidth={1.25} aria-hidden />
              </button>
            ) : null}
          </div>

          <div role="group" aria-label={m.filters} className="flex flex-wrap items-center gap-2">
            {availableTags.map((t) => {
              const on = filters.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(t)}
                  className={cn(
                    "min-h-11 border px-4 font-sans text-[0.65rem] uppercase tracking-[0.22em] transition-colors duration-500",
                    on ? "border-ouro text-ouro-claro" : "border-line text-washi-dim hover:border-line-strong hover:text-washi",
                  )}
                >
                  {c.tags[t]}
                </button>
              );
            })}
            {searching ? (
              <button type="button" onClick={() => { setFilters([]); setQuery(""); }} className="min-h-11 px-3 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-washi-mute underline-offset-4 hover:text-washi hover:underline">
                {m.clear}
              </button>
            ) : null}
          </div>
        </div>

        <div aria-live="polite" className="sr-only">
          {searching ? `${groups.reduce((n, g) => n + g.items.length, 0)}` : ""}
        </div>

        {groups.length === 0 ? (
          <p className="py-24 text-center font-display text-2xl italic text-washi-dim">{m.noResults}</p>
        ) : null}

        {groups.map(({ cat, items }, gi) => (
          <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-title`} className="scroll-mt-40 border-b border-line py-16 last:border-b-0 md:py-24">
            <div className="grid gap-10 md:gap-14">
              <header className="grid gap-6 md:grid-cols-12 md:items-end">
                <div className="flex items-end gap-5 md:col-span-7">
                  <span aria-hidden className="font-display text-[clamp(3rem,2rem+4vw,5.5rem)] font-light leading-[0.8] text-ouro/40 tabular-nums">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 id={`${cat.id}-title`} className="font-display text-display-md font-light leading-none text-washi">
                      {cat.nome[lang]}
                    </h2>
                    <p className="mt-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-washi-mute">
                      {items.length} {items.length === 1 ? c.menuPreview.dish : c.menuPreview.dishes}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-5 md:text-right">
                {cat.subtitulo ? <p className="font-display text-lg italic text-ouro-claro/90">{cat.subtitulo[lang]}</p> : null}
                {cat.nota ? <p className="mt-6 font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ouro">{cat.nota[lang]}</p> : null}
                {cat.lista ? (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-washi-dim md:justify-end">
                    {cat.lista[lang].map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                ) : null}
                {cat.status === "parcial" && !searching ? (
                  <p className="mt-6 text-xs leading-relaxed text-washi-mute md:ml-auto md:max-w-[34ch]">{m.partialCategory}</p>
                ) : null}
                </div>
              </header>

              <div>
                {items.length ? (
                  <CategoryItems items={items} lang={lang} onOpen={setSelected} />
                ) : (
                  <div className="flex flex-col items-start gap-6 border border-dashed border-line-strong p-8">
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ouro">Placeholder</span>
                    <p className="max-w-[48ch] text-sm leading-relaxed text-washi-dim">{m.pendingCategory}</p>
                    <Button asChild variant="link" size="none">
                      <a href={site.menus.food.flipbook} target="_blank" rel="noopener noreferrer">
                        {m.original} <ArrowUpRight className="size-3.5" strokeWidth={1.25} aria-hidden />
                        <span className="sr-only"> {c.a11y.externalLink}</span>
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <ItemDialog item={selected} lang={lang} onClose={() => setSelected(null)} />
    </>
  );
}
