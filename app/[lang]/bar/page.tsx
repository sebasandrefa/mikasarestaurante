import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BarExplorer } from "@/components/bar/bar-explorer";
import { BarHero } from "@/components/bar/bar-hero";
import { OriginalNote } from "@/components/sections/original-note";
import { media } from "@/data/media";
import { getCopy } from "@/data/copy";
import { site } from "@/data/site";
import { hasLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/bar">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = getCopy(lang);
  return buildMetadata({ lang, path: "/bar", title: c.meta.barTitle, description: c.meta.barDescription });
}

export default async function BarPage({ params }: PageProps<"/[lang]/bar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCopy(lang);
  return (
    <>
      <BarHero
        eyebrow={c.barPage.eyebrow}
        title={c.barPage.title}
        line={c.barPreview.title}
        intro={c.barPage.intro}
        photos={[media.bar01, media.bar03, media.bar02].map((m) => ({ src: m.src, alt: m.alt[lang] }))}
      />
      <OriginalNote notice={c.barPage.notice} original={{ href: site.menus.bar.flipbook, label: c.barPage.original }} externalLabel={c.a11y.externalLink} />
      <BarExplorer lang={lang} />
    </>
  );
}
