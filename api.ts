import type { ChatMessage } from "./app/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type ChatRequestMessage = Pick<ChatMessage, "role" | "content">;

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed.");
  }

  return response.json() as Promise<T>;
}

export function sendChatMessage(message: string, history: ChatRequestMessage[]) {
  return request<{ response: string }>("/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      history,
    }),
  });
}

export function explainSelection(word: string, context: string) {
  return request<{ explanation: string }>("/explain", {
    method: "POST",
    body: JSON.stringify({
      word,
      context,
    }),
  });
}
