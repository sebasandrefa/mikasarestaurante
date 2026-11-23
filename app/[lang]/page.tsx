import { notFound } from "next/navigation";
import { BarPreview } from "@/components/sections/bar-preview";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Location } from "@/components/sections/location";
import { MenuPreview } from "@/components/sections/menu-preview";
import { Omakase } from "@/components/sections/omakase";
import { Philosophy } from "@/components/sections/philosophy";
import { Recognition } from "@/components/sections/recognition";
import { Reservation } from "@/components/sections/reservation";
import { Robata } from "@/components/sections/robata";
import { ThePlace } from "@/components/sections/the-place";
import { hasLocale } from "@/lib/i18n";
import { getOmakaseFeatures } from "@/lib/omakase";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <>
      <Hero lang={lang} />
      <Philosophy lang={lang} />
      <Robata lang={lang} />
      <Omakase lang={lang} features={getOmakaseFeatures(lang)} />
      <MenuPreview lang={lang} />
      <BarPreview lang={lang} />
      <Gallery lang={lang} />
      <Recognition lang={lang} />
      <ThePlace lang={lang} />
      <Reservation lang={lang} />
      <Location lang={lang} />
    </>
  );
}
