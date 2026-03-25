"use client";

import type { ChatMessage } from "@/app/types";
import { FormattedExplanation } from "./FormattedExplanation";
type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={`fade-up max-w-3xl rounded-[28px] border px-5 py-4 shadow-sm ${
        isUser
          ? "ml-auto border-transparent bg-[var(--user-bubble)] text-stone-50"
          : "border-[var(--border)] bg-[var(--assistant-bubble)] text-[var(--foreground)]"
      }`}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] opacity-70">
        {isUser ? "Researcher" : "AI Analyst"}
      </p>
      {isUser ? (
        <div className="whitespace-pre-wrap text-[15px] leading-7">
          {message.content}
        </div>
      ) : (
        <FormattedExplanation text={message.content} />
      )}
    </article>
  );
}
