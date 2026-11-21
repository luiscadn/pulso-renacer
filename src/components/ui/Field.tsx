"use client";
import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

type Props = {
  label: string;
  ayuda?: ReactNode;
  error?: string;
  opcional?: boolean;
  /** Un único control (Input, Textarea, Select). Recibe id, aria-describedby y aria-invalid. */
  children: ReactElement<Record<string, unknown>>;
};

export function Field({ label, ayuda, error, opcional, children }: Props) {
  const id = useId();
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: (children.props.id as string | undefined) ?? id,
        "aria-describedby": [idAyuda, idError].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children;
  const idControl = (isValidElement(children) && (children.props.id as string | undefined)) || id;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idControl} className="text-base font-medium text-texto">
        {label}
        {opcional && <span className="font-normal text-texto-suave"> (opcional)</span>}
      </label>
      {ayuda && (
        <p id={idAyuda} className="text-sm text-texto-suave">
          {ayuda}
        </p>
      )}
      {control}
      {error && (
        <p id={idError} className="text-sm font-medium text-rojo-texto">
          {error}
        </p>
      )}
    </div>
  );
}
