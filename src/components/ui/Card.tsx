import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl2 border border-borde bg-white p-4 shadow-suave", className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-snug", className)} {...rest} />;
}
