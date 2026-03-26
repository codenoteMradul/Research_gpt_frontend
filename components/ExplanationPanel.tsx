"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ContextTab, SearchDepth } from "@/app/types";
import { FormattedExplanation } from "./FormattedExplanation";

type ExplanationPanelProps = {
  query: string;
  depth: SearchDepth;
  tabs: ContextTab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;
  onQueryChange: (value: string) => void;
  onDepthChange: (value: SearchDepth) => void;
  onSearch: () => void;
  onClear: () => void;
  onActivateTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
};

export function ExplanationPanel({
  query,
  depth,
  tabs,
  activeTabId,
  isLoading,
  error,
  onQueryChange,
  onDepthChange,
  onSearch,
  onClear,
  onActivateTab,
  onCloseTab,
}: ExplanationPanelProps) {
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

  return (
    <motion.aside
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
      className="glass-panel flex min-h-[320px] w-full flex-col rounded-[32px] border p-6 shadow-xl shadow-black/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl lg:sticky lg:top-4 lg:h-[80vh] lg:self-start lg:w-[380px] xl:w-[460px]"
      style={{
        boxShadow: `0 24px 80px rgba(2, 6, 23, 0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px var(--panel-glow)`,
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Context Panel
          </p>
          <h2 className="mt-1.5 text-[30px] font-semibold tracking-tight text-[#f9fafb]">
            Search
          </h2>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] text-[15px] text-[var(--foreground)] backdrop-blur-xl">
        <div className="z-10 shrink-0 space-y-3 overflow-hidden border-b border-white/10 bg-[#020617]/78 p-4 shadow-md shadow-black/20 backdrop-blur-md">
          <motion.div
            layout
            className="flex flex-wrap items-center gap-2 rounded-[18px] border border-white/8 bg-white/[0.025] p-2"
          >
            {tabs.length === 0 ? (
              <motion.span
                initial={{ opacity: 0.55 }}
                animate={{ opacity: [0.45, 0.75, 0.45] }}
                transition={{
                  duration: 2.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="px-3 py-1 text-xs text-[var(--muted)]"
              >
                No context tabs yet
              </motion.span>
            ) : (
              tabs.map((tab) => {
                const isActive = tab.id === activeTabId;

                return (
                  <motion.div
                    layout
                    key={tab.id}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                      isActive
                        ? "border-green-400/60 bg-green-500/18 text-green-300 shadow-lg shadow-green-500/20"
                        : "border-white/8 bg-[#111827]/85 text-[var(--muted)] hover:scale-[1.02] hover:border-[#374151] hover:bg-[#1f2937]"
                    }`}
                    whileHover={{ scale: isActive ? 1.02 : 1.03 }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => onActivateTab(tab.id)}
                      whileTap={{ scale: 0.97 }}
                      className="max-w-28 truncate text-left outline-none"
                      title={`${tab.query} (${formatDepthLabel(tab.depth)})`}
                    >
                      {tab.query}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => onCloseTab(tab.id)}
                      whileTap={{ scale: 0.92 }}
                      className="rounded-full px-1 text-[10px] transition hover:bg-[#1f2937]"
                      aria-label={`Close ${tab.query} tab`}
                    >
                      x
                    </motion.button>
                  </motion.div>
                );
              })
            )}
            <span className="ml-auto rounded-full border border-dashed border-white/10 bg-[#1a2234] px-3 py-1 text-xs text-[var(--muted)]">
              +
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="flex flex-col gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] p-3.5 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
          >
            <label
              htmlFor="context-panel-query"
              className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]"
            >
              Search term
            </label>
            <input
              id="context-panel-query"
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSearch();
                }
              }}
              placeholder="Type or paste a term to explain..."
              className="w-full rounded-[16px] border border-white/10 bg-[#070d1a] px-3.5 py-3 text-sm text-[#f9fafb] placeholder:text-[#8a94ab] outline-none shadow-inner shadow-black/20 transition-all duration-300 focus:border-green-400/60 focus:ring-2 focus:ring-green-500/45 focus:shadow-[0_0_0_1px_rgba(74,222,128,0.24),0_0_24px_rgba(34,197,94,0.14)]"
            />
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                Depth
              </p>
              <div className="flex flex-wrap gap-2">
                {DEPTH_OPTIONS.map((option) => {
                  const isActive = option.value === depth;

                  return (
                    <motion.label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                        isActive
                          ? "border-green-400/70 bg-green-500/18 text-green-300 shadow-lg shadow-green-500/20"
                          : "border-white/8 bg-[#111827]/90 text-[var(--muted)] hover:scale-[1.02] hover:border-[#374151] hover:bg-[#1f2937]"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <input
                        type="radio"
                        name="context-depth"
                        value={option.value}
                        checked={isActive}
                        onChange={() => onDepthChange(option.value)}
                        className="sr-only"
                      />
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isActive ? "bg-[#22c55e]" : "bg-[var(--border-strong)]"
                        }`}
                      />
                      {option.label}
                    </motion.label>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <motion.button
                type="button"
                onClick={onClear}
                disabled={!query.trim() && tabs.length === 0}
                whileHover={{ scale: !query.trim() && tabs.length === 0 ? 1 : 1.04 }}
                whileTap={{ scale: !query.trim() && tabs.length === 0 ? 1 : 0.96 }}
                className="rounded-full border border-white/10 bg-[#111827]/92 px-3.5 py-2 text-xs font-medium text-[var(--muted)] transition-all duration-300 hover:border-[#374151] hover:bg-[#1f2937] hover:text-[#e5e7eb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </motion.button>
              <motion.button
                type="button"
                onClick={onSearch}
                disabled={!query.trim() || isLoading}
                whileHover={{ scale: !query.trim() || isLoading ? 1 : 1.05 }}
                whileTap={{ scale: !query.trim() || isLoading ? 1 : 0.95 }}
                className="rounded-full bg-[#16a34a] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:bg-[#15803d] hover:shadow-xl hover:shadow-green-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Search
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto scroll-smooth p-5">
          <div className="space-y-6">
            <p className="leading-relaxed text-[var(--muted)]">
              Use this panel to manually search for a word or phrase from the chat.
            </p>

            {isLoading ? (
              <div className="space-y-3 rounded-[20px] border border-white/10 bg-[#020617]/80 p-4 shadow-lg shadow-black/20">
                <div className="shimmer h-4 w-32 rounded-full bg-white/8" />
                <div className="shimmer h-4 rounded-full bg-white/8" />
                <div className="shimmer h-4 w-10/12 rounded-full bg-white/8" />
                <div className="shimmer h-4 w-7/12 rounded-full bg-white/8" />
              </div>
            ) : null}
            {!isLoading && error ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="leading-relaxed text-[var(--danger)]"
              >
                {error}
              </motion.p>
            ) : null}
            <AnimatePresence mode="wait">
              {!isLoading && !error && activeTab ? (
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-4 rounded-[20px] border border-white/10 bg-[#020617]/88 p-5 shadow-lg shadow-black/30"
                >
                  <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                    <span className="truncate">Topic: {activeTab.query}</span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-medium text-[#4ade80] shadow-lg shadow-green-500/10">
                      {formatDepthLabel(activeTab.depth)}
                    </span>
                  </div>
                  <FormattedExplanation text={activeTab.explanation} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

const DEPTH_OPTIONS: { value: SearchDepth; label: string }[] = [
  { value: "shallow", label: "Shallow" },
  { value: "deep", label: "Deep" },
  { value: "super", label: "Super Deep" },
];

function formatDepthLabel(depth: SearchDepth) {
  if (depth === "super") {
    return "Super Deep";
  }

  return depth.charAt(0).toUpperCase() + depth.slice(1);
}
