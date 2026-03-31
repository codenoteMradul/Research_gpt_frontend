"use client";

import { ChatMessage } from "./ChatMessage";

export function FormattedExplanation({ text }: { text: string }) {
  return <ChatMessage content={text} />;
}
