import { useState } from "react";
import type { ReactNode } from "react";

/**
 * Wraps a fenced code block with a small header bar showing the detected
 * language and a copy-to-clipboard button. `code` is the raw source text
 * (used for copying); `children` is the already-rendered <code> element
 * (with rehype-highlight's syntax-highlighting spans intact) and is what
 * actually gets displayed.
 */
export function CodeBlock({
  language,
  code,
  children,
}: {
  language?: string;
  code: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <div className="code-block my-4 overflow-hidden rounded-lg border border-hairline bg-panel-raised">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
          {language || "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="font-mono text-xs text-ink-muted transition hover:text-ink"
        >
          {copied ? "Copied !" : "Copy"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto p-4">{children}</pre>
    </div>
  );
}