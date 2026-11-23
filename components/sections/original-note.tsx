import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Linha discreta abaixo da entrada: aviso da transcrição + link para a carta original. */
export function OriginalNote({ notice, original, externalLabel }: { notice: string; original: { href: string; label: string }; externalLabel: string }) {
  return (
    <div className="mx-auto flex max-w-[100rem] flex-col gap-6 px-[var(--spacing-gutter)] pb-12 md:flex-row md:items-center md:justify-between">
      <p className="border-l border-torii/70 pl-4 text-xs leading-relaxed text-washi-mute md:max-w-[70ch]">{notice}</p>
      <Button asChild variant="outline" className="shrink-0">
        <a href={original.href} target="_blank" rel="noopener noreferrer">
          {original.label} <ArrowUpRight className="size-4" strokeWidth={1.25} aria-hidden />
          <span className="sr-only"> {externalLabel}</span>
        </a>
      </Button>
    </div>
  );
}
