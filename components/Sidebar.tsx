"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ChatSessionSummary } from "@/app/types";

type SidebarProps = {
  chats: ChatSessionSummary[];
  activeChatId: string | null;
  isLoading: boolean;
  onCreateChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
};

export function Sidebar({
  chats,
  activeChatId,
  isLoading,
  onCreateChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: SidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel flex h-full min-h-[320px] w-full flex-col rounded-[24px] border p-3 shadow-lg shadow-black/20 lg:h-[calc(100vh-2rem)]"
    >
      <div className="border-b border-white/8 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Chats
        </p>
        <button
          type="button"
          onClick={onCreateChat}
          className="mt-2.5 w-full rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-[#f3f4f6] transition hover:border-green-400/25 hover:bg-green-500/8 hover:text-green-200"
        >
          New Chat
        </button>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="shimmer h-16 rounded-[16px] border border-white/8 bg-white/[0.04]"
              />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-[var(--muted)]">
            No chats yet. Start a new conversation to build your history.
          </div>
        ) : (
          <div className="space-y-2.5">
            {chats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = chat.id === editingChatId;

              return (
                <div
                  key={chat.id}
                  className={`rounded-[18px] border px-3 py-2.5 transition ${
                    isActive
                      ? "border-green-400/25 bg-green-500/[0.07] shadow-[0_0_0_1px_rgba(34,197,94,0.06)]"
                      : "border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const nextTitle = draftTitle.trim();

                        if (!nextTitle) {
                          return;
                        }

                        onRenameChat(chat.id, nextTitle);
                        setEditingChatId(null);
                        setDraftTitle("");
                      }}
                      className="space-y-2"
                    >
                      <input
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        autoFocus
                        className="w-full rounded-[12px] border border-white/10 bg-[#050816] px-3 py-2 text-sm text-white outline-none focus:border-green-400/45"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChatId(null);
                            setDraftTitle("");
                          }}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[var(--muted)] transition hover:bg-white/[0.06]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-full bg-[#16a34a] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#15803d]"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onSelectChat(chat.id)}
                        className="w-full text-left"
                      >
                        <p className="truncate text-[13px] font-medium text-[#f9fafb]">
                          {chat.title}
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--muted)]">
                          {formatLastUpdated(chat.updatedAt)}
                        </p>
                      </button>
                      <div className="mt-1.5 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChatId(chat.id);
                            setDraftTitle(chat.title);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/8 text-[var(--muted)] transition hover:bg-white/[0.05] hover:text-white"
                          aria-label={`Rename ${chat.title}`}
                          title="Rename chat"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <path d="M3.5 13.5V16.5H6.5L14.5 8.5L11.5 5.5L3.5 13.5Z" />
                            <path d="M10.5 6.5L13.5 9.5" />
                            <path d="M12.5 4.5L15.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteChat(chat.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/8 text-[var(--muted)] transition hover:border-rose-400/20 hover:bg-rose-500/8 hover:text-rose-200"
                          aria-label={`Delete ${chat.title}`}
                          title="Delete chat"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <path d="M4.5 6H15.5" />
                            <path d="M8 3.5H12" />
                            <path d="M6.5 6L7 15.5H13L13.5 6" />
                            <path d="M8.5 8.5V13" />
                            <path d="M11.5 8.5V13" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

function formatLastUpdated(updatedAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(updatedAt));
}
