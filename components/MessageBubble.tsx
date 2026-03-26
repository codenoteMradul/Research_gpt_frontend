"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/app/types";
import { FormattedExplanation } from "./FormattedExplanation";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      layout
      className={`max-w-3xl rounded-[28px] border px-5 py-4 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        isUser
          ? "ml-auto border-green-400/20 bg-gradient-to-br from-[#166534] to-[#14532d] text-[#f0fdf4]"
          : "border-white/10 bg-white/5 text-[var(--foreground)] backdrop-blur-xl"
      }`}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#9ca3af]">
        {isUser ? "Researcher" : "AI Analyst"}
      </p>
      {isUser ? (
        <div className="whitespace-pre-wrap text-[15px] leading-7">
          {message.content}
        </div>
      ) : (
        <FormattedExplanation text={message.content} />
      )}
    </motion.article>
  );
}
