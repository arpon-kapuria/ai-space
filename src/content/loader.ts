import { load as parseYaml } from "js-yaml";
import type {
  GraphEdge,
  GraphNode,
  Topic,
  TopicGraph,
  TopicMetadata,
} from "../types/content";

// --- Discover every topic folder at build time --------------------------
// Adding a new topic folder under content/topics/<slug>/ with these three
// files is the ONLY thing a content author needs to do. Nothing below
// this file needs to change.

const metadataFiles = import.meta.glob("/content/topics/*/metadata.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const shortNoteFiles = import.meta.glob("/content/topics/*/short_note.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const detailedNoteFiles = import.meta.glob(
  "/content/topics/*/detailed_note.md",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

function slugFromPath(path: string): string {
  // /content/topics/<slug>/metadata.yaml -> <slug>
  const parts = path.split("/");
  return parts[parts.length - 2];
}

const WORDS_PER_MINUTE = 200;

function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function buildTopics(): Map<string, Topic> {
  const topics = new Map<string, Topic>();

  for (const [path, raw] of Object.entries(metadataFiles)) {
    const slug = slugFromPath(path);
    const metadata = parseYaml(raw) as TopicMetadata;

    const shortPath = path.replace("metadata.yaml", "short_note.md");
    const detailedPath = path.replace("metadata.yaml", "detailed_note.md");

    const shortNote = shortNoteFiles[shortPath] ?? "";
    const detailedNote = detailedNoteFiles[detailedPath] ?? "";

    topics.set(slug, {
      ...metadata,
      slug: metadata.slug ?? slug,
      shortNote,
      detailedNote,
      readingTime: estimateReadingMinutes(detailedNote),
    });
  }

  return topics;
}

export const TOPICS: Map<string, Topic> = buildTopics();
export const ALL_TOPICS: Topic[] = Array.from(TOPICS.values()).sort((a, b) =>
  a.title.localeCompare(b.title),
);

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.get(slug);
}

// --- Graph generation -----------------------------------------------------
// Edges are derived automatically from each topic's `related` list.
// A related reference only needs to exist on ONE side — we de-duplicate
// and treat the relationship as undirected for graph purposes.

function buildGraph(topics: Topic[]): TopicGraph {
  const nodeMap = new Map<string, GraphNode>();
  const edgeSet = new Map<string, GraphEdge>();

  for (const topic of topics) {
    nodeMap.set(topic.slug, {
      id: topic.slug,
      title: topic.title,
      categories: topic.categories,
      difficulty: topic.difficulty,
      tags: topic.tags,
      degree: 0,
    });
  }

  for (const topic of topics) {
    for (const relatedSlug of topic.related) {
      if (!nodeMap.has(relatedSlug)) continue; // ignore dangling refs
      if (relatedSlug === topic.slug) continue;
      const key = [topic.slug, relatedSlug].sort().join("::");
      if (!edgeSet.has(key)) {
        edgeSet.set(key, { source: topic.slug, target: relatedSlug });
      }
    }
  }

  const edges = Array.from(edgeSet.values());
  for (const edge of edges) {
    const s = nodeMap.get(edge.source);
    const t = nodeMap.get(edge.target);
    if (s) s.degree += 1;
    if (t) t.degree += 1;
  }

  return { nodes: Array.from(nodeMap.values()), edges };
}

export const FULL_GRAPH: TopicGraph = buildGraph(ALL_TOPICS);

export function getGraphForCategory(category: string): TopicGraph {
  const nodeIds = new Set(
    ALL_TOPICS.filter((t) => t.categories.includes(category)).map(
      (t) => t.slug,
    ),
  );
  const nodes = FULL_GRAPH.nodes.filter((n) => nodeIds.has(n.id));
  const edges = FULL_GRAPH.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );
  return { nodes, edges };
}

export function getRelatedTopics(slug: string): Topic[] {
  const topic = getTopic(slug);
  if (!topic) return [];
  const fromList = topic.related
    .map((s) => getTopic(s))
    .filter((t): t is Topic => !!t);
  // also include topics that list THIS topic as related (reverse links)
  const reverse = ALL_TOPICS.filter(
    (t) => t.slug !== slug && t.related.includes(slug),
  );
  const merged = new Map<string, Topic>();
  for (const t of [...fromList, ...reverse]) merged.set(t.slug, t);
  return Array.from(merged.values());
}

export function getPrevNext(slug: string): { prev?: Topic; next?: Topic } {
  const idx = ALL_TOPICS.findIndex((t) => t.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? ALL_TOPICS[idx - 1] : undefined,
    next: idx < ALL_TOPICS.length - 1 ? ALL_TOPICS[idx + 1] : undefined,
  };
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const topic of ALL_TOPICS) {
    for (const cat of topic.categories) {
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
  }
  return counts;
}
