import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Message, MessageContent } from "../../components/prompt-kit/message";
import { Markdown } from "../../components/prompt-kit/markdown";
import { PromptSuggestion } from "../../components/prompt-kit/prompt-suggestion";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "../../components/prompt-kit/chat-container";
import { askWorkspaceAgent } from "../../server/functions/workspace";
import { Button } from "../../components/workspace-ui";

const modeLabels = {
  mock: "Local analysis · no model call",
  live: "Live provider · paid model calls",
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: readonly { path: string; title: string }[];
}

export default function AgentPage({ context }: { context?: string }) {
  const [draft, setDraft] = useState(
    context
      ? "Help me understand this record, its blockers, and the next steps to resolve them."
      : "",
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"mock" | "live" | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => controller.current?.abort();
  }, []);
  useEffect(() => {
    if (!pending) input.current?.focus({ preventScroll: true });
  }, [pending]);
  useEffect(() => {
    if (!input.current) return;
    input.current.style.height = "auto";
    input.current.style.height = `${input.current.scrollHeight}px`;
  }, [draft]);

  async function submit(text = draft) {
    if (!text.trim() || controller.current) return;
    const request = new AbortController();
    controller.current = request;
    setPending(true);
    setError("");
    setDraft("");
    setMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), role: "user", text },
    ]);

    try {
      const result = await askWorkspaceAgent({
        data: { text, page: context ?? "/agent" },
        signal: request.signal,
      });

      if (controller.current !== request) return;

      if (result.ok) {
        setMode(result.value.mode);
        setMessages((items) => [
          ...items,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: result.value.text,
            sources: result.value.sources,
          },
        ]);
      } else {
        setError(result.message);
        setDraft(text);
      }
    } catch {
      if (controller.current === request) {
        setError("Could not send. Your draft is restored; try again.");
        setDraft(text);
      }
    } finally {
      if (controller.current === request) {
        controller.current = null;
        setPending(false);
        input.current?.focus({ preventScroll: true });
      }
    }
  }

  function stop() {
    controller.current?.abort();
    controller.current = null;
    setPending(false);
    setDraft(messages.findLast((m) => m.role === "user")?.text ?? "");
    setError("Response stopped. Edit your draft and try again.");
  }

  return (
    <section className="agent-page" aria-label="Workspace agent">
      <div className="agent-header">
        <h1>Workspace agent</h1>
        <div className="agent-header-actions">
          {context ? (
            <Link
              className="agent-record-link"
              to={context}
              aria-label="Open related record"
            >
              Related record ↗
            </Link>
          ) : null}
          <Button
            className="agent-new-chat"
            aria-label="New chat"
            title="New chat"
            onClick={() => {
              controller.current?.abort();
              controller.current = null;
              setPending(false);
              setMessages([]);
              setDraft("");
              setError("");
              setMode(null);
              input.current?.focus({ preventScroll: true });
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        </div>
      </div>
      <ChatContainerRoot
        className="agent-conversation"
        aria-label="Agent conversation"
        aria-live="polite"
      >
        <ChatContainerContent className="agent-messages">
          {!messages.length ? (
            <div className="agent-empty">
              <h2>What can I help with?</h2>
              <div className="agent-suggestions">
                {[
                  ["Production blockers", "What is blocking production?"],
                  [
                    "Related tickets",
                    "Which tickets are related to these deployments?",
                  ],
                  ["Approval process", "Explain the approval process"],
                ].map(([label, prompt]) => (
                  <PromptSuggestion
                    key={prompt}
                    onClick={() => void submit(prompt)}
                  >
                    {label}
                  </PromptSuggestion>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <Message className={`agent-message ${m.role}`} key={m.id}>
                <div>
                  <strong>{m.role === "user" ? "You" : "Agent"}</strong>
                  <MessageContent>
                    {m.role === "assistant" ? (
                      <Markdown id={m.id}>{m.text}</Markdown>
                    ) : (
                      m.text
                    )}
                  </MessageContent>
                  {m.sources ? (
                    <div className="related-links">
                      {m.sources.map((source) => (
                        <Link key={source.path} to={source.path}>
                          {source.title}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Message>
            ))
          )}
          {pending ? <output>Reading workspace context…</output> : null}
        </ChatContainerContent>
      </ChatContainerRoot>
      <div className="agent-input">
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <textarea
            aria-label="Ask the workspace agent"
            id="agent-draft"
            ref={input}
            rows={1}
            value={draft}
            maxLength={4000}
            disabled={pending}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder="Message the agent…"
          />
          <div className="actions">
            {pending ? (
              <Button
                className="agent-send"
                onClick={stop}
                aria-label="Stop response"
                title="Stop response"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </Button>
            ) : (
              <Button
                className="primary agent-send"
                aria-label="Send message"
                title="Send message"
                type="submit"
                disabled={!draft.trim()}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m6 12 6-6 6 6M12 6v13" />
                </svg>
              </Button>
            )}
          </div>
        </form>
        <div className="agent-footer">
          <span>{mode ? modeLabels[mode] : ""}</span>
          <span className="agent-keyboard-hint">
            Enter to send · Shift + Enter for a new line
          </span>
        </div>
      </div>
    </section>
  );
}
