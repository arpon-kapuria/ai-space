import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let initialized = false;
function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
      background: "#10141f",
      primaryColor: "#161b29",
      primaryTextColor: "#e8ecf5",
      primaryBorderColor: "#232a3d",
      lineColor: "#4b5166",
      secondaryColor: "#161b29",
      tertiaryColor: "#10141f",
    },
    fontFamily: "Inter, sans-serif",
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

  return (
    <div
      ref={ref}
      className="my-4 flex justify-center overflow-x-auto rounded-lg border border-hairline bg-panel-raised p-4"
    />
  );
}
