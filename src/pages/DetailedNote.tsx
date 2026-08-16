import { useEffect, useMemo } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import {
  getPrevNext,
  getRelatedTopics,
  getTopic,
} from "../content/loader";
import { extractToc } from "../lib/toc";
import { colorForCategories, difficultyColor } from "../lib/categoryColors";
import { useThemeStore } from "../store/themeStore";
import { MermaidBlock } from "../components/MermaidBlock";
import { CodeBlock } from "../components/CodeBlock";
import { hastToText, type HastNode } from "../lib/hastToText";
import { useGraphStore } from "../store/graphStore";

export function DetailedNote() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const topic = slug ? getTopic(slug) : undefined;
  const setSelected = useGraphStore((s) => s.setSelected);
  const theme = useThemeStore((s) => s.theme);
  const location = useLocation();
  const depth = (location.state as { depth?: number })?.depth ?? 0;

  useEffect(() => {
    if (topic) setSelected(topic.slug);
  }, [topic, setSelected]);

  useEffect(() => {
    if (!topic) return;
    document.title = `${topic.title} | AI-Dictionary`;
  }, [topic]);

  const toc = useMemo(
    () => (topic ? extractToc(topic.detailedNote) : []),
    [topic],
  );
  const related = useMemo(
    () => (slug ? getRelatedTopics(slug) : []),
    [slug],
  );
  const { prev, next } = useMemo(
    () => (slug ? getPrevNext(slug) : {}),
    [slug],
  );

  if (!slug) return <Navigate to="/explore" replace />;
  if (!topic) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-lg text-ink">Topic not found</p>
        <p className="mt-2 text-sm text-ink-muted">
          "{slug}" doesn't exist in the knowledge base yet.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-block rounded-lg bg-starlight px-4 py-2 font-display text-sm text-void-deep"
        >
          Back to the graph
        </Link>
      </div>
    );
  }

  const color = colorForCategories(topic.categories, theme);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-5xl gap-10 px-6 py-10 lg:px-10">
        <article className="min-w-0 flex-1">
          <button
            onClick={() => {
              if (depth > 0) {
                navigate(-1);
              } else {
                window.close();
              }
            }}
            className="mb-6 font-mono text-xs text-ink-muted hover:text-ink"
          >
            ← Back 
          </button>

          <h1
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl"
            style={{ textShadow: `0 0 40px ${color}22` }}
          >
            {topic.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-ink-muted">
            <span
              className="font-medium"
              style={{ color: difficultyColor(topic.difficulty, theme) }}
            >
              {topic.difficulty}
            </span>

            <span>·</span>

            <span className="flex items-center gap-1.5">
              {topic.categories.map((cat, i) => (
                <span key={cat} className="flex items-center gap-1.5">
                  <Link
                    to={`/explore/${encodeURIComponent(cat)}`}
                    className="text-s font-medium hover:underline underline-offset-2"
                  >
                    {cat}
                  </Link>
                  {i < topic.categories.length - 1 && (
                    <span className="text-ink-faint">,</span>
                  )}
                </span>
              ))}
            </span>

            <span>·</span>

            <span>⏱️ {topic.readingTime} min read</span>
          </div>

          <div className="prose-note mt-8 max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex, rehypeHighlight]}
              components={{
                a(props) {
                  const { children, ...rest } = props;
                  return (
                    <a {...rest} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
                pre(props) {
                  const { node, children } = props as typeof props & {
                    node?: HastNode;
                  };
                  const codeNode = node?.children?.[0];
                  const classes = (codeNode?.properties?.className ?? []).join(" ");
                  const match = /(?:^|\s)language-(\w+)(?:\s|$)/.exec(classes);
                  const language = match?.[1];
                  const raw = hastToText(codeNode).replace(/\n$/, "");
                  if (language === "mermaid") {
                    return <MermaidBlock code={raw} />;
                  }
                  // For every other fenced block, wrap it with a header
                  // showing the language and a copy button. The raw
                  // source text is read straight off the hast node
                  // rather than the rendered <code> children, since
                  // rehype-highlight has already tokenized those into
                  // nested <span>s by this point.
                  return (
                    <CodeBlock language={language} code={raw}>
                      {children}
                    </CodeBlock>
                  );
                },
                code(props) {
                  const { className, children, ...rest } = props;
                  return (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {topic.detailedNote}
            </ReactMarkdown>
          </div>

          <div className="mt-12 flex items-center justify-between gap-4 border-t border-hairline pt-6">
            {prev ? (
              <Link
                to={`/topic/${prev.slug}`}
                state={{ depth: depth + 1 }}
                className="min-w-0 flex-1 rounded-lg border border-hairline p-3 text-left transition hover:border-starlight-dim"
              >
                <p className="font-mono text-[10px] text-ink-faint">← Previous</p>
                <p className="truncate font-display text-sm text-ink">{prev.title}</p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {next ? (
              <Link
                to={`/topic/${next.slug}`}
                state={{ depth: depth + 1 }}
                className="min-w-0 flex-1 rounded-lg border border-hairline p-3 text-right transition hover:border-starlight-dim"
              >
                <p className="font-mono text-[10px] text-ink-faint">Next →</p>
                <p className="truncate font-display text-sm text-ink">{next.title}</p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-sm font-medium text-ink-muted">
                Related topics
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/topic/${r.slug}`}
                    state={{ depth: depth + 1 }}
                    className="flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-sm text-ink-muted transition hover:border-starlight-dim hover:text-ink"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: colorForCategories(r.categories, theme) }}
                    />
                    {r.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {toc.length > 0 && (
          <nav className="sticky top-10 hidden w-48 shrink-0 self-start lg:block">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              On this page
            </p>
            <ul className="mt-3 space-y-2 border-l border-hairline pl-3">
              {toc.map((entry) => (
                <li key={entry.id} style={{ marginLeft: (entry.depth - 2) * 10 }}>
                  <a
                    href={`#${entry.id}`}
                    className="text-xs text-ink-muted transition hover:text-starlight"
                  >
                    {entry.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}