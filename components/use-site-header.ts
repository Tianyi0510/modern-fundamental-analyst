"use client";

import { useEffect, useRef, useState, type PointerEventHandler } from "react";

const menuControlMotionMs = 180;

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [controlMotion, setControlMotion] = useState<"idle" | "opening" | "closing">("idle");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const scrollPositionRef = useRef(0);
  const controlMotionTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (controlMotionTimerRef.current !== null) window.clearTimeout(controlMotionTimerRef.current);
  }, []);

  const runControlMotion = (motion: "opening" | "closing", complete: () => void) => {
    if (controlMotion !== "idle") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      complete();
      return;
    }
    setControlMotion(motion);
    controlMotionTimerRef.current = window.setTimeout(() => {
      complete();
      setControlMotion("idle");
      controlMotionTimerRef.current = null;
    }, menuControlMotionMs);
  };

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyOverflow = document.body.style.overflow;
    const scrollPosition = scrollPositionRef.current;
    const trigger = triggerRef.current;
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.body.style.overflow = previousBodyOverflow;
      window.scrollTo({ top: scrollPosition, left: 0, behavior: "instant" });
      window.removeEventListener("keydown", handleKeyboard);
      trigger?.focus();
    };
  }, [isOpen]);

  const handlePointerDown: PointerEventHandler<HTMLElement> = (event) => {
    if (event.pointerType !== "touch") return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp: PointerEventHandler<HTMLElement> = (event) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || event.pointerType !== "touch") return;
    const horizontalDistance = event.clientX - start.x;
    const verticalDistance = Math.abs(event.clientY - start.y);
    if (horizontalDistance >= 72 && horizontalDistance > verticalDistance * 1.2) setIsOpen(false);
  };

  const handlePointerCancel: PointerEventHandler<HTMLElement> = () => {
    pointerStartRef.current = null;
  };

  return {
    close: () => setIsOpen(false),
    closeWithMotion: () => runControlMotion("closing", () => setIsOpen(false)),
    closeButtonRef,
    controlMotion,
    drawerRef,
    handlePointerCancel,
    handlePointerDown,
    handlePointerUp,
    isOpen,
    open: () => {
      scrollPositionRef.current = window.scrollY;
      runControlMotion("opening", () => setIsOpen(true));
    },
    triggerRef,
  };
}

export function useLanguageMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const focusItem = (position: "first" | "last") => {
    requestAnimationFrame(() => {
      const items = containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      const index = position === "first" ? 0 : (items?.length ?? 1) - 1;
      items?.[index]?.focus();
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const items = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      if (!items.length) return;
      event.preventDefault();
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? (currentIndex + 1) % items.length : (currentIndex - 1 + items.length) % items.length;
      items[nextIndex]?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [isOpen]);

  return {
    close: () => setIsOpen(false),
    containerRef,
    focusItem,
    isOpen,
    open: () => setIsOpen(true),
    toggle: () => setIsOpen((current) => !current),
    triggerRef,
  };
}
