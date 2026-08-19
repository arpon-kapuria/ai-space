import { ALL_TOPICS, FULL_GRAPH } from "../content/loader";
import { CATEGORIES } from "../types/content";
import { Contact } from "../components/Contact";

export function About() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          About
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          AI-Space
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-muted">
          Modern AI knowledge is fragmented. Definitions live in one place, research papers in another, tutorials somewhere else, and the relationships between concepts are often left for you to figure out.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          AI-Space is an attempt to organize that knowledge into a single visual reference. Instead of treating concepts as isolated entries, it connects them into a knowledge graph where every concept is linked to the ideas that explain it, build upon it, or apply it. The goal isn't just to define terms—it's to provide context.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          Whether you're revisiting the fundamentals of linear algebra, understanding why Transformers changed deep learning, or tracing the evolution from supervised fine-tuning to modern LLM post-training techniques, AI-Space helps you explore concepts through their relationships rather than in isolation.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          This project is built for students, researchers, engineers, and anyone curious about artificial intelligence. It is open source, continuously evolving, and aims to provide a reliable reference that stays relevant as the AI ecosystem continues to evolve.
        </p>

        <div className="mt-6 flex gap-1 md:gap-2.5">
          <Contact />
        </div>

        <div className="mt-8 space-y-2 border-y border-hairline py-5 font-mono text-xs">
          <div className="flex justify-between"><span className="text-ink-muted">Topics</span><span className="text-ink">{ALL_TOPICS.length}</span></div>
          <div className="flex justify-between"><span className="text-ink-muted">Connections</span><span className="text-ink">{FULL_GRAPH.edges.length}</span></div>
          <div className="flex justify-between"><span className="text-ink-muted">Categories</span><span className="text-ink">{CATEGORIES.length}</span></div>
        </div>

        <p className="mt-6 text-[11px] text-ink-muted">
          This project was inspired by Matt Pocock's{" "}
          < a
            href="https://www.aicodingdictionary.com/"
            target="_blank"
            rel="noreferrer"
            className="text-ink-muted transition hover:text-ink"
          >
            The AI Coding Dictionary
          </a>
          .
        </p>
      </div>
    </div>
  );
}
