// PromptKit's basic suggestion variant, styled with the app's own button tokens.
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function PromptSuggestion({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
