import type { ReactNode } from "react";
import { Container } from "./container";

type HeroVariant = "standard" | "portfolio" | "performance" | "support";
const titleWidths: Record<HeroVariant, string> = {
  standard: "max-w-[1230px]",
  portfolio: "max-w-[1080px]",
  performance: "max-w-[1230px] [overflow-wrap:anywhere]",
  support: "max-w-[1050px]",
};
const introLayouts: Record<HeroVariant, string> = {
  standard:
    "grid grid-cols-[1fr_auto] items-end max-[801px]:grid-cols-1 max-[801px]:gap-[var(--space-related-content)]",
  portfolio:
    "grid grid-cols-[1fr_auto] items-end max-[801px]:grid-cols-1 max-[801px]:gap-[var(--space-related-content)]",
  support: "grid grid-cols-[1fr_auto] items-end max-[801px]:grid-cols-1 max-[801px]:gap-[var(--space-related-content)]",
  performance:
    "flex flex-wrap items-end gap-[var(--space-related-content)] [&>p]:flex-[1_1_30rem] [&>*]:min-w-0 [&>*]:[overflow-wrap:anywhere]",
};

export function PageHero({
  label,
  title,
  intro,
  variant = "standard",
}: {
  label: ReactNode;
  title: ReactNode;
  intro: ReactNode;
  variant?: HeroVariant;
}) {
  return (
    <div className="page-hero-band bg-[var(--background-gray)]">
      <Container as="section" className="page-hero py-[var(--space-section)]">
        <p className="eyebrow flex items-center gap-[10px] text-[length:var(--font-size-label)] leading-[var(--leading-body)] font-bold tracking-[var(--tracking-label)]">
          <span className="size-[9px] rounded-full bg-accent" /> {label}
        </p>
        <h1
          className={`mt-[66px] text-[length:var(--font-size-page-title)] leading-[var(--leading-page-title)] font-bold tracking-[var(--tracking-heading)] text-balance max-[801px]:[overflow-wrap:anywhere] [&_em]:not-italic [&_em]:text-brand ${titleWidths[variant]}`}
        >
          {title}
        </h1>
        <div
          className={`page-intro mt-[var(--space-heading-content)] [&_p]:m-0 [&_p]:max-w-[630px] [&_p]:text-[length:var(--font-size-lead)] [&_p]:leading-[var(--leading-body)] [&_p]:font-normal [&_p]:tracking-[var(--tracking-body)] [&_p]:text-pretty [&_small]:text-[length:var(--font-size-caption)] [&_small]:leading-[var(--leading-body)] [&_small]:font-normal [&_small]:tracking-[var(--tracking-body)] [&_small]:text-[var(--text-secondary)] ${introLayouts[variant]}`}
        >
          {intro}
        </div>
      </Container>
    </div>
  );
}
