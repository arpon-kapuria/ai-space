import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let initialized = false;
function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    // Always the same flat "light paper" base theme, regardless of the
    // site's own dark/light toggle — diagrams are intentionally rendered
    // on their own light card rather than trying to repaint to match the
    // surrounding theme. Per-node fill colors are cycled afterward by
    // CSS (.prose-note .mermaid in index.css); these variables just set
    // sane defaults for anything that CSS doesn't explicitly reach
    // (subgraph backgrounds, default text/lines, etc).
    theme: "base",
    themeVariables: {
      background: "#fffdf7",
      primaryColor: "#ffd43b",
      primaryTextColor: "#1c1c1e",
      primaryBorderColor: "#1c1c1e",
      lineColor: "#1c1c1e",
      secondaryColor: "#74c0fc",
      tertiaryColor: "#69db7c",
      edgeLabelBackground: "#fffdf7",
      textColor: "#1c1c1e",
    },
    fontFamily: "Space Grotesk, Inter, sans-serif",
  });
  initialized = true;
}

let counter = 0;

export function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${counter++}`);

  useEffect(() => {
    ensureInit();
    let cancelled = false;
    mermaid
      .render(idRef.current, code)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch((err) => {
        if (!cancelled) setError(String(err?.message ?? err));
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="rounded-lg border border-hairline bg-panel-raised p-4 font-mono text-xs text-cat-dl">
        Diagram failed to render: {error}
      </div>
    );
  }

  // No Tailwind background/border/padding here — the "mermaid" class is
  // what .prose-note .mermaid in index.css hooks onto to apply the full
  // light-paper card + flat color-cycling look, identically whether the
  // site itself is in dark or light mode.
  return <div ref={ref} className="mermaid" />;
}