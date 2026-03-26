import type { ChatMessage } from "@/app/types";
import { MessageBubble } from "./MessageBubble";

type SharedChatViewProps = {
  messages: ChatMessage[];
};

export function SharedChatView({ messages }: SharedChatViewProps) {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_38%),radial-gradient(circle_at_75%_25%,rgba(59,130,246,0.16),transparent_24%)]" />
      <section className="glass-panel flex min-h-[80vh] flex-col rounded-[32px] border shadow-lg shadow-black/30">
        <div className="border-b border-[var(--border)] px-4 pb-5 pt-4 sm:px-6 sm:pt-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Shared Conversation
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c7d2e1]">
                Read Only
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#f9fafb]">
              Shared AI chat
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              This conversation was shared with a read-only link.
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
              message={{
                id: `${message.role}-${index}`,
                role: message.role,
                content: message.content,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
