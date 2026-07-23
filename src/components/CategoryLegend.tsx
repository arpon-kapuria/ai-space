import { useState } from "react";
import { CATEGORIES } from "../types/content";
import { categoryColorMap } from "../lib/categoryColors";
import { useThemeStore } from "../store/themeStore";
import { getCategoryCounts } from "../content/loader";

interface CategoryLegendProps {
  active: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryLegend({ active, onChange }: CategoryLegendProps) {
  const [expanded, setExpanded] = useState(false);
  const counts = getCategoryCounts();
  const theme = useThemeStore((s) => s.theme);
  const colors = categoryColorMap(theme);

  function pick(cat: string | null) {
    onChange(cat);
    setExpanded(false); // collapse again after choosing, on mobile/tablet
  }

  const chips = (
    <>
      <button
        onClick={() => pick(null)}
        className={`rounded-full border px-3 py-1.5 font-mono text-[11px] transition ${
          active === null
            ? "border-starlight-dim bg-panel-raised text-ink"
            : "border-hairline bg-panel/70 text-ink-muted hover:text-ink"
        }`}
      >
        All categories
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => pick(active === cat ? null : cat)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] transition ${
            active === cat
              ? "border-starlight-dim bg-panel-raised text-ink"
              : "border-hairline bg-panel/70 text-ink-muted hover:text-ink"
          }`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: colors[cat] }}
          />
          {cat}
          <span className="text-ink-faint">{counts[cat] ?? 0}</span>
        </button>
      ))}
    </>
  );

  return (
    <div className="pointer-events-auto absolute left-2 top-2 z-10 sm:left-4 sm:top-4">
      {/* Mobile/tablet: collapsed behind a single toggle to save vertical space */}
      <div className="lg:hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-hairline bg-panel/85 px-3 py-1.5 font-mono text-[11px] text-ink-muted backdrop-blur"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: active ? colors[active as keyof typeof colors] : "currentColor" }}
          />
          <span className="max-w-[55vw] truncate">{active ?? "All categories"}</span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {expanded && (
          <div className="mt-1.5 flex max-w-[calc(100vw-2rem)] flex-wrap gap-1.5">{chips}</div>
        )}
      </div>

      {/* Desktop: always visible, unchanged */}
      <div className="hidden max-w-[calc(100%-2rem)] flex-wrap gap-1.5 lg:flex">{chips}</div>
    </div>
  );
}