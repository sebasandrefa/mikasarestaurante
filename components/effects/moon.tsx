import { cn } from "@/lib/utils";

/**
 * Lua cheia dourada (decorativa, aria-hidden): disco com relevo suave e halo que respira.
 * Só CSS/SVG estático — nada é redesenhado por quadro além da opacidade do halo.
 */
export function Moon({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative aspect-square", className)}>
      {/* halo largo */}
      <div
        className="mk-moon-halo absolute -inset-[70%] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(236,214,160,0.34), rgba(198,161,91,0.14) 42%, rgba(198,161,91,0.04) 62%, transparent 72%)" }}
      />
      {/* disco */}
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          background: [
            // mares (manchas escuras) com bordas suaves, como na lua real
            "radial-gradient(ellipse 22% 17% at 64% 30%, rgba(132,92,42,0.42), transparent 100%)",
            "radial-gradient(ellipse 26% 20% at 38% 58%, rgba(132,92,42,0.36), transparent 100%)",
            "radial-gradient(ellipse 15% 12% at 58% 71%, rgba(132,92,42,0.3), transparent 100%)",
            "radial-gradient(ellipse 13% 10% at 27% 36%, rgba(132,92,42,0.24), transparent 100%)",
            "radial-gradient(ellipse 9% 7% at 72% 52%, rgba(132,92,42,0.26), transparent 100%)",
            // cratera clara com raios (canto de baixo)
            "radial-gradient(circle at 45% 84%, rgba(255,246,222,0.55), transparent 5%)",
            // luz: mais clara no alto à esquerda, borda que escurece (volume)
            "radial-gradient(circle at 38% 34%, #f9eccb 0%, #ecd49c 36%, #d3b06c 70%, #a57a3c 100%)",
          ].join(", "),
          boxShadow: "0 0 46px 4px rgba(236,214,160,0.28), inset -18px -24px 60px rgba(96,62,22,0.45), inset 6px 8px 24px rgba(255,248,226,0.25)",
        }}
      >
        {/* textura fina da superfície */}
        <svg className="absolute inset-0 size-full opacity-[0.3] mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
          <filter id="mk-moon-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.16  0 0 0 0.9 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#mk-moon-grain)" />
        </svg>
      </div>
    </div>
  );
}
