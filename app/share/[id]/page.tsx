import { notFound } from "next/navigation";
import { SharedChatView } from "@/components/SharedChatView";
import type { ChatMessage } from "@/app/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type SharedChatResponse = {
  id: string;
  messages: Array<Pick<ChatMessage, "role" | "content">>;
  createdAt: string;
};

async function getSharedChat(id: string): Promise<SharedChatResponse> {
  const response = await fetch(`${API_BASE_URL}/share/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Could not load the shared chat.");
  }

  return (await response.json()) as SharedChatResponse;
}

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sharedChat = await getSharedChat(id);

  return (
    <SharedChatView
      messages={sharedChat.messages.map((message, index) => ({
        id: `${message.role}-${index}`,
        role: message.role,
        content: message.content,
      }))}
    />
  );
}
