"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatMessage, ChatSession, ChatSessionSummary } from "@/app/types";
import {
  createChatSession,
  deleteChatSession,
  getChatSession,
  listChatSessions,
  renameChatSession,
} from "@/services/chatService";

const ACTIVE_CHAT_STORAGE_KEY = "research-gpt-active-chat-id";

export function useChatStore() {
  const [chatList, setChatList] = useState<ChatSessionSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sessions = await listChatSessions();
        const storedActiveId =
          window.localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
        const initialActiveId =
          (storedActiveId &&
          sessions.some((session) => session.id === storedActiveId)
            ? storedActiveId
            : sessions[0]?.id) ?? null;

        setChatList(sessions);

        if (initialActiveId) {
          const session = await getChatSession(initialActiveId);
          setActiveChatId(session.id);
          setMessages(session.messages);
          setChatList((current) => {
            const nextSummary: ChatSessionSummary = {
              id: session.id,
              title: session.title,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt,
            };
            const remaining = current.filter((chat) => chat.id !== session.id);
            return [nextSummary, ...remaining].sort((left, right) =>
              right.updatedAt.localeCompare(left.updatedAt),
            );
          });
        } else {
          const session = await createChatSession();
          setActiveChatId(session.id);
          setMessages(session.messages);
          setChatList([
            {
              id: session.id,
              title: session.title,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt,
            },
          ]);
        }
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not load chat history.",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      window.localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, activeChatId);
      return;
    }

    window.localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
  }, [activeChatId]);

  const activeChat = useMemo(() => {
    return chatList.find((chat) => chat.id === activeChatId) ?? null;
  }, [activeChatId, chatList]);

  async function createNewChat() {
    try {
      const session = await createChatSession();
      applySession(session);
      return session;
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not create a new chat.",
      );
      throw nextError;
    }
  }

  async function switchChat(chatId: string) {
    if (chatId === activeChatId) {
      return;
    }

    try {
      const session = await getChatSession(chatId);
      applySession(session);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not open chat.",
      );
      throw nextError;
    }
  }

  function applySession(session: ChatSession) {
    setActiveChatId(session.id);
    setMessages(session.messages);
    upsertSessionSummary(session);
    setError(null);
  }

  function hydrateSession(session: ChatSession) {
    if (session.id === activeChatId) {
      setMessages(session.messages);
    }

    upsertSessionSummary(session);
  }

  function setOptimisticMessages(
    chatId: string,
    updater: (current: ChatMessage[]) => ChatMessage[],
  ) {
    if (chatId !== activeChatId) {
      return;
    }

    setMessages((current) => updater(current));
  }

  async function renameChat(chatId: string, title: string) {
    try {
      const session = await renameChatSession(chatId, title);
      hydrateSession(session);
      return session;
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not rename chat.",
      );
      throw nextError;
    }
  }

  async function deleteChat(chatId: string) {
    try {
      await deleteChatSession(chatId);

      const remainingChats = chatList.filter((chat) => chat.id !== chatId);
      setChatList(remainingChats);

      if (chatId !== activeChatId) {
        return;
      }

      const nextChatId = remainingChats[0]?.id ?? null;

      if (!nextChatId) {
        const session = await createChatSession();
        applySession(session);
        return;
      }

      const session = await getChatSession(nextChatId);
      applySession(session);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not delete chat.",
      );
      throw nextError;
    }
  }

  function upsertSessionSummary(session: ChatSession) {
    setChatList((current) => {
      const nextSummary: ChatSessionSummary = {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
      const remaining = current.filter((chat) => chat.id !== session.id);
      return [nextSummary, ...remaining].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );
    });
  }

  return {
    activeChat,
    activeChatId,
    chatList,
    error,
    isLoading,
    messages,
    createNewChat,
    switchChat,
    hydrateSession,
    setMessages,
    setOptimisticMessages,
    renameChat,
    deleteChat,
  };
}
