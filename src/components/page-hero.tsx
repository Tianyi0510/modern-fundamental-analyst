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
  title,
  action,
  intro,
  children,
  variant = "standard",
}: {
  title: ReactNode;
  action?: ReactNode;
  intro: ReactNode;
  children?: ReactNode;
  variant?: HeroVariant;
}) {
  const heading = (
    <h1
      className={`mt-0 text-large-display text-balance ${action ? "whitespace-nowrap" : "max-[375px]:[&:lang(en)]:text-small-display"} max-[801px]:[overflow-wrap:anywhere] [&_em]:text-brand [&_em]:not-italic ${titleWidths[variant]}`}
    >
      {title}
    </h1>
  );
  return (
    <div className="page-hero-band bg-[var(--surface-secondary)]">
      <Container as="section" className="page-hero @container/financial-summary py-[var(--space-section-padding)]">
        {action ? (
          <div className="flex flex-wrap items-start justify-between gap-[var(--space-16px)]">
            {heading}
            {action}
          </div>
        ) : (
          heading
        )}
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
