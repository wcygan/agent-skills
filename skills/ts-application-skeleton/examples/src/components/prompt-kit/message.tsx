// Adapted from PromptKit's Message and MessageContent; see UPSTREAM.md.
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Message({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex gap-3", className)} {...props} />;
}

export function MessageContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("min-w-0 rounded-2xl text-sm leading-7 break-words", className)}
      {...props}
    />
  );
}
