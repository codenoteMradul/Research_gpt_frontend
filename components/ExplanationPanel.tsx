"use client";

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
    <aside
      className="glass-panel fade-up flex min-h-[320px] flex-col rounded-[32px] border p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]"
      style={{
        boxShadow: `0 18px 45px rgba(45, 35, 15, 0.08), 0 0 0 1px var(--border), 0 20px 60px var(--panel-glow)`,
      }}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Context Panel
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Search</h2>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-5 text-[15px] leading-7 text-[var(--foreground)]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-[var(--border)] bg-white/45 p-3">
            {tabs.length === 0 ? (
              <span className="px-2 py-1 text-sm text-[var(--muted)]">
                No context tabs yet
              </span>
            ) : (
              tabs.map((tab) => {
                const isActive = tab.id === activeTabId;

                return (
                  <div
                    key={tab.id}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-white/70 text-[var(--muted)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onActivateTab(tab.id)}
                      className="max-w-32 truncate text-left outline-none"
                      title={`${tab.query} (${formatDepthLabel(tab.depth)})`}
                    >
                      {tab.query}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCloseTab(tab.id)}
                      className="rounded-full px-1 text-xs transition hover:bg-black/5"
                      aria-label={`Close ${tab.query} tab`}
                    >
                      x
                    </button>
                  </div>
                );
              })
            )}
            <span className="ml-auto rounded-full border border-dashed border-[var(--border)] px-3 py-1 text-sm text-[var(--muted)]">
              +
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-[20px] border border-[var(--border)] bg-white/45 p-4">
            <label
              htmlFor="context-panel-query"
              className="text-sm font-medium text-[var(--muted)]"
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
              className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--muted)]">Depth</p>
              <div className="flex flex-wrap gap-2">
                {DEPTH_OPTIONS.map((option) => {
                  const isActive = option.value === depth;

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-white/70 text-[var(--muted)]"
                      }`}
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
                          isActive ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                        }`}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClear}
                disabled={!query.trim() && tabs.length === 0}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={onSearch}
                disabled={!query.trim() || isLoading}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Search
              </button>
            </div>
          </div>

          <p className="text-[var(--muted)]">
            Use this panel to manually search for a word or phrase from the chat.
          </p>

          {isLoading ? <p>Explaining the selected term...</p> : null}
          {!isLoading && error ? (
            <p className="text-rose-700">{error}</p>
          ) : null}
          {!isLoading && !error && activeTab ? (
            <div className="space-y-3 rounded-[20px] border border-[var(--border)] bg-white/55 p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                <span className="truncate">Topic: {activeTab.query}</span>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-medium text-[var(--accent)]">
                  {formatDepthLabel(activeTab.depth)}
                </span>
              </div>
              <FormattedExplanation text={activeTab.explanation} />
            </div>
          ) : null}
        </div>
      </div>
    </aside>
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
