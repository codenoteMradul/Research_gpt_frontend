"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { explainSelection, sendChatMessage } from "@/api";
import type { ChatMessage, ContextTab, SearchDepth } from "@/app/types";
import { ExplanationPanel } from "./ExplanationPanel";
import { MessageBubble } from "./MessageBubble";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<SearchDepth>("shallow");
  const [tabs, setTabs] = useState<ContextTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();
  const [isExplaining, setIsExplaining] = useState(false);
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

  const handleSearch = async () => {
    const nextQuery = query.trim();

    if (!nextQuery) {
      return;
    }

    const currentTopic =
      [...messages].reverse().find((message) => message.role === "assistant")
        ?.content ?? "general";
    const normalizedQuery = nextQuery.toLowerCase();
    const existingTab = tabs.find(
      (tab) =>
        tab.query.trim().toLowerCase() === normalizedQuery &&
        tab.depth === depth &&
        tab.context === currentTopic,
    );

    if (existingTab) {
      setActiveTabId(existingTab.id);
      setQuery(existingTab.query);
      setDepth(existingTab.depth);
      setPanelError(null);
      return;
    }

    setIsExplaining(true);
    setPanelError(null);

    try {
      const { explanation: nextExplanation } = await explainSelection(
        nextQuery,
        currentTopic,
        depth,
      );
      const nextTab: ContextTab = {
        id: crypto.randomUUID(),
        query: nextQuery,
        explanation: nextExplanation,
        context: currentTopic,
        depth,
      };

      setTabs((current) => [...current, nextTab]);
      setActiveTabId(nextTab.id);
    } catch (error) {
      setPanelError(
        error instanceof Error
          ? error.message
          : "We could not explain the selected term.",
      );
    } finally {
      setIsExplaining(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setDepth("shallow");
    setPanelError(null);
    setTabs([]);
    setActiveTabId(null);
  };

  const handleActivateTab = (tabId: string) => {
    const nextTab = tabs.find((tab) => tab.id === tabId);

    if (!nextTab) {
      return;
    }

    setActiveTabId(tabId);
    setQuery(nextTab.query);
    setDepth(nextTab.depth);
    setPanelError(null);
  };

  const handleCloseTab = (tabId: string) => {
    setTabs((current) => {
      const closingIndex = current.findIndex((tab) => tab.id === tabId);
      const nextTabs = current.filter((tab) => tab.id !== tabId);

      if (tabId !== activeTabId) {
        return nextTabs;
      }

      const fallbackTab =
        nextTabs[closingIndex] ?? nextTabs[closingIndex - 1] ?? null;

      setActiveTabId(fallbackTab?.id ?? null);
      setQuery(fallbackTab?.query ?? "");
      setDepth(fallbackTab?.depth ?? "shallow");

      return nextTabs;
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <section className="grid flex-1 gap-6 lg:items-start lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <div className="glass-panel flex min-h-[80vh] flex-col rounded-[32px] border p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-2 border-b border-[var(--border)] pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Context-Preserving AI Research
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Research deeply without losing the thread
            </h1>
          </div>

          <div
            ref={historyRef}
            className="flex-1 space-y-4 overflow-y-auto pr-1"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <div className="flex flex-col gap-3">
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
              <div className="flex justify-end">
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
          query={query}
          depth={depth}
          tabs={tabs}
          activeTabId={activeTabId}
          isLoading={isExplaining}
          error={panelError}
          onQueryChange={setQuery}
          onDepthChange={setDepth}
          onSearch={handleSearch}
          onClear={handleClear}
          onActivateTab={handleActivateTab}
          onCloseTab={handleCloseTab}
        />
      </section>
    </main>
  );
}
