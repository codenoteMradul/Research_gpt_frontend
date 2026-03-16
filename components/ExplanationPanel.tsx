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
      className={`glass-panel fade-up flex min-h-[320px] flex-col rounded-[32px] border p-6 ${
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
            {selection ? `"${selection}"` : "Click a term to inspect it"}
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

      <div className="flex-1 rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-5 text-[15px] leading-7 text-[var(--foreground)]">
        {!isOpen ? (
          <p className="text-[var(--muted)]">
            Your main research thread stays untouched. This panel is only for
            short side explanations.
          </p>
        ) : null}
        {isLoading ? <p>Explaining the selected term...</p> : null}
        {!isLoading && error ? (
          <p className="text-rose-700">{error}</p>
        ) : null}
        {!isLoading && !error && explanation ? <p>{explanation}</p> : null}
      </div>
    </aside>
  );
}
