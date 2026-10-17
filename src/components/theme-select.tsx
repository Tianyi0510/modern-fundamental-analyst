"use client";

import { useEffect, useId, useImperativeHandle, useRef, type Ref } from "react";
import { useTheme } from "next-themes";
import { Field, FieldLabel } from "./ui/field";
import { NativeSelect } from "./ui/native-select";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: { label: "Appearance", system: "System", light: "Light", dark: "Dark" },
  "zh-tw": { label: "外觀", system: "跟隨系統", light: "淺色", dark: "深色" },
  "zh-cn": { label: "外观", system: "跟随系统", light: "浅色", dark: "深色" },
};

export function ThemeSelect({
  locale,
  compact = false,
  selectRef,
}: {
  locale: Locale;
  compact?: boolean;
  selectRef?: Ref<HTMLSelectElement>;
}) {
  const id = useId();
  const { theme, setTheme } = useTheme();
  const control = useRef<HTMLSelectElement>(null);
  const initialized = useRef(false);
  useImperativeHandle(selectRef, () => control.current!, []);
  useEffect(() => {
    const select = control.current;
    if (!select) return;
    const preferred = theme ?? "system";
    // Respect a native choice made before hydration; otherwise restore the saved preference.
    if (!initialized.current && select.value !== "system" && select.value !== preferred) {
      initialized.current = true;
      setTheme(select.value);
      return;
    }
    initialized.current = true;
    select.value = preferred;
  }, [theme, setTheme]);
  const text = copy[locale];
  return (
    <Field className={compact ? "w-[110px] gap-0" : "w-full"}>
      <FieldLabel htmlFor={id} className={compact ? "sr-only" : undefined}>
        {text.label}
      </FieldLabel>
      <NativeSelect ref={control} id={id} defaultValue="system" onChange={(event) => setTheme(event.target.value)}>
        <option value="system">{text.system}</option>
        <option value="light">{text.light}</option>
        <option value="dark">{text.dark}</option>
      </NativeSelect>
    </Field>
  );
}
