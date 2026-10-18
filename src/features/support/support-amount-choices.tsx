"use client";

import { useContext, useId, useSyncExternalStore } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SupportChoiceLock } from "./support-checkout-form";
import { appearance } from "./support-panel.styles";

const subscribe = () => () => {};
const hydratedSnapshot = () => true;
const serverSnapshot = () => false;

export function SupportAmountChoices({
  choices,
  initialChoice,
  disabled,
  label,
}: {
  choices: Array<{ value: string; amount: number }>;
  initialChoice: string;
  disabled: boolean;
  label: string;
}) {
  const hydrated = useSyncExternalStore(subscribe, hydratedSnapshot, serverSnapshot);
  const id = useId();
  const locked = useContext(SupportChoiceLock);
  const options = choices.map(({ value, amount }) => (
    <label className={appearance["support-amount-option"]} htmlFor={`${id}-${value}`} key={value}>
      {hydrated ? (
        <RadioGroupItem id={`${id}-${value}`} value={value} className="sr-only" aria-label={`USD ${amount}`} />
      ) : (
        <input
          id={`${id}-${value}`}
          type="radio"
          name="product_id"
          value={value}
          defaultChecked={value === initialChoice}
        />
      )}
      <span>USD</span>
      <strong>${amount}</strong>
    </label>
  ));
  return hydrated ? (
    <RadioGroup
      name="product_id"
      defaultValue={initialChoice}
      disabled={disabled || locked}
      aria-label={label}
      className={appearance["support-amounts"]}
    >
      {options}
    </RadioGroup>
  ) : (
    <div className={appearance["support-amounts"]}>{options}</div>
  );
}
