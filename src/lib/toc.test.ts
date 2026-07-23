import { describe, it, expect } from "vitest";
import { extractToc } from "./toc";

describe("extractToc", () => {
  it("extracts ## and ### headings with their depth", () => {
    const md =
      "# Title\n\n## First section\n\nSome text.\n\n### A subsection\n\nMore text.\n\n## Second section\n";
    const toc = extractToc(md);
    expect(toc).toEqual([
      { id: "first-section", text: "First section", depth: 2 },
      { id: "a-subsection", text: "A subsection", depth: 3 },
      { id: "second-section", text: "Second section", depth: 2 },
    ]);
  });

  it("ignores # (h1) headings", () => {
    const toc = extractToc("# Only a title\n\nNo other headings.");
    expect(toc).toEqual([]);
  });

  it("de-duplicates repeated heading text with a numeric suffix", () => {
    const md = "## Overview\n\n## Overview\n";
    const toc = extractToc(md);
    expect(toc.map((t) => t.id)).toEqual(["overview", "overview-1"]);
  });

  it("strips punctuation the same way rehype-slug would", () => {
    const toc = extractToc("## What's Next?\n");
    expect(toc[0].id).toBe("whats-next");
  });
});