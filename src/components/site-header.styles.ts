import { containerAppearance } from "./container";
import motion from "./site-header.module.css";

const controlText = "text-control";
const focusMarker =
  "focus-visible:outline-solid focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-accent focus-visible:outline-offset-[calc(var(--focus-ring-width)*-1)]";
const iconButton = `relative size-[46px] border border-[var(--border-strong)] rounded-pill place-items-center text-ink touch-manipulation [&>svg]:size-[23px] ${motion.iconButton}`;
export const desktopNavigationLink = `relative min-h-[var(--size-control-small)] px-[12px] rounded-pill inline-flex items-center whitespace-nowrap hover:bg-[var(--surface-selected)] focus-visible:bg-[var(--surface-selected)] aria-[current=page]:bg-[var(--surface-selected)] hover:text-accent focus-visible:text-accent aria-[current=page]:text-accent active:bg-highlight active:text-[var(--black)] ${motion.desktopLink}`;
export const languageChoice = `min-h-[var(--size-field)] px-[16px] flex items-center justify-between gap-[var(--space-4)] data-[highlighted]:bg-selected data-[highlighted]:text-brand hover:bg-selected hover:text-brand focus-visible:bg-selected focus-visible:text-brand focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[calc(var(--focus-ring-width)*-2)] aria-[current=page]:bg-selected aria-[current=page]:text-brand [&+a]:border-t [&+a]:border-[var(--border-subtle)] [&>svg]:size-[18px] [&>svg]:text-accent ${controlText} ${motion.dropdownItem}`;
export const appearance = {
  shell: containerAppearance,
  // Keep the SVG artwork centered beside the circular controls.
  wordmark:
    "wordmark block w-[var(--width-brand-logo)] max-w-full justify-self-start nav-compact:ps-[calc(var(--space-2)/2)] nav-compact:min-w-0",
  "mobile-menu-button": `mobile-menu-button hidden nav-compact:grid bg-surface ${iconButton} ${motion.openButton}`,
  "mobile-menu-close": `mobile-menu-close grid shrink-0 outline-none bg-highlight ${iconButton} ${motion.closeButton}`,
  "mobile-menu-touch-ring": `mobile-menu-touch-ring absolute -inset-[6px] border-2 border-[var(--focus-ring-brand)] rounded-[inherit] pointer-events-none opacity-0 ${motion.touchRing}`,
  "header-actions": `header-actions min-w-0 justify-self-end flex items-center justify-end gap-[var(--space-3)] nav-compact:hidden ${controlText}`,
  "language-trigger": `language-trigger min-h-[var(--size-control-small)] px-[11px] rounded-pill inline-flex items-center gap-[7px] whitespace-nowrap hover:bg-[var(--surface-selected)] focus-visible:bg-[var(--surface-selected)] aria-expanded:bg-[var(--surface-selected)] hover:text-accent focus-visible:text-accent aria-expanded:text-accent [&>svg]:size-[14px] ${controlText} ${motion.languageTrigger}`,
  "mobile-menu-layer": `mobile-menu-layer hidden nav-compact:block`,
  "mobile-menu-close-icon": `mobile-menu-close-icon col-start-1 row-start-1 ${motion.closeIcon}`,
  "mobile-menu-return-icon": `mobile-menu-return-icon col-start-1 row-start-1 opacity-0 ${motion.returnIcon}`,
  "mobile-language-disclosure": `mobile-language-disclosure [&_svg]:size-[18px] ${controlText} ${motion.languageDisclosure}`,
  "mobile-menu-language": `mobile-menu-language min-h-[var(--size-touch-target)] pl-[42px] pr-[var(--space-3)] rounded-control outline-none text-ink flex items-center hover:bg-[var(--sidebar-hover-surface)] focus-visible:bg-[var(--sidebar-hover-surface)] active:bg-[var(--sidebar-pressed-surface)] hover:text-accent focus-visible:text-accent active:text-accent ${controlText} ${focusMarker} ${motion.mobileLink}`,
  "site-header":
    "site-header h-[84px] grid grid-cols-[auto_minmax(0,1fr)] items-center nav-compact:relative nav-compact:z-[var(--layer-navigation)] nav-compact:w-[min(720px,calc(100%-var(--space-page-gutter)*2))] nav-compact:h-auto nav-compact:min-h-[70px] nav-compact:grid-cols-[minmax(0,1fr)_auto] nav-compact:gap-x-[var(--space-3)] nav-compact:py-[var(--space-2)] bg-surface",
  "mobile-menu-wordmark": "mobile-menu-wordmark",
  "language-menu": "language-menu relative nav-compact:hidden",
  "mobile-menu-drawer": "mobile-menu-drawer absolute inset-0 w-full h-dvh min-h-full text-ink flex flex-col isolate",
  "mobile-menu-top":
    "mobile-menu-top relative z-[2] min-h-[70px] px-[var(--space-page-gutter)] py-[var(--space-2)] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--space-3)] shrink-0 bg-surface",
  "mobile-menu-content":
    "mobile-menu-content relative min-h-0 px-[var(--space-page-gutter)] pt-[var(--space-3)] pb-[max(24px,env(safe-area-inset-bottom))] bg-surface flex flex-1 flex-col gap-[var(--space-5)] overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]",
  "mobile-language-links":
    "mobile-language-links relative z-[1] mt-auto grid shrink-0 rounded-[var(--radius-menu)] bg-[var(--sidebar-language-surface)] p-[var(--space-2)]",
  "mobile-language-options": "mobile-language-options grid",
} as const;
