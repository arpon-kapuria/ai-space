import { describe, it, expect } from "vitest";
import { nodeRadius } from "./useForceSimulation";

describe("nodeRadius", () => {
  it("grows with degree", () => {
    expect(nodeRadius(5)).toBeGreaterThan(nodeRadius(0));
  });

  it("is capped at a maximum radius", () => {
    const r1 = nodeRadius(50);
    const r2 = nodeRadius(500);
    expect(r1).toBe(r2);
  });

  it("never returns a radius smaller than the base radius", () => {
    expect(nodeRadius(0)).toBeGreaterThan(0);
  });
});