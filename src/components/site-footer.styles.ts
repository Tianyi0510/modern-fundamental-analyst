import { containerAppearance } from "./container";
export const appearance = {
  shell: containerAppearance,
  "site-footer": "site-footer bg-black text-white text-left",
  "footer-main":
    "footer-main py-[var(--space-footer-main)] grid grid-cols-[minmax(220px,0.9fr)_minmax(140px,0.45fr)_minmax(360px,1.35fr)] gap-x-[64px] items-start [@media(max-width:1100px)_and_(min-width:801px)]:grid-cols-[minmax(0,0.9fr)_minmax(0,0.55fr)_minmax(0,1.25fr)] [@media(max-width:1100px)_and_(min-width:801px)]:gap-[var(--space-5)] compact:grid-cols-1 compact:gap-[var(--space-6)]",
  "footer-brand": "footer-brand min-w-0 self-start text-left grid justify-items-start gap-[14px]",
  wordmark: "wordmark",
  "footer-mark":
    "footer-mark max-w-[min(320px,100%)] whitespace-normal [overflow-wrap:anywhere] justify-self-start text-[length:var(--font-size-compact-title)] leading-[var(--leading-compact-title)] font-bold tracking-[var(--tracking-heading)] text-white hover:text-white focus-visible:text-white [&>span]:text-accent",
  "footer-description":
    "m-0 max-w-[390px] text-[var(--text-inverse-secondary)] text-[length:var(--font-size-body)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] font-normal",
  "footer-navigation": "footer-navigation min-w-0 self-start text-left",
  "footer-heading":
    "footer-heading mb-[14px] text-highlight text-[length:var(--font-size-compact-title)] leading-[var(--leading-compact-title)] font-bold tracking-[var(--tracking-heading)]",
  "footer-links":
    "footer-links grid justify-items-start gap-[14px] text-[length:var(--font-size-control)] leading-[var(--leading-body)] font-bold [&_a]:w-fit [&_a]:min-h-[24px] [&_a]:inline-flex [&_a]:items-center [&_a]:transition-colors [&_a]:duration-[var(--motion-duration-base)] [&_a]:ease-[var(--motion-ease-standard)] [&_a:hover]:text-highlight [&_a:focus-visible]:text-highlight touch:[&_a:hover:not(:focus-visible)]:text-white touch:[&_a:active]:text-highlight",
  "footer-social-link": "footer-social-link gap-[var(--space-2)] [&>svg]:flex-none",
  "footer-bottom":
    "footer-bottom col-span-full py-[var(--space-footer-bottom)] border-t border-[rgba(255,255,255,0.22)] [&_small]:text-[var(--text-inverse-tertiary)] [&_small]:text-[length:var(--font-size-caption)] [&_small]:leading-[var(--leading-body)] [&_small]:tracking-[var(--tracking-body)] [&_small]:font-normal",
} as const;
