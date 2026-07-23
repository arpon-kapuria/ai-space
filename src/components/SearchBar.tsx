import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { searchTopics } from "../content/search";
import { useGraphStore } from "../store/graphStore";
import { useThemeStore } from "../store/themeStore";
import { colorForCategories } from "../lib/categoryColors";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SearchBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const setSearchQuery = useGraphStore((s) => s.setSearchQuery);
  const setSelected = useGraphStore((s) => s.setSelected);
  const requestFocus = useGraphStore((s) => s.requestFocus);
  const theme = useThemeStore((s) => s.theme);
  const navigate = useNavigate();

  const results = useMemo(() => searchTopics(query, 6), [query]);

  function handleChange(value: string) {
    setQuery(value);
    setSearchQuery(value); // also drives dim/highlight on the graph explorer
  }

  function reset() {
    setQuery("");
    setSearchQuery("");
    setFocused(false);
    setMobileOpen(false);
  }

  // Search now jumps to the graph and focuses the selected node, matching
  // the behavior of clicking a node directly or picking one from the
  // topic sidebar — instead of navigating straight to the note page.
  function pick(slug: string) {
    navigate("/explore");
    setSelected(slug);
    requestFocus(slug);
    setQuery("");
    setSearchQuery("");
    setMobileOpen(false);
  }

  const resultsList =
    results.length === 0 ? (
      <p className="px-3.5 py-3 text-sm text-ink-faint">No topics match "{query}".</p>
    ) : (
      results.map((t) => (
        <button
          key={t.slug}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // keep focus so blur doesn't beat the click
            pick(t.slug);
          }}
          className="flex w-full flex-col items-start gap-1 px-3.5 py-2.5 text-left hover:bg-panel"
        >
          <span className="flex w-full items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: colorForCategories(t.categories, theme) }}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
              {t.title}
            </span>
          </span>
          <span className="pl-4 font-mono text-[10px] text-ink-faint">
            {t.categories[0]}
          </span>
        </button>
      ))
    );

  return (
    <>
      {/* Phone: a small round trigger. Opens a full-width overlay that is
          fixed-positioned — deliberately NOT a flex child of the header —
          so an expanding search input can never stretch the nav bar. */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Search topics"
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-panel-raised hover:text-ink sm:hidden"
      >
        <SearchIcon />
      </button>

      {mobileOpen && createPortal (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-void-deep/50"
            onClick={reset}
            aria-hidden
          />
          <div className="absolute inset-x-2 top-15 overflow-hidden rounded-xl border border-hairline bg-panel-raised shadow-2xl">
            <div className="flex items-center gap-2 border-b border-hairline px-3.5 py-3">
              <SearchIcon className="shrink-0 text-ink-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search topics…"
                aria-label="Search AI topics"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button
                onClick={reset}
                aria-label="Close search"
                className="shrink-0 rounded-md p-1 text-ink-faint hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {query.trim() && (
              <div className="max-h-[60vh] overflow-y-auto">{resultsList}</div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Tablet/desktop: original inline rectangular bar, unchanged */}
      <div className="relative hidden w-full max-w-sm sm:block">
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search topics…"
          aria-label="Search AI topics"
          className="w-full rounded-lg border border-hairline bg-panel px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-starlight-dim"
        />
        {focused && query.trim() && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-lg border border-hairline bg-panel-raised shadow-xl">
            {resultsList}
          </div>
        )}
      </div>
    </>
  );
}