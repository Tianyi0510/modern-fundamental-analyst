import { useId, type ComponentProps, type ReactElement, type ReactNode, cloneElement } from "react";
import { Field, FieldError, FieldLabel } from "./ui/field";

export function FormField({
  label,
  children,
  className,
  visibility = "visible",
  error,
}: {
  label: ReactNode;
  children: ReactElement<Pick<ComponentProps<"input">, "id" | "aria-describedby" | "aria-invalid">>;
  className?: string;
  visibility?: "visible" | "hidden";
  error?: string;
}) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  const errorId = `${id}-error`;
  const describedBy = [children.props["aria-describedby"], error ? errorId : undefined].filter(Boolean).join(" ");
  return (
    <Field className={className} data-invalid={error ? "" : undefined}>
      <FieldLabel htmlFor={id} className={visibility === "hidden" ? "sr-only" : undefined}>
        {label}
      </FieldLabel>
      {cloneElement(children, {
        id,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby": describedBy || undefined,
      })}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </Field>
  );
}
