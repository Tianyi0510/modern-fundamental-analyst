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
    <div className="page-hero-band bg-[var(--surface-muted)]">
      <Container
        as="section"
        className="page-hero grid grid-cols-1 gap-[var(--space-heading-content)] py-[var(--space-section)]"
      >
        <div className="grid min-w-0 gap-[var(--space-hero-title-gap)]">
          <p className="eyebrow flex items-center gap-[var(--space-125)] text-label">
            <span className="size-[9px] rounded-round bg-accent" /> {label}
          </p>
          <h1
            className={`m-0 text-display text-balance max-[801px]:[overflow-wrap:anywhere] [&_em]:text-brand [&_em]:not-italic ${titleWidths[variant]}`}
          >
            {title}
          </h1>
        </div>
        <div
          className={`page-intro [&_p]:m-0 [&_p]:max-w-[630px] [&_p]:text-lead [&_p]:text-pretty [&_small]:text-caption [&_small]:text-[var(--text-secondary)] ${introLayouts[variant]}`}
        >
          {intro}
        </div>
      </Container>
    </div>
  );
}
