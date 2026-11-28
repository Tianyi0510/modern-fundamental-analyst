import { containerAppearance } from "./container";
export const appearance = {
  shell: containerAppearance,
  "site-footer":
    "site-footer bg-[var(--surface-inverse)] text-[var(--text-inverse)] text-left [--focus-ring-color:var(--focus-ring-on-dark)]",
  "footer-main":
    "footer-main py-[var(--space-section-padding)] grid grid-cols-[var(--grid-columns)] min-[1101px]:[&>.footer-brand]:col-span-4 min-[1101px]:[&>.footer-navigation]:col-span-2 min-[1101px]:[&>.subscribe-section]:col-span-6 gap-x-[var(--grid-column-gap)] items-start [@media(max-width:1100px)_and_(min-width:801px)]:grid-cols-2 [@media(max-width:1100px)_and_(min-width:801px)]:gap-[var(--space-section-content)] [@media(max-width:1100px)_and_(min-width:801px)]:[&>.subscribe-section]:col-span-full compact:grid-cols-1 compact:gap-[var(--space-section-content)]",
  "footer-brand":
    "footer-brand min-w-0 self-start text-left grid grid-cols-1 justify-items-start gap-[var(--space-footer-heading)]",
  wordmark: "wordmark",
  "footer-mark": "footer-mark flex min-h-[var(--size-footer-heading)] w-full max-w-full items-start justify-self-start",
  "footer-description": "m-0 max-w-[390px] text-[var(--text-inverse-secondary)] text-small-body",
  "footer-navigation": "footer-navigation min-w-0 self-start text-left",
  "footer-heading":
    "footer-heading min-h-[var(--size-footer-heading)] mb-[var(--space-footer-heading)] text-highlight text-medium-title",
  "footer-links":
    "footer-links grid justify-items-start gap-0 text-medium-label [&_a]:w-fit [&_a]:pb-[var(--space-16px)] [&_a]:inline-flex [&_a]:items-start [&_a]:transition-colors [&_a]:duration-[var(--motion-duration-base)] [&_a]:ease-[var(--motion-ease-standard)] [&_a:hover]:text-highlight [&_a:focus-visible]:text-highlight touch:[&_a:hover:not(:focus-visible)]:text-[var(--text-inverse)] touch:[&_a:active]:text-highlight",
  "footer-social-link": "footer-social-link [&>svg]:mt-[var(--space-4px)] gap-[var(--space-8px)] [&>svg]:flex-none",
  "footer-bottom":
    "footer-bottom col-span-full grid items-center py-[var(--space-site-bar)] border-t border-[var(--border-inverse-subtle)] [&_small]:text-[var(--text-inverse-tertiary)] [&_small]:text-small-body",
} as const;
