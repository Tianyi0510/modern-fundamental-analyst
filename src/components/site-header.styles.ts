import { containerAppearance } from "./container";
import motion from "./site-header.module.css";

const controlText = "text-[length:var(--font-size-control)] leading-[var(--leading-body)] font-bold";
const focusMarker = "focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-[0.2em]";
const iconButton = `relative size-[46px] border border-black rounded-pill place-items-center text-black touch-manipulation [&>svg]:size-[23px] ${motion.iconButton}`;
export const desktopNavigationLink = `relative min-h-[var(--size-control-small)] px-[12px] rounded-pill inline-flex items-center whitespace-nowrap hover:bg-[color-mix(in_srgb,var(--bright-blue)_26%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--bright-blue)_26%,transparent)] aria-[current=page]:bg-[color-mix(in_srgb,var(--bright-blue)_42%,var(--white))] hover:text-accent focus-visible:text-accent aria-[current=page]:text-accent active:bg-highlight active:text-black ${motion.desktopLink}`;
export const mobileNavigationLink = `min-h-[56px] px-[var(--space-2)] grid grid-cols-[minmax(0,1fr)] items-center whitespace-nowrap outline-none bg-transparent text-black hover:text-accent focus-visible:text-accent active:text-accent aria-[current=page]:text-accent ${focusMarker} ${motion.mobileLink}`;
export const languageChoice = `min-h-[var(--size-field)] px-[16px] flex items-center justify-between gap-[var(--space-4)] data-[highlighted]:bg-[var(--gray)] data-[highlighted]:text-brand hover:bg-[var(--gray)] hover:text-brand focus-visible:bg-[var(--gray)] focus-visible:text-brand focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[calc(var(--focus-ring-width)*-2)] aria-[current=page]:bg-[color-mix(in_srgb,var(--bright-blue)_20%,var(--white))] aria-[current=page]:text-brand [&+a]:border-t [&+a]:border-[var(--gray)] [&>svg]:size-[18px] [&>svg]:text-accent ${controlText} ${motion.dropdownItem}`;
export const appearance = {
  shell: containerAppearance,
  wordmark:
    "wordmark justify-self-start whitespace-nowrap text-[length:var(--font-size-compact-title)] leading-[var(--leading-compact-title)] font-bold tracking-[var(--tracking-heading)] [&>span]:text-accent nav-compact:ps-[calc(var(--space-2)/2)] nav-compact:min-w-0 nav-compact:max-w-full nav-compact:whitespace-normal nav-compact:[overflow-wrap:anywhere]",
  "mobile-menu-button": `mobile-menu-button hidden nav-compact:grid bg-white ${iconButton} ${motion.openButton}`,
  "mobile-menu-close": `mobile-menu-close grid shrink-0 outline-none bg-highlight ${iconButton} ${motion.closeButton}`,
  "mobile-menu-touch-ring": `mobile-menu-touch-ring absolute -inset-[6px] border-2 border-accent rounded-[inherit] pointer-events-none opacity-0 ${motion.touchRing}`,
  "header-actions": `header-actions min-w-0 justify-self-end flex items-center justify-end gap-[var(--space-3)] nav-compact:hidden ${controlText}`,
  "language-trigger": `language-trigger min-h-[var(--size-control-small)] px-[11px] rounded-pill inline-flex items-center gap-[7px] whitespace-nowrap hover:bg-[color-mix(in_srgb,var(--bright-blue)_18%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--bright-blue)_18%,transparent)] aria-expanded:bg-[color-mix(in_srgb,var(--bright-blue)_18%,transparent)] hover:text-accent focus-visible:text-accent aria-expanded:text-accent [&>svg]:size-[14px] ${controlText} ${motion.languageTrigger}`,
  "mobile-menu-layer": `mobile-menu-layer hidden nav-compact:block fixed inset-0 z-[100]`,
  "mobile-menu-close-icon": `mobile-menu-close-icon col-start-1 row-start-1 ${motion.closeIcon}`,
  "mobile-menu-return-icon": `mobile-menu-return-icon col-start-1 row-start-1 opacity-0 ${motion.returnIcon}`,
  "mobile-language-disclosure": `mobile-language-disclosure ${controlText} ${motion.languageDisclosure}`,
  "mobile-menu-language": `mobile-menu-language min-h-[48px] px-[var(--space-2)] outline-none text-black flex items-center hover:text-accent focus-visible:text-accent active:text-accent ${controlText} ${focusMarker} ${motion.mobileLink}`,
  "site-header":
    "site-header h-[84px] grid grid-cols-[auto_minmax(0,1fr)] items-center nav-compact:relative nav-compact:z-[90] nav-compact:w-[min(720px,calc(100%-var(--space-page-gutter)*2))] nav-compact:h-auto nav-compact:min-h-[70px] nav-compact:grid-cols-[minmax(0,1fr)_auto] nav-compact:gap-x-[var(--space-3)] nav-compact:py-[var(--space-2)] bg-white",
  "mobile-menu-wordmark": "mobile-menu-wordmark",
  "language-menu": "language-menu relative nav-compact:hidden",
  "mobile-menu-drawer": "mobile-menu-drawer absolute inset-0 w-full h-dvh min-h-full text-black flex flex-col isolate",
  "mobile-menu-top":
    "mobile-menu-top relative z-[2] min-h-[70px] px-[var(--space-page-gutter)] py-[var(--space-2)] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--space-3)] shrink-0 bg-white",
  "mobile-menu-content":
    "mobile-menu-content relative min-h-0 px-[var(--space-page-gutter)] pb-[max(16px,env(safe-area-inset-bottom))] bg-white flex flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]",
  "mobile-language-links": "mobile-language-links relative z-[1] mt-auto grid",
  "mobile-language-options": "mobile-language-options grid",
} as const;
