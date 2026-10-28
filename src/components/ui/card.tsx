import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-xl border border-border bg-card p-6", className)}
      {...props}
    />
  );
}
export function Badge({ children }: ComponentProps<"span">) {
  return (
    <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}
