"use client";
import { useState, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";
import { clasesControl } from "./Input";

/** Área de texto con contador de caracteres (requiere maxLength). */
export function Textarea({
  className,
  maxLength,
  defaultValue,
  value,
  onChange,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { maxLength: number }) {
  const [largo, setLargo] = useState(String(value ?? defaultValue ?? "").length);
  const cerca = largo >= maxLength * 0.9;
  return (
    <div className="flex flex-col gap-1">
      <textarea
        className={cn(clasesControl, "min-h-32 py-3 leading-relaxed", className)}
        maxLength={maxLength}
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => {
          setLargo(e.target.value.length);
          onChange?.(e);
        }}
        {...rest}
      />
      <p className={cn("self-end text-sm", cerca ? "font-medium text-amarillo-texto" : "text-texto-suave")} aria-live="polite">
        {largo} / {maxLength}
      </p>
    </div>
  );
}
