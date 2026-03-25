"use client";

export function FormattedExplanation({ text }: { text: string }) {
  const blocks = toBlocks(text);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = block.level === 1 ? "h3" : block.level === 2 ? "h4" : "h5";

          return (
            <HeadingTag
              key={`heading-${index}`}
              className={`font-semibold tracking-tight text-[var(--foreground)] ${
                block.level === 1
                  ? "text-xl"
                  : block.level === 2
                    ? "text-lg"
                    : "text-base"
              }`}
            >
              <InlineFormattedText text={block.text} />
            </HeadingTag>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={`list-${index}`}
              className="space-y-2 rounded-[18px] bg-[var(--accent-soft)]/50 px-4 py-3"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`} className="flex gap-3 leading-7">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span className="min-w-0">
                    <InlineFormattedText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={`paragraph-${index}`}
            className="leading-8 text-[15px] text-[var(--foreground)]"
          >
            <InlineFormattedText text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

function InlineFormattedText({ text }: { text: string }) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <>
      {segments.map((segment, index) => {
        const isBold = segment.startsWith("**") && segment.endsWith("**");

        if (!isBold) {
          return <span key={index}>{segment}</span>;
        }

        return (
          <strong key={index} className="font-semibold text-[var(--foreground)]">
            {segment.slice(2, -2)}
          </strong>
        );
      })}
    </>
  );
}

type ExplanationBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function toBlocks(text: string): ExplanationBlock[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const blocks: ExplanationBlock[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    const bulletMatch = line.match(/^-+\s+(.*)$/);

    if (headingMatch) {
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: cleanMarkdownMarkers(headingMatch[2]),
      });
      continue;
    }

    if (bulletMatch) {
      listItems.push(cleanMarkdownMarkers(bulletMatch[1]));
      continue;
    }

    flushList();
    blocks.push({
      type: "paragraph",
      text: cleanMarkdownMarkers(line),
    });
  }

  flushList();

  return blocks;
}

function cleanMarkdownMarkers(text: string) {
  return text
    .replace(/^[-*]\s+/, "")
    .replace(/\*\*\s*/g, "**")
    .trim();
}
