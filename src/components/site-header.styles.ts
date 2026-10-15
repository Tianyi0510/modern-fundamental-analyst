import { containerAppearance } from "./container";
import motion from "./site-header.module.css";

const controlText = "text-control";
const focusMarker = "focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-[0.2em]";
const iconButton = `relative size-[46px] border border-strong rounded-pill place-items-center text-ink touch-manipulation [&>svg]:size-[23px] ${motion.iconButton}`;
export const desktopNavigationLink = `relative min-h-[var(--size-control-small)] px-[var(--space-150)] rounded-pill inline-flex items-center whitespace-nowrap hover:bg-[var(--surface-nav-hover)] focus-visible:bg-[var(--surface-state-focus)] aria-[current=page]:bg-[var(--surface-nav-current)] hover:text-interactive focus-visible:text-interactive aria-[current=page]:text-interactive active:bg-surface-highlight active:text-ink ${motion.desktopLink}`;
export const languageChoice = `min-h-[var(--size-field)] px-[var(--space-200)] flex items-center justify-between gap-[var(--space-200)] data-[highlighted]:bg-[var(--surface-neutral)] data-[highlighted]:text-brand hover:bg-[var(--surface-neutral)] hover:text-brand focus-visible:bg-[var(--surface-neutral)] focus-visible:text-brand focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[calc(var(--focus-ring-width)*-2)] aria-[current=page]:bg-[var(--surface-language-current)] aria-[current=page]:text-brand [&+a]:border-t [&+a]:border-[var(--border-subtle)] [&>svg]:size-[18px] [&>svg]:text-accent ${controlText} ${motion.dropdownItem}`;
export const appearance = {
  shell: containerAppearance,
  wordmark:
    "wordmark justify-self-start whitespace-nowrap text-title-small tracking-[var(--tracking-brand)] [&>span]:text-accent nav-compact:ps-[calc(var(--space-100)/2)] nav-compact:min-w-0 nav-compact:max-w-full nav-compact:whitespace-normal nav-compact:[overflow-wrap:anywhere]",
  "mobile-menu-button": `mobile-menu-button hidden nav-compact:grid bg-surface ${iconButton} ${motion.openButton}`,
  "mobile-menu-close": `mobile-menu-close grid shrink-0 outline-none bg-surface-highlight ${iconButton} ${motion.closeButton}`,
  "mobile-menu-touch-ring": `mobile-menu-touch-ring absolute -inset-[6px] border-2 border-accent rounded-[inherit] pointer-events-none opacity-0 ${motion.touchRing}`,
  "header-actions": `header-actions min-w-0 justify-self-end flex items-center justify-end gap-[var(--space-150)] nav-compact:hidden ${controlText}`,
  "language-trigger": `language-trigger min-h-[var(--size-control-small)] px-[var(--space-150)] rounded-pill inline-flex items-center gap-[var(--space-100)] whitespace-nowrap hover:bg-[var(--surface-control-hover)] focus-visible:bg-[var(--surface-state-focus)] aria-expanded:bg-[var(--surface-language-current)] hover:text-interactive focus-visible:text-interactive aria-expanded:text-interactive [&>svg]:size-[14px] ${controlText} ${motion.languageTrigger}`,
  "mobile-menu-layer": `mobile-menu-layer hidden nav-compact:block`,
  "mobile-menu-close-icon": `mobile-menu-close-icon col-start-1 row-start-1 ${motion.closeIcon}`,
  "mobile-menu-return-icon": `mobile-menu-return-icon col-start-1 row-start-1 opacity-0 ${motion.returnIcon}`,
  "mobile-language-disclosure": `mobile-language-disclosure ${controlText} ${motion.languageDisclosure}`,
  "mobile-menu-language": `mobile-menu-language min-h-[48px] px-[var(--space-100)] outline-none text-ink flex items-center hover:text-interactive focus-visible:text-interactive active:text-interactive ${controlText} ${focusMarker} ${motion.mobileLink}`,
  "site-header":
    "site-header h-[84px] grid grid-cols-[auto_minmax(0,1fr)] items-center nav-compact:relative nav-compact:z-[var(--layer-navigation)] nav-compact:w-[min(720px,calc(100%-var(--space-page-gutter)*2))] nav-compact:h-auto nav-compact:min-h-[70px] nav-compact:grid-cols-[minmax(0,1fr)_auto] nav-compact:gap-x-[var(--space-150)] nav-compact:py-[var(--space-100)] bg-surface",
  "mobile-menu-wordmark": "mobile-menu-wordmark",
  "language-menu": "language-menu relative nav-compact:hidden",
  "mobile-menu-drawer": "mobile-menu-drawer absolute inset-0 w-full h-dvh min-h-full text-ink flex flex-col isolate",
  "mobile-menu-top":
    "mobile-menu-top relative z-[2] min-h-[70px] px-[var(--space-page-gutter)] py-[var(--space-100)] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--space-150)] shrink-0 bg-surface",
  "mobile-menu-content":
    "mobile-menu-content relative min-h-0 px-[var(--space-page-gutter)] pb-[max(16px,env(safe-area-inset-bottom))] bg-surface flex flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]",
  "mobile-language-links": "mobile-language-links relative z-[1] mt-auto grid",
  "mobile-language-options": "mobile-language-options grid",
} as const;
