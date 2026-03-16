"use client";

import type { ChatMessage } from "@/app/types";

type MessageBubbleProps = {
  message: ChatMessage;
  selectedText: string | null;
  onExplain: (selection: string, context: string, messageId: string) => void;
};

const tokenPattern = /(\s+|[^\w]+)/g;
const headingPattern = /^(Overview|Key points|Example):$/i;

export function MessageBubble({
  message,
  selectedText,
  onExplain,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const normalizedSelection = selectedText?.trim().toLowerCase() ?? "";
  const lines = message.content.split("\n");

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
          isUser ? "whitespace-pre-wrap" : "cursor-text whitespace-pre-wrap"
        }`}
        onMouseUp={handleSelection}
      >
        {isUser
          ? message.content
          : lines.map((line, lineIndex) => {
              const pieces = line.split(tokenPattern).filter(Boolean);
              const isHeading = headingPattern.test(line.trim());

              if (pieces.length === 0) {
                return <div key={`${message.id}-line-${lineIndex}`}>&nbsp;</div>;
              }

              return (
                <div
                  key={`${message.id}-line-${lineIndex}`}
                  className={isHeading ? "font-semibold" : ""}
                >
                  {pieces.map((piece, pieceIndex) => {
                    const isWord = /\w/.test(piece);
                    const highlighted =
                      normalizedSelection.length > 0 &&
                      normalizedSelection
                        .split(/\s+/)
                        .includes(piece.toLowerCase());

                    if (!isWord) {
                      return (
                        <span key={`${message.id}-${lineIndex}-${pieceIndex}`}>
                          {piece}
                        </span>
                      );
                    }

                    return (
                      <span
                        key={`${message.id}-${lineIndex}-${pieceIndex}`}
                        className={`rounded-md px-0.5 transition-colors ${
                          highlighted
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : ""
                        } hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]`}
                        onClick={() =>
                          onExplain(piece, message.content, message.id)
                        }
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
              );
            })}
      </div>
    </article>
  );
}
