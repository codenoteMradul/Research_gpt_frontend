"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { explainSelection, sendChatMessage } from "@/api";
import type { ChatMessage, ExplainState } from "@/app/types";
import { ExplanationPanel } from "./ExplanationPanel";
import { MessageBubble } from "./MessageBubble";

const starterPrompt =
  "Explain JavaScript features like dynamic typing, closures, and platform independence.";

const starterAssistantMessage =
  "JavaScript is a versatile language used for interactive web apps, servers, and tooling. It supports dynamic typing, first-class functions, closures, and platform independent runtimes through engines like V8.";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-starter",
      role: "assistant",
      content: starterAssistantMessage,
    },
  ]);
  const [input, setInput] = useState(starterPrompt);
  const [chatError, setChatError] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [activeExplain, setActiveExplain] = useState<ExplainState | null>(null);
  const [isSending, startSending] = useTransition();
  const [isExplaining, startExplaining] = useTransition();
  const historyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isSending) {
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    const nextHistory = [...messages, nextUserMessage];
    setMessages(nextHistory);
    setInput("");
    setChatError(null);

    startSending(async () => {
      try {
        const { response } = await sendChatMessage(
          trimmedInput,
          messages.map(({ role, content }) => ({ role, content })),
        );

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response,
          },
        ]);
      } catch (error) {
        setChatError(
          error instanceof Error
            ? error.message
            : "We could not get a response from the backend.",
        );
        setMessages((current) =>
          current.filter((message) => message.id !== nextUserMessage.id),
        );
        setInput(trimmedInput);
      }
    });
  };

  const handleExplain = (
    selection: string,
    context: string,
    messageId: string,
  ) => {
    const nextExplainState = {
      selection,
      context,
      messageId,
    };

    setActiveExplain(nextExplainState);
    setExplanation(null);
    setPanelError(null);

    startExplaining(async () => {
      try {
        const { explanation: nextExplanation } = await explainSelection(
          selection,
          context,
        );
        setExplanation(nextExplanation);
      } catch (error) {
        setPanelError(
          error instanceof Error
            ? error.message
            : "We could not explain the selected term.",
        );
      }
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <div className="glass-panel flex min-h-[80vh] flex-col rounded-[32px] border p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border)] pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Context-Preserving AI Research
            </p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Research deeply without losing the thread
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  Ask a question in the main chat, then inspect words or phrases
                  in a side panel so follow-up meaning checks never derail the
                  core conversation.
                </p>
              </div>
              <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--muted)]">
                Backend: <span className="font-medium text-[var(--foreground)]">REST + OpenAI</span>
              </div>
            </div>
          </div>

          <div
            ref={historyRef}
            className="flex-1 space-y-4 overflow-y-auto pr-1"
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                selectedText={
                  activeExplain?.messageId === message.id
                    ? activeExplain.selection
                    : null
                }
                onExplain={handleExplain}
              />
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <div className="flex flex-col gap-3">
              <label htmlFor="message" className="text-sm font-medium">
                Main research prompt
              </label>
              <textarea
                id="message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask the AI to explain a topic..."
                className="min-h-28 rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--muted)]">
                  Press Enter to send. Shift+Enter adds a new line.
                </p>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? "Thinking..." : "Send"}
                </button>
              </div>
              {chatError ? (
                <p className="text-sm text-rose-700">{chatError}</p>
              ) : null}
            </div>
          </div>
        </div>

        <ExplanationPanel
          isOpen={Boolean(activeExplain)}
          selection={activeExplain?.selection ?? null}
          explanation={explanation}
          isLoading={isExplaining}
          error={panelError}
          onClose={() => {
            setActiveExplain(null);
            setExplanation(null);
            setPanelError(null);
          }}
        />
      </section>
    </main>
  );
}
