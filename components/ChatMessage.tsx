"use client";

import { isValidElement, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";

type ChatMessageProps = {
  content: string;
};

export function ChatMessage({ content }: ChatMessageProps) {
  return (
    <div className="chat-markdown text-[15px] leading-7 text-[var(--foreground)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-2xl font-semibold tracking-tight text-white first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-slate-100 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-5 text-lg font-semibold tracking-tight text-slate-100 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 whitespace-pre-wrap last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-2 pl-6 marker:text-green-400 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-2 pl-6 marker:text-green-400 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-4 rounded-r-2xl border-l-4 border-green-400/60 bg-white/[0.035] px-4 py-3 italic text-slate-200 last:mb-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-5 border-white/10" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-green-300 underline decoration-green-500/45 underline-offset-4 transition hover:text-green-200"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto rounded-2xl border border-white/10 last:mb-0">
              <table className="min-w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.045] text-slate-100">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-white/10 px-4 py-3 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-white/10 px-4 py-3 align-top text-slate-200">
              {children}
            </td>
          ),
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children;

            if (!isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
              return (
                <pre className="mb-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#06111f] p-4 last:mb-0">
                  {children}
                </pre>
              );
            }

            const rawCode = String(child.props.children ?? "").replace(/\n$/, "");
            const language =
              child.props.className?.match(/language-(\w+)/)?.[1] ??
              inferCodeLanguage(rawCode);

            return <CodeBlock code={rawCode} language={language} />;
          },
          code: ({ className, children }) => {
            if (className?.startsWith("language-")) {
              return <code className={className}>{children}</code>;
            }

            return (
              <code className="rounded-md border border-white/10 bg-[#0a1020] px-1.5 py-0.5 font-mono text-[0.92em] text-green-200">
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
  const lineCount = code.split("\n").length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-[#06111f] shadow-lg shadow-black/25 last:mb-0">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-white/[0.08]"
        >
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={nightOwl}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            minWidth: "100%",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
            },
          }}
          showLineNumbers={lineCount > 1}
          wrapLongLines={false}
          lineNumberStyle={{
            minWidth: "2.25em",
            paddingRight: "1rem",
            color: "rgba(148, 163, 184, 0.55)",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function inferCodeLanguage(code: string) {
  const normalized = code.trim();

  if (!normalized) {
    return "text";
  }

  if (looksLikeJson(normalized)) {
    return "json";
  }

  if (
    /(^|\n)\s*(interface|type|enum)\s+\w+/.test(normalized) ||
    /:\s*(string|number|boolean|unknown|never|void)([]|[|;,\n=)])/m.test(
      normalized,
    ) ||
    /\bimplements\b|\breadonly\b/.test(normalized)
  ) {
    return "typescript";
  }

  if (
    /(^|\n)\s*(const|let|var)\s+\w+/.test(normalized) ||
    /\bfunction\b|\bconsole\.log\b|=>/.test(normalized)
  ) {
    return "javascript";
  }

  if (
    /<([A-Z][A-Za-z0-9]*|div|span|section|main|button|input)\b/.test(
      normalized,
    )
  ) {
    return "tsx";
  }

  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|WITH)\b/i.test(normalized)) {
    return "sql";
  }

  if (/^\s*(\{|\[)[\w\W]*(\}|\])\s*$/.test(normalized)) {
    return "json";
  }

  if (/^\s*<\/?[a-z][^>]*>/im.test(normalized)) {
    return "html";
  }

  if (/^\s*[.#]?[\w-]+\s*\{[\s\S]*\}\s*$/.test(normalized)) {
    return "css";
  }

  if (/^\s*(def |import |from |class |\@[\w.]+|print\()/.test(normalized)) {
    return "python";
  }

  if (/^\s*(curl |npm |pnpm |yarn |git |ls |cd |export )/m.test(normalized)) {
    return "bash";
  }

  return "text";
}

function looksLikeJson(code: string) {
  try {
    JSON.parse(code);
    return true;
  } catch {
    return false;
  }
}
