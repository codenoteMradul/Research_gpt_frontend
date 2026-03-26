"use client";

import { AnimatePresence, motion } from "framer-motion";
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
    <main className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 px-4 py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_38%),radial-gradient(circle_at_75%_25%,rgba(59,130,246,0.16),transparent_24%)]" />
      <section className="grid flex-1 gap-6 lg:items-start lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_460px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-panel flex min-h-[80vh] flex-col rounded-[32px] border shadow-lg shadow-black/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl lg:h-[calc(100vh-2rem)]"
        >
          <div className="border-b border-[var(--border)] px-4 pb-5 pt-4 sm:px-6 sm:pt-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Context-Preserving AI Research
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#f9fafb]">
                Research deeply without losing the thread
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Ask layered questions, keep your context visible, and explore terms
                without breaking the flow of the conversation.
              </p>
            </div>
          </div>

          <div
            ref={historyRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 pb-24 pt-6 pr-1 scroll-smooth sm:px-6"
          >
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>
            {isSending ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-xl"
              >
                <div className="shimmer mb-3 h-3 w-24 rounded-full bg-white/8" />
                <div className="space-y-3">
                  <div className="shimmer h-4 rounded-full bg-white/8" />
                  <div className="shimmer h-4 w-11/12 rounded-full bg-white/8" />
                  <div className="shimmer h-4 w-8/12 rounded-full bg-white/8" />
                </div>
              </motion.div>
            ) : null}
          </div>

          <div className="relative sticky bottom-0 px-4 pb-4 pt-6 sm:px-6 sm:pb-6">
            <div className="pointer-events-none absolute inset-x-0 bottom-full h-16 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/55 to-transparent" />
            <div className="rounded-[28px] border border-white/10 bg-[#060b16]/88 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-4">
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
                  className="min-h-[92px] w-full resize-none rounded-[22px] border border-white/10 bg-[#050816] px-4 py-3 text-[15px] leading-7 text-[#f9fafb] placeholder:text-[#7f8aa3] outline-none shadow-inner shadow-black/20 transition-all duration-300 focus:border-green-400/60 focus:ring-2 focus:ring-green-500/50 focus:shadow-[0_0_0_1px_rgba(74,222,128,0.22),0_0_24px_rgba(34,197,94,0.14)]"
                />
                <div className="flex items-center justify-between gap-3 px-1">
                  <p className="text-xs text-[#8b97b0]">
                    Press Enter to send, Shift + Enter for a new line
                  </p>
                  <motion.button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending}
                    whileHover={{ scale: isSending ? 1 : 1.05 }}
                    whileTap={{ scale: isSending ? 1 : 0.95 }}
                    className="rounded-full bg-[#22c55e] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:bg-[#16a34a] hover:shadow-xl hover:shadow-green-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending ? "Thinking..." : "Send"}
                  </motion.button>
                </div>
                {chatError ? (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-[var(--danger)]"
                  >
                    {chatError}
                  </motion.p>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>

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
