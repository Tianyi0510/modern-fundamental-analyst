import type { ReactNode } from "react";
import { Container } from "./container";

type HeroVariant = "standard" | "portfolio" | "performance" | "support";
const titleWidths: Record<HeroVariant, string> = {
  standard: "max-w-[1230px]",
  portfolio: "max-w-[1080px]",
  performance: "max-w-[1230px] [overflow-wrap:anywhere]",
  support: "max-w-[1050px]",
};
const introLayout =
  "flex flex-wrap items-end gap-[var(--space-related-content)] [&>p]:flex-[1_1_30rem] [&>small]:ml-auto [&>small]:max-w-full [&>small]:text-right [&>*]:min-w-0 [&>*]:[overflow-wrap:anywhere]";

export function PageHero({
  label,
  title,
  intro,
  children,
  variant = "standard",
  titleRole = "headline",
}: {
  label: ReactNode;
  title: ReactNode;
  intro: ReactNode;
  children?: ReactNode;
  variant?: HeroVariant;
  titleRole?: "headline" | "title";
}) {
  return (
    <div className="page-hero-band bg-[var(--surface-secondary)]">
      <Container as="section" className="page-hero @container/financial-summary py-[var(--space-section-padding)]">
        <p className="eyebrow flex items-center gap-[10px] text-large-label">
          <span className="size-[9px] rounded-full bg-accent" /> {label}
        </p>
        <h1
          className={`mt-[var(--space-section-content)] ${titleRole === "title" ? "text-medium-title" : "text-large-headline"} text-balance max-[801px]:[overflow-wrap:anywhere] [&_em]:text-brand [&_em]:not-italic ${titleWidths[variant]}`}
        >
          {title}
        </h1>
        <div
          className={`page-intro mt-[var(--space-section-content)] [&_p]:m-0 [&_p]:max-w-[630px] [&_p]:text-large-body [&_p]:text-pretty [&_small]:text-small-body [&_small]:text-[var(--text-secondary)] ${introLayout}`}
        >
          {intro}
        </div>
        {children ? (
          <div className="hero-summary @container/hero-summary mt-[var(--space-section-content)]">{children}</div>
        ) : null}
      </Container>
    </div>
  );
}
