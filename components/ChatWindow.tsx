"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createShareChat, explainSelection, sendChatMessage } from "@/api";
import type { ChatMessage, ContextTab, SearchDepth } from "@/app/types";
import { useAuth } from "@/context/authContext";
import { saveChatMessages } from "@/services/chatService";
import { useChatStore } from "@/store/chatStore";
import { ExplanationPanel } from "./ExplanationPanel";
import { MessageBubble } from "./MessageBubble";
import { Sidebar } from "./Sidebar";

export function ChatWindow() {
  const router = useRouter();
  const { bootstrapped, isAuthenticated } = useAuth();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<SearchDepth>("shallow");
  const [tabs, setTabs] = useState<ContextTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSending, startSending] = useTransition();
  const [isExplaining, setIsExplaining] = useState(false);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const {
    activeChat,
    activeChatId,
    chatList,
    messages,
    isLoading,
    error: historyError,
    createNewChat,
    switchChat,
    hydrateSession,
    setOptimisticMessages,
    renameChat,
    deleteChat,
  } = useChatStore(bootstrapped && isAuthenticated);

  useEffect(() => {
    if (!bootstrapped) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [bootstrapped, isAuthenticated, router]);

  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    setQuery("");
    setDepth("shallow");
    setPanelError(null);
    setTabs([]);
    setActiveTabId(null);
    setShareUrl(null);
    setShareStatus(null);
    setIsShareModalOpen(false);
    setChatError(null);
  }, [activeChatId]);

  const handleSend = () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isSending || !activeChatId) {
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    const chatId = activeChatId;
    const historySnapshot = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    setOptimisticMessages(chatId, (current) => [...current, nextUserMessage]);
    setInput("");
    setChatError(null);

    startSending(async () => {
      try {
        const { response } = await sendChatMessage(trimmedInput, historySnapshot);
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response,
        };

        const session = await saveChatMessages(chatId, [
          { role: nextUserMessage.role, content: nextUserMessage.content },
          { role: assistantMessage.role, content: assistantMessage.content },
        ]);

        hydrateSession(session);
      } catch (error) {
        setChatError(
          error instanceof Error
            ? error.message
            : "We could not get a response from the backend.",
        );
        setOptimisticMessages(chatId, (current) =>
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

  const handleShare = async () => {
    if (messages.length === 0 || isSharing) {
      return;
    }

    setIsSharing(true);
    setShareStatus(null);

    try {
      const { url } = await createShareChat(
        messages.map(({ role, content }) => ({ role, content })),
      );

      setShareUrl(url);
      setIsShareModalOpen(true);
      setShareStatus("Share link ready.");
    } catch (error) {
      setShareStatus(
        error instanceof Error ? error.message : "Could not share this chat.",
      );
      setIsShareModalOpen(true);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Link copied!");
    } catch {
      setShareStatus("Could not copy the link.");
    }
  };

  if (!bootstrapped || !isAuthenticated) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-[var(--muted)]">
          Loading your workspace...
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_38%),radial-gradient(circle_at_75%_25%,rgba(59,130,246,0.16),transparent_24%)]" />
      <section className="grid flex-1 gap-6 lg:items-start lg:grid-cols-[300px_minmax(0,1fr)_380px] xl:grid-cols-[320px_minmax(0,1fr)_460px]">
        <Sidebar
          chats={chatList}
          activeChatId={activeChatId}
          isLoading={isLoading}
          onCreateChat={() => {
            void createNewChat();
          }}
          onSelectChat={(chatId) => {
            void switchChat(chatId);
          }}
          onDeleteChat={(chatId) => {
            void deleteChat(chatId);
          }}
          onRenameChat={(chatId, title) => {
            void renameChat(chatId, title);
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-panel flex min-h-[80vh] flex-col rounded-[32px] border shadow-lg shadow-black/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl lg:h-[calc(100vh-2rem)]"
        >
          <div className="border-b border-[var(--border)] px-4 pb-5 pt-4 sm:px-6 sm:pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {shareUrl ? (
                    <span className="rounded-full border border-green-400/20 bg-green-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-green-300">
                      Shared
                    </span>
                  ) : null}
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#f9fafb]">
                  {activeChat?.title ?? "Mradul GPT"}
                </h1>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {activeChat
                    ? "Your conversations are saved and can be resumed from the sidebar."
                    : "Start a conversation to create your first saved chat."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <motion.button
                  type="button"
                  onClick={handleShare}
                  disabled={messages.length === 0 || isSharing}
                  whileHover={{ scale: messages.length === 0 || isSharing ? 1 : 1.03 }}
                  whileTap={{ scale: messages.length === 0 || isSharing ? 1 : 0.97 }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#e5e7eb] shadow-lg shadow-black/20 transition-all duration-300 hover:border-green-400/20 hover:bg-green-500/10 hover:text-green-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSharing ? "Sharing..." : "Share Chat"}
                </motion.button>
              </div>
            </div>
          </div>

          <div
            ref={historyRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 pb-24 pt-6 pr-1 scroll-smooth sm:px-6"
          >
            <AnimatePresence initial={false}>
              {historyError ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                >
                  {historyError}
                </motion.p>
              ) : null}
              {!historyError && messages.length === 0 && !isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-[var(--muted)]"
                >
                  Start a new chat from the sidebar or ask your first question here.
                </motion.div>
              ) : null}
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
                    disabled={isSending || isLoading || !activeChatId}
                    whileHover={{ scale: isSending || isLoading || !activeChatId ? 1 : 1.05 }}
                    whileTap={{ scale: isSending || isLoading || !activeChatId ? 1 : 0.95 }}
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

      <AnimatePresence>
        {isShareModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0b1120]/95 p-6 shadow-2xl shadow-black/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Share Chat
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#f9fafb]">
                    Create a read-only link
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:bg-white/[0.08] hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {shareUrl ? (
                  <>
                    <div className="rounded-[20px] border border-white/10 bg-[#050816] p-4">
                      <p className="text-sm leading-6 text-[#c7d2e1] break-all">
                        {shareUrl}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#e5e7eb] transition hover:bg-white/[0.08]"
                      >
                        Copy Link
                      </button>
                      <a
                        href={shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#15803d]"
                      >
                        Open Link
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                    {shareStatus ?? "Could not generate a share link."}
                  </div>
                )}

                {shareStatus ? (
                  <p className="text-sm text-[var(--muted)]">{shareStatus}</p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
