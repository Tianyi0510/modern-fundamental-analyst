import { containerAppearance } from "../container";
import motion from "./site-header.module.css";

const controlText = "text-medium-label";
const focusMarker =
  "focus-visible:outline-solid focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-accent focus-visible:outline-offset-[calc(var(--focus-ring-width)*-1)]";
const iconButton = `relative size-[44px] border border-[var(--border-strong)] rounded-pill place-items-center text-ink touch-manipulation [&>svg]:size-[20px] ${motion.iconButton}`;
export const desktopNavigationLink = `relative min-h-[var(--size-control-small)] px-[var(--space-16px)] rounded-pill inline-flex items-center whitespace-nowrap hover:bg-[var(--surface-selected)] focus-visible:bg-[var(--surface-selected)] aria-[current=page]:bg-[var(--surface-selected)] hover:text-accent focus-visible:text-accent aria-[current=page]:text-accent active:bg-highlight active:text-[var(--black)] ${motion.desktopLink}`;
export const languageChoice = `min-h-[var(--size-field)] px-[var(--space-16px)] flex items-center justify-between gap-[var(--space-16px)] data-[highlighted]:bg-selected data-[highlighted]:text-brand hover:bg-selected hover:text-brand focus-visible:bg-selected focus-visible:text-brand focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[calc(var(--focus-ring-width)*-2)] aria-[current=page]:bg-selected aria-[current=page]:text-brand [&+a]:border-t [&+a]:border-[var(--border-subtle)] [&>svg]:size-[18px] [&>svg]:text-accent ${controlText} ${motion.dropdownItem}`;
export const appearance = {
  shell: containerAppearance,
  // Keep the text wordmark aligned with the page grid.
  wordmark: "wordmark min-[1280px]:shrink-0 my-[var(--space-site-bar)] block w-fit max-w-full nav-compact:min-w-0",
  "mobile-menu-button": `mobile-menu-button hidden shrink-0 nav-compact:grid group-data-compact/header:grid bg-surface ${iconButton} ${motion.openButton}`,
  "mobile-menu-close": `mobile-menu-close grid shrink-0 outline-none bg-highlight ${iconButton} ${motion.closeButton}`,
  "mobile-menu-touch-ring": `mobile-menu-touch-ring absolute -inset-[6px] border-2 border-[var(--focus-ring-brand)] rounded-[inherit] pointer-events-none opacity-0 ${motion.touchRing}`,
  "header-actions": `header-actions absolute right-0 w-max group-data-compact/header:invisible flex items-center justify-end gap-[var(--space-8px)] nav-compact:hidden ${controlText}`,
  "language-trigger": `language-trigger min-h-[var(--size-control-small)] px-[var(--space-8px)] rounded-pill inline-flex items-center gap-[var(--space-8px)] whitespace-nowrap hover:bg-[var(--surface-selected)] focus-visible:bg-[var(--surface-selected)] aria-expanded:bg-[var(--surface-selected)] hover:text-accent focus-visible:text-accent aria-expanded:text-accent [&>svg]:size-[14px] ${controlText} ${motion.languageTrigger}`,
  "mobile-menu-layer": `mobile-menu-layer`,
  "mobile-menu-close-icon": `mobile-menu-close-icon col-start-1 row-start-1 ${motion.closeIcon}`,
  "mobile-menu-return-icon": `mobile-menu-return-icon col-start-1 row-start-1 opacity-0 ${motion.returnIcon}`,
  "mobile-language-disclosure": `mobile-language-disclosure [--language-icon-size:18px] [&_svg]:size-[var(--language-icon-size)] ${controlText} ${motion.languageDisclosure}`,
  "mobile-menu-language": `mobile-menu-language min-h-[var(--size-touch-target)] ps-[calc(var(--space-8px)*2+var(--language-icon-size))] pr-[var(--space-8px)] rounded-control outline-none text-ink flex items-center hover:bg-[var(--sidebar-hover-surface)] focus-visible:bg-[var(--sidebar-hover-surface)] active:bg-[var(--sidebar-pressed-surface)] hover:text-accent focus-visible:text-accent active:text-accent ${controlText} ${focusMarker} ${motion.mobileLink}`,
  "site-header":
    "site-header group/header relative flex items-center justify-between gap-[var(--space-8px)] data-compact:z-[var(--layer-navigation)] nav-compact:z-[var(--layer-navigation)] bg-surface",
  "mobile-menu-wordmark": "mobile-menu-wordmark",
  "language-menu": "language-menu relative nav-compact:hidden",
  "mobile-menu-drawer": "mobile-menu-drawer absolute inset-0 w-full h-dvh min-h-full text-ink flex flex-col isolate",
  "mobile-menu-top":
    "mobile-menu-top relative z-[2] px-[max(var(--space-page-gutter),calc((100%_-_var(--width-content))/2))] compact:px-[max(var(--space-page-gutter),calc((100%_-_var(--width-content-compact))/2))] flex items-center justify-between gap-[var(--space-8px)] shrink-0 bg-surface",
  "mobile-menu-content":
    "mobile-menu-content relative min-h-0 px-[var(--space-page-gutter)] pt-[var(--space-8px)] pb-[max(24px,env(safe-area-inset-bottom))] bg-surface flex flex-1 flex-col gap-[var(--space-24px)] overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]",
  "mobile-language-links":
    "mobile-language-links relative z-[1] w-full grid shrink-0 rounded-[var(--radius-menu)] bg-[var(--sidebar-language-surface)] p-[var(--space-8px)]",
  "mobile-language-options": "mobile-language-options grid",
} as const;
