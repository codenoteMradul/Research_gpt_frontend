"use client";

type ClickableTextProps = {
  text: string;
  highlightedWords?: string[];
  onWordClick?: (word: string, context: string) => void;
  className?: string;
};

const tokenPattern = /(\s+|[^\w]+)/g;
const headingPattern = /^(Overview|Key points|Example):$/i;

export function ClickableText({
  text,
  highlightedWords = [],
  onWordClick,
  className,
}: ClickableTextProps) {
  const normalizedHighlights = highlightedWords.map((word) =>
    word.trim().toLowerCase(),
  );
  const lines = text.split("\n");

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => {
        const pieces = line.split(tokenPattern).filter(Boolean);
        const isHeading = headingPattern.test(line.trim());

        if (pieces.length === 0) {
          return <div key={`line-${lineIndex}`}>&nbsp;</div>;
        }

        return (
          <div key={`line-${lineIndex}`} className={isHeading ? "font-semibold" : ""}>
            {pieces.map((piece, pieceIndex) => {
              const isWord = /\w/.test(piece);
              const isHighlighted = normalizedHighlights.includes(
                piece.trim().toLowerCase(),
              );

              if (!isWord) {
                return <span key={`${lineIndex}-${pieceIndex}`}>{piece}</span>;
              }

              if (!onWordClick) {
                return (
                  <span
                    key={`${lineIndex}-${pieceIndex}`}
                    className={isHighlighted ? "rounded-md bg-[var(--accent-soft)] px-0.5 text-[#4ade80]" : ""}
                  >
                    {piece}
                  </span>
                );
              }

              return (
                <span
                  key={`${lineIndex}-${pieceIndex}`}
                  className={`rounded-md px-0.5 transition-colors ${
                    isHighlighted
                      ? "bg-[var(--accent-soft)] text-[#4ade80]"
                      : ""
                  } hover:bg-[var(--accent-soft)] hover:text-[#4ade80]`}
                  onClick={() => onWordClick(piece, text)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onWordClick(piece, text);
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
  );
}
