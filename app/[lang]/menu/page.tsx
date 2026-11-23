import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuExplorer } from "@/components/menu/menu-explorer";
import { CascadeHero, type CascadePhoto } from "@/components/sections/cascade-hero";
import { OriginalNote } from "@/components/sections/original-note";
import { getCopy } from "@/data/copy";
import { menuCategories, menuItems } from "@/data/menu";
import { site } from "@/data/site";
import { hasLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = getCopy(lang);
  return buildMetadata({ lang, path: "/menu", title: c.meta.menuTitle, description: c.meta.menuDescription });
}

/** Fotos reais da entrada: uma por categoria primeiro (variedade), depois o resto, sem repetir. */
function cascadePhotos(lang: "es" | "en"): CascadePhoto[] {
  const withPhoto = menuItems.filter((i) => i.imagem?.available);
  const seen = new Set<string>();
  const out: CascadePhoto[] = [];
  const add = (i: (typeof withPhoto)[number]) => {
    if (!i.imagem || seen.has(i.imagem.src)) return;
    seen.add(i.imagem.src);
    out.push({ src: i.imagem.src, alt: i.imagem.alt[lang] });
  };
  for (const cat of menuCategories) {
    const first = withPhoto.find((i) => i.categoria === cat.id);
    if (first) add(first);
  }
  withPhoto.forEach(add);
  return out.slice(0, 10);
}

export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCopy(lang);
  return (
    <>
      <CascadeHero eyebrow={c.menuPage.eyebrow} title={c.menuPage.title} intro={c.menuPage.intro} photos={cascadePhotos(lang)} />
      <OriginalNote notice={c.menuPage.notice} original={{ href: site.menus.food.flipbook, label: c.menuPage.original }} externalLabel={c.a11y.externalLink} />
      <MenuExplorer lang={lang} />
    </>
  );
}
