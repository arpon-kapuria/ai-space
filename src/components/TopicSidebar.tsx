import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../types/content";
import { ALL_TOPICS } from "../content/loader";
import { categoryColorMap } from "../lib/categoryColors";
import { useThemeStore } from "../store/themeStore";
import { useGraphStore } from "../store/graphStore";

export function TopicSidebar() {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024,
  );
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(CATEGORIES),
  );
  const theme = useThemeStore((s) => s.theme);
  const colors = categoryColorMap(theme);
  const navigate = useNavigate();

  const selectedId = useGraphStore((s) => s.selectedId);
  const setSelected = useGraphStore((s) => s.setSelected);
  const requestFocus = useGraphStore((s) => s.requestFocus);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof ALL_TOPICS>();
    for (const cat of CATEGORIES) map.set(cat, []);
    for (const topic of ALL_TOPICS) {
      for (const cat of topic.categories) {
        map.get(cat)?.push(topic);
      }
    }
    return map;
  }, []);

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function pickTopic(slug: string) {
    navigate("/explore");
    setSelected(slug);
    requestFocus(slug);
  }

  if (collapsed) {
    return (
      <>
        {/* Mobile collapsed: small boxed arrow, no full-height line */}
        <div className="flex w-9 shrink-0 items-start justify-center pt-1.5 pl-1 sm:hidden">
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand topic list"
            title="Expand topic list"
            className="rounded-md border border-hairline p-2 text-ink-muted transition hover:bg-panel-raised hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Desktop collapsed: original full-height thin bar */}
        <div className="hidden w-11 shrink-0 flex-col items-center border-r border-hairline bg-panel/60 py-4 sm:flex">
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand topic list"
            title="Expand topic list"
            className="rounded-md p-2 text-ink-muted transition hover:bg-panel-raised hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-hairline bg-panel/60">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2 sm:py-4">
        <p className="font-display text-sm font-medium text-ink">All topics</p>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse topic list"
          title="Collapse topic list"
          className="rounded-md p-1.5 text-ink-muted transition hover:bg-panel-raised hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {CATEGORIES.map((cat) => {
          const topics = grouped.get(cat) ?? [];
          const isOpen = openCategories.has(cat);
          return (
            <div key={cat} className="mb-1">
              <button
                onClick={() => toggleCategory(cat)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-panel-raised"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colors[cat] }}
                />
                <span className="min-w-0 flex-1 truncate font-display text-xs font-medium text-ink">
                  {cat}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                  {topics.length}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`shrink-0 text-ink-faint transition-transform ${isOpen ? "rotate-90" : ""}`}
                  aria-hidden
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isOpen && (
                <ul className="mb-1 ml-4 border-l border-hairline pl-2">
                  {topics.map((topic) => (
                    <li key={topic.slug}>
                      <button
                        onClick={() => pickTopic(topic.slug)}
                        className={`w-full truncate rounded-md px-2 py-1 text-left text-xs transition ${
                          selectedId === topic.slug
                            ? "bg-panel-raised text-ink"
                            : "text-ink-muted hover:bg-panel-raised hover:text-ink"
                        }`}
                        title={topic.title}
                      >
                        {topic.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}