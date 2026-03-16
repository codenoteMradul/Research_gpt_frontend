"use client";

import type { ChatMessage } from "@/app/types";

type MessageBubbleProps = {
  message: ChatMessage;
  selectedText: string | null;
  onExplain: (selection: string, context: string, messageId: string) => void;
};

const tokenPattern = /(\s+|[^\w]+)/g;

export function MessageBubble({
  message,
  selectedText,
  onExplain,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const normalizedSelection = selectedText?.trim().toLowerCase() ?? "";
  const pieces = message.content.split(tokenPattern).filter(Boolean);

  const handleSelection = () => {
    if (isUser) {
      return;
    }

    const selection = window.getSelection()?.toString().trim();

    if (selection && message.content.includes(selection)) {
      onExplain(selection, message.content, message.id);
      window.getSelection()?.removeAllRanges();
    }
  };

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
      <div
        className={`text-[15px] leading-7 ${
          isUser ? "whitespace-pre-wrap" : "cursor-text"
        }`}
        onMouseUp={handleSelection}
      >
        {isUser
          ? message.content
          : pieces.map((piece, index) => {
              const isWord = /\w/.test(piece);
              const highlighted =
                normalizedSelection.length > 0 &&
                normalizedSelection.split(/\s+/).includes(piece.toLowerCase());

              if (!isWord) {
                return <span key={`${message.id}-${index}`}>{piece}</span>;
              }

              return (
                <span
                  key={`${message.id}-${index}`}
                  className={`rounded-md px-0.5 transition-colors ${
                    highlighted ? "bg-[var(--accent-soft)] text-[var(--accent)]" : ""
                  } hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]`}
                  onClick={() => onExplain(piece, message.content, message.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onExplain(piece, message.content, message.id);
                    }
                  }}
                >
                  {piece}
                </span>
              );
            })}
      </div>
      {!isUser ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Click a word, or drag across multiple words, to open a side explanation.
        </p>
      ) : null}
    </article>
  );
}
