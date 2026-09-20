import { useEffect, useRef, useState } from "react";
import { ChatContainerContent, ChatContainerRoot } from "../../components/prompt-kit/chat-container";
import { Message, MessageContent } from "../../components/prompt-kit/message";
import { Markdown } from "../../components/prompt-kit/markdown";
import { PromptSuggestion } from "../../components/prompt-kit/prompt-suggestion";
import { askAgent } from "../../server/functions/ai";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  model?: string;
}

const suggestions = [
  {
    title: "Make a concept click",
    prompt: "Explain dependency injection using a coffee shop analogy.",
    icon: "↗",
  },
  {
    title: "Find a small starting point",
    prompt: "Suggest three small features for a personal reading app.",
    icon: "✳",
  },
  {
    title: "Write a little code",
    prompt: "Show a small TypeScript function with an explanation.",
    icon: "⌘",
  },
];

export function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const controller = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement | null>(null);

  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    [],
  );

  async function submit() {
    const text = draft.trim();

    if (!text || controller.current) return;
    const request = new AbortController();
    controller.current = request;
    setMessages((items) => [...items, { id: crypto.randomUUID(), role: "user", text }]);
    setDraft("");
    setError("");
    setPending(true);

    try {
      const result = await askAgent({ data: { text }, signal: request.signal });

      if (controller.current !== request) return;

      if (result.ok) {
        setMessages((items) => [
          ...items,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: result.value.text,
            model: result.value.model,
          },
        ]);
      } else {
        setError(`${result.message}${result.requestId ? ` Reference: ${result.requestId}` : ""}`);
        setDraft(text);
      }
    } catch {
      if (controller.current !== request) return;
      setError(
        request.signal.aborted
          ? "Response stopped. You can edit your message and try again."
          : "Could not send your message. Please try again.",
      );
      setDraft(text);
    } finally {
      if (controller.current === request) {
        controller.current = null;
        setPending(false);
        input.current?.focus();
      }
    }
  }

  function stopResponse() {
    controller.current?.abort();
    controller.current = null;
    setPending(false);
    setDraft(messages.findLast((message) => message.role === "user")?.text ?? "");
    setError("Response stopped. You can edit your message and try again.");
    input.current?.focus();
  }

  function clearChat() {
    controller.current?.abort();
    controller.current = null;
    setPending(false);
    setMessages([]);
    setDraft("");
    setError("");
    setCopied("");
    input.current?.focus();
  }

  async function copyMessage(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(message.id);
    } catch {
      setError("Clipboard unavailable. Select the response text to copy it.");
    }
  }

  return (
    <section className="mx-auto max-w-4xl" aria-label="Pi chat">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-xl text-accent"
          >
            ✳
          </span>
          <div>
            <h1 className="text-base font-semibold">Pi, your thinking partner</h1>
            <p className="mt-0.5 text-xs text-slate-500">A little room to think.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearChat}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          ＋ New chat
        </button>
      </div>
      <div className="panel flex h-[min(720px,75dvh)] min-h-[480px] flex-col overflow-hidden">
        <ChatContainerRoot
          className="min-h-0 flex-1"
          aria-label="Conversation"
          aria-live="polite"
          aria-relevant="additions text"
        >
          <ChatContainerContent className="gap-7 p-5 sm:p-8">
            {messages.length === 0 ? (
              <div className="mx-auto w-full max-w-2xl py-2 sm:py-14">
                <p className="eyebrow mb-4">Your next idea starts here</p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  What’s on your mind?
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                  Untangle a concept, sketch an idea, or work through a little code. Start anywhere.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {suggestions.map((suggestion) => (
                    <PromptSuggestion
                      key={suggestion.title}
                      className="flex items-center gap-3 sm:block"
                      onClick={() => {
                        setDraft(suggestion.prompt);
                        input.current?.focus();
                      }}
                    >
                      <span aria-hidden className="block text-xl text-accent sm:mb-4">
                        {suggestion.icon}
                      </span>
                      <span className="block text-xs font-medium leading-5">
                        {suggestion.title}
                      </span>
                    </PromptSuggestion>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  className={message.role === "user" ? "justify-end" : "justify-start"}
                >
                  {message.role === "assistant" && (
                    <span
                      aria-hidden
                      className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-accent"
                    >
                      ✳
                    </span>
                  )}
                  <div className={message.role === "user" ? "max-w-[85%]" : "min-w-0 flex-1"}>
                    <p className="sr-only">{message.role === "user" ? "You" : "Pi"}</p>
                    <MessageContent
                      className={
                        message.role === "user"
                          ? "whitespace-pre-wrap bg-slate-100 px-4 py-2.5 text-slate-700"
                          : "text-slate-700"
                      }
                    >
                      {message.role === "assistant" ? (
                        <Markdown id={`message-${message.id}`}>{message.text}</Markdown>
                      ) : (
                        message.text
                      )}
                    </MessageContent>
                    {message.role === "assistant" && (
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{message.model}</span>
                        <span aria-hidden>·</span>
                        <button
                          type="button"
                          onClick={() => void copyMessage(message)}
                          aria-label="Copy response"
                          className="rounded px-1 py-1 hover:text-accent"
                        >
                          {copied === message.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>
                </Message>
              ))
            )}
            {pending && (
              <output className="flex items-center gap-3 text-sm text-slate-500">
                <span
                  aria-hidden
                  className="size-4 animate-spin rounded-full border-2 border-blue-100 border-t-accent motion-reduce:animate-none"
                />
                Pi is thinking…
              </output>
            )}
          </ChatContainerContent>
        </ChatContainerRoot>
        <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
          {error && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900"
            >
              {error}
            </p>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 focus-within:border-blue-400"
          >
            <label htmlFor="chat-prompt" className="sr-only">
              Message Pi
            </label>
            <textarea
              ref={input}
              id="chat-prompt"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void submit();
                }
              }}
              placeholder="Ask anything, start something…"
              rows={2}
              maxLength={4000}
              disabled={pending}
              className="block max-h-40 min-h-16 w-full resize-y bg-transparent px-1 py-1 text-sm leading-6 outline-none placeholder:text-slate-400 focus-visible:outline-none disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">Shift + Enter for a new line</span>
              {pending ? (
                <button
                  type="button"
                  key="stop"
                  onClick={(event) => {
                    event.preventDefault();
                    stopResponse();
                  }}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-medium text-white"
                >
                  Stop response
                </button>
              ) : (
                <button
                  key="send"
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  className="grid size-9 place-items-center rounded-xl bg-accent text-lg text-white hover:bg-blue-700 disabled:opacity-30"
                >
                  ↑
                </button>
              )}
            </div>
          </form>
          <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
            Each message starts a fresh Pi session. History stays in this tab. No file or shell
            access.
          </p>
        </div>
      </div>
    </section>
  );
}
