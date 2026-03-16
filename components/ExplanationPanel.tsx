"use client";

type ExplanationPanelProps = {
  isOpen: boolean;
  selection: string | null;
  explanation: string | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
};

export function ExplanationPanel({
  isOpen,
  selection,
  explanation,
  isLoading,
  error,
  onClose,
}: ExplanationPanelProps) {
  return (
    <aside
      className={`glass-panel fade-up flex min-h-[320px] flex-col rounded-[32px] border p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] ${
        isOpen ? "opacity-100" : "opacity-80"
      }`}
      style={{
        boxShadow: `0 18px 45px rgba(45, 35, 15, 0.08), 0 0 0 1px var(--border), 0 20px 60px var(--panel-glow)`,
      }}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Context Panel
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {selection ? `"${selection}"` : "Explanation"}
          </h2>
        </div>
        {isOpen ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Close
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-5 text-[15px] leading-7 text-[var(--foreground)]">
        {!isOpen ? null : null}
        {isLoading ? <p>Explaining the selected term...</p> : null}
        {!isLoading && error ? (
          <p className="text-rose-700">{error}</p>
        ) : null}
        {!isLoading && !error && explanation ? <p>{explanation}</p> : null}
      </div>
    </aside>
  );
}
