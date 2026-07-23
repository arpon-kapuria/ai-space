import { Link } from "react-router-dom";
import { ALL_TOPICS, FULL_GRAPH } from "../content/loader";
import { CATEGORIES } from "../types/content";
import { ConstellationBackground } from "../components/ConstellationBackground";

export function Landing() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden px-6">
      <ConstellationBackground />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 42% 48% at 50% 45%, var(--color-void) 0%, var(--color-void) 35%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl py-16 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-starlight-dim sm:text-xs sm:tracking-[0.2em]">
          {ALL_TOPICS.length} topics · {FULL_GRAPH.edges.length} connections ·{" "}
          {CATEGORIES.length} categories
        </p>

        <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-ink md:text-6xl">
          Explore AI through a
          <br />
          Knowledge Graph 
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
          AI-Dictionary is a visual reference for artificial intelligence. 
          Every concept is a node. Every edge is a relationship.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/explore"
            className="rounded-lg bg-starlight px-6 py-2.5 font-display text-sm font-medium text-void-deep transition hover:brightness-110"
          >
            Explore the graph
          </Link>
          <Link
            to="/about"
            className="rounded-lg border border-hairline px-6 py-2.5 font-display text-sm text-ink transition hover:border-starlight-dim"
          >
            About the project
          </Link>
        </div>
      </div>
    </div>
  );
}