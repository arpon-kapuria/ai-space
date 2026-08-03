import { Link } from "react-router-dom";
import { useGraphStore } from "../store/graphStore";
import { useThemeStore } from "../store/themeStore";
import { getTopic } from "../content/loader";
import { colorForCategories, difficultyColor } from "../lib/categoryColors";

/**
 * Desktop: a right-hand drawer that slides in by animating width.
 * Mobile: a bottom sheet that slides up by animating translateY.
 * Both are driven by the same `selectedId` state; only one is visible
 * at a time via the md: breakpoint.
 */
export function GraphSidebar() {
  const selectedId = useGraphStore((s) => s.selectedId);
  const setSelected = useGraphStore((s) => s.setSelected);
  const theme = useThemeStore((s) => s.theme);

  const topic = selectedId ? getTopic(selectedId) : undefined;
  const open = !!topic;
  const color = topic ? colorForCategories(topic.categories, theme) : undefined;

  const panelContent = topic && (
    <>
      <button
        onClick={() => setSelected(null)}
        aria-label="Close panel"
        className="absolute right-4 top-4 rounded-md p-1.5 text-ink-faint transition hover:bg-panel-raised hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex items-center gap-2 pr-8">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
          {topic.categories[0]}
        </span>
      </div>

      <h2 className="mt-3 font-display text-xl font-semibold text-ink">
        {topic.title}
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {topic.shortNote}
      </p>

      {/* <div className="mt-4 flex flex-wrap gap-1.5">
        {topic.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[10px] text-ink"
          >
            {tag}
          </span>
        ))}
      </div> */}

      <div className="mt-4 flex items-center gap-3 text-xs text-ink-muted">
        <span
          className="rounded-full px-3 py-1 font-mono text-[10px]"
          style={{
            color: difficultyColor(topic.difficulty, theme),
            border: `1px solid ${difficultyColor(topic.difficulty, theme)}55`,
          }}
        >
          {topic.difficulty}
        </span>
        <span>·</span>
        <span>⏱️ {topic.readingTime} min read</span>
      </div>

      <Link
        to={`/topic/${topic.slug}`}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-starlight px-4 py-2 font-display text-sm font-medium text-void-deep transition hover:brightness-110"
      >
        Open full note
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </Link>
    </>
  );

  return (
    <>
      {/* Desktop: right-hand drawer, animates width, always in DOM */}
      <aside
        className="hidden shrink-0 overflow-hidden border-l border-hairline bg-panel/95 transition-[width] duration-300 ease-out md:block"
        style={{ width: open ? 320 : 0 }}
        aria-hidden={!open}
      >
        <div className="relative h-full w-80 p-6">{panelContent}</div>
      </aside>

      {/* Mobile: bottom sheet, animates transform, backdrop dims the graph */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-void-deep/60 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-hairline bg-panel/95 p-6 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="relative">{panelContent}</div>
        </div>
      </div>
    </>
  );
}