import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuExplorer } from "@/components/menu/menu-explorer";
import { MenuHero, MenuIndex, type HeroDish, type IndexEntry } from "@/components/menu/menu-hero";
import { OriginalNote } from "@/components/sections/original-note";
import { getCopy } from "@/data/copy";
import { menuCategories, menuItems } from "@/data/menu";
import { photos } from "@/data/media";
import { site } from "@/data/site";
import { hasLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = getCopy(lang);
  return buildMetadata({ lang, path: "/menu", title: c.meta.menuTitle, description: c.meta.menuDescription });
}

/** Pratos da entrada: fotos escuras e serenas, uma por vez (fotos reais da carta). */
function heroDishes(lang: "es" | "en"): HeroDish[] {
  return [photos.mitokoTataki, photos.sashimiSelection, photos.nagasakiBeefRice].map((m) => ({ src: m.src, alt: m.alt[lang] }));
}

/** Índice: capítulos e quantos pratos cada um tem (calculado no servidor). */
function indexEntries(lang: "es" | "en", dish: string, dishes: string): IndexEntry[] {
  return menuCategories.map((cat) => {
    const n = menuItems.filter((i) => i.categoria === cat.id).length;
    return { id: cat.id, name: cat.nome[lang], count: `${n} ${n === 1 ? dish : dishes}` };
  });
}

export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCopy(lang);
  return (
    <>
      <MenuHero eyebrow={c.menuPage.eyebrow} title={c.menuPage.title} intro={c.menuPage.intro} dishes={heroDishes(lang)} />
      <MenuIndex label={c.menuPage.index} entries={indexEntries(lang, c.menuPreview.dish, c.menuPreview.dishes)} />
      <OriginalNote notice={c.menuPage.notice} original={{ href: site.menus.food.flipbook, label: c.menuPage.original }} externalLabel={c.a11y.externalLink} />
      <MenuExplorer lang={lang} />
    </>
  );
}
