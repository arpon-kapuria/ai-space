import { describe, it, expect } from "vitest";
import { searchTopics } from "./search";
import { ALL_TOPICS } from "./loader";

describe("searchTopics", () => {
  it("returns an empty array for an empty query", () => {
    expect(searchTopics("")).toEqual([]);
    expect(searchTopics("   ")).toEqual([]);
  });

  it("finds a topic by its exact title", () => {
    const sample = ALL_TOPICS[0];
    const results = searchTopics(sample.title);
    expect(results.some((t) => t.slug === sample.slug)).toBe(true);
  });

  it("respects the limit parameter", () => {
    const results = searchTopics("a", 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("returns an empty array when nothing plausibly matches", () => {
    const results = searchTopics("zzzzzznotarealtopicquery9999");
    expect(results).toEqual([]);
  });
});