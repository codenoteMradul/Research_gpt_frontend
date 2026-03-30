import type {
  ChatMessage,
  ChatSession,
  ChatSessionSummary,
  PersistedChatMessage,
} from "@/app/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type RequestError = {
  message?: string | string[];
};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    try {
      const parsed = JSON.parse(errorText) as RequestError;
      const message = Array.isArray(parsed.message)
        ? parsed.message.join(", ")
        : parsed.message;

      throw new Error(message || "Request failed.");
    } catch {
      throw new Error(errorText || "Request failed.");
    }
  }

  return response.json() as Promise<T>;
}

export function createChatSession(title?: string) {
  return request<ServerChatSession>("/chats", {
    method: "POST",
    body: JSON.stringify(title ? { title } : {}),
  }).then(normalizeSession);
}

export function listChatSessions() {
  return request<ChatSessionSummary[]>("/chats", {
    method: "GET",
  });
}

export function getChatSession(id: string) {
  return request<ServerChatSession>(`/chats/${id}`, {
    method: "GET",
  }).then(normalizeSession);
}

export function saveChatMessages(
  chatId: string,
  messages: PersistedChatMessage[],
) {
  return request<ServerChatSession>("/messages", {
    method: "POST",
    body: JSON.stringify({
      chatId,
      messages,
    }),
  }).then(normalizeSession);
}

export function renameChatSession(id: string, title: string) {
  return request<ServerChatSession>(`/chats/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  }).then(normalizeSession);
}

export function deleteChatSession(id: string) {
  return request<{ success: true }>(`/chats/${id}`, {
    method: "DELETE",
  });
}

type ServerChatSession = {
  id: string;
  title: string;
  messages: PersistedChatMessage[];
  createdAt: string;
  updatedAt: string;
};

function normalizeSession(session: ServerChatSession): ChatSession {
  return {
    ...session,
    messages: session.messages.map(normalizeMessage),
  };
}

function normalizeMessage(message: PersistedChatMessage): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: message.role,
    content: message.content,
  };
}
