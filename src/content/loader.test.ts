import { describe, it, expect } from "vitest";
import {
  ALL_TOPICS,
  FULL_GRAPH,
  getTopic,
  getGraphForCategory,
  getRelatedTopics,
  getPrevNext,
  getCategoryCounts,
} from "./loader";
import { CATEGORIES } from "../types/content";

describe("content loader", () => {
  it("discovers at least one topic", () => {
    expect(ALL_TOPICS.length).toBeGreaterThan(0);
  });

  it("keeps ALL_TOPICS sorted alphabetically by title", () => {
    const titles = ALL_TOPICS.map((t) => t.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });

  it("every topic's categories are valid, known categories", () => {
    for (const topic of ALL_TOPICS) {
      for (const cat of topic.categories) {
        expect(CATEGORIES).toContain(cat);
      }
    }
  });

  it("every topic has a positive reading time", () => {
    for (const topic of ALL_TOPICS) {
      expect(topic.readingTime).toBeGreaterThanOrEqual(1);
    }
  });

  it("getTopic resolves a known slug and returns undefined for unknown ones", () => {
    expect(getTopic("supervised-learning")?.title).toBe("Supervised Learning");
    expect(getTopic("does-not-exist")).toBeUndefined();
  });

  describe("graph generation", () => {
    it("creates one node per topic", () => {
      expect(FULL_GRAPH.nodes.length).toBe(ALL_TOPICS.length);
    });

    it("never creates an edge to a dangling/unknown related slug", () => {
      const ids = new Set(FULL_GRAPH.nodes.map((n) => n.id));
      for (const edge of FULL_GRAPH.edges) {
        expect(ids.has(edge.source)).toBe(true);
        expect(ids.has(edge.target)).toBe(true);
      }
    });

    it("never creates a self-referencing edge", () => {
      for (const edge of FULL_GRAPH.edges) {
        expect(edge.source).not.toBe(edge.target);
      }
    });

    it("de-duplicates edges declared from either side", () => {
      const keys = FULL_GRAPH.edges.map((e) =>
        [e.source, e.target].sort().join("::"),
      );
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("degree matches the number of edges touching each node", () => {
      const degree = new Map<string, number>();
      for (const edge of FULL_GRAPH.edges) {
        degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
        degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
      }
      for (const node of FULL_GRAPH.nodes) {
        expect(node.degree).toBe(degree.get(node.id) ?? 0);
      }
    });
  });

  describe("getGraphForCategory", () => {
    it("only returns nodes tagged with that category", () => {
      const category = CATEGORIES[0];
      const { nodes } = getGraphForCategory(category);
      for (const node of nodes) {
        expect(node.categories).toContain(category);
      }
    });

    it("only returns edges where both endpoints are in the filtered set", () => {
      const category = CATEGORIES[0];
      const { nodes, edges } = getGraphForCategory(category);
      const ids = new Set(nodes.map((n) => n.id));
      for (const edge of edges) {
        expect(ids.has(edge.source)).toBe(true);
        expect(ids.has(edge.target)).toBe(true);
      }
    });
  });

  describe("getRelatedTopics", () => {
    it("returns an empty array for an unknown slug", () => {
      expect(getRelatedTopics("does-not-exist")).toEqual([]);
    });

    it("includes reverse links — topics that list this one as related", () => {
      const withRelated = ALL_TOPICS.find((t) => t.related.length > 0);
      expect(withRelated).toBeDefined();
      const target = withRelated!.related[0];
      const related = getRelatedTopics(target);
      expect(related.some((t) => t.slug === withRelated!.slug)).toBe(true);
    });

    it("never includes the topic itself", () => {
      for (const topic of ALL_TOPICS.slice(0, 5)) {
        const related = getRelatedTopics(topic.slug);
        expect(related.some((t) => t.slug === topic.slug)).toBe(false);
      }
    });
  });

  describe("getPrevNext", () => {
    it("has both prev and next for a topic in the middle of the list", () => {
      if (ALL_TOPICS.length > 2) {
        const middle = ALL_TOPICS[Math.floor(ALL_TOPICS.length / 2)];
        const { prev, next } = getPrevNext(middle.slug);
        expect(prev).toBeDefined();
        expect(next).toBeDefined();
      }
    });

    it("has no prev for the first topic and no next for the last", () => {
      const first = ALL_TOPICS[0];
      const last = ALL_TOPICS[ALL_TOPICS.length - 1];
      expect(getPrevNext(first.slug).prev).toBeUndefined();
      expect(getPrevNext(last.slug).next).toBeUndefined();
    });

    it("returns an empty object for an unknown slug", () => {
      expect(getPrevNext("does-not-exist")).toEqual({});
    });
  });

  describe("getCategoryCounts", () => {
    it("counts sum to the total number of (topic, category) pairs", () => {
      const counts = getCategoryCounts();
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const expected = ALL_TOPICS.reduce(
        (sum, t) => sum + t.categories.length,
        0,
      );
      expect(total).toBe(expected);
    });
  });
});