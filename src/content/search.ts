import Fuse from "fuse.js";
import { ALL_TOPICS } from "./loader";
import type { Topic } from "../types/content";

const fuse = new Fuse(ALL_TOPICS, {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "tags", weight: 0.25 },
    { name: "shortNote", weight: 0.15 },
    { name: "categories", weight: 0.1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
});

export function searchTopics(query: string, limit = 8): Topic[] {
  if (!query.trim()) return [];
  return fuse
    .search(query, { limit })
    .map((r) => r.item);
}
