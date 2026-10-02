import { useId, type ReactElement, type ReactNode, cloneElement } from "react";
import { Field, FieldLabel } from "./ui/field";

export function FormField({
  label,
  children,
  className,
  visibility = "visible",
}: {
  label: ReactNode;
  children: ReactElement<{ id?: string }>;
  className?: string;
  visibility?: "visible" | "hidden";
}) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id} className={visibility === "hidden" ? "sr-only" : undefined}>
        {label}
      </FieldLabel>
      {cloneElement(children, { id })}
    </Field>
  );
}
