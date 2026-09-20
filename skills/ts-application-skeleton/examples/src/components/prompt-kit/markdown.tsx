// Adapted from PromptKit Markdown; render whole documents for reference-link correctness.
import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib/utils";

const components: Components = {
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-4"
    >
      {children}
    </a>
  ),
  // Provider text cannot embed tracking images or arbitrary HTML.
  img: ({ alt }) => <span className="text-slate-500">[Image: {alt || "image"}]</span>,
  pre: ({ children }) => (
    <pre className="my-4 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6">
      {children}
    </pre>
  ),
};

export const Markdown = memo(function Markdown({
  children,
  id,
  className,
}: {
  children: string;
  id?: string;
  className?: string;
}) {
  return (
    <div id={id} className={cn("chat-markdown", className)}>
      <ReactMarkdown skipHtml remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
});
