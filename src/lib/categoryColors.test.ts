import { describe, it, expect } from "vitest";
import { CATEGORIES } from "../types/content";
import {
  categoryColorMap,
  colorForCategories,
  difficultyColor,
  hexToPixiNumber,
  canvasTheme,
} from "./categoryColors";

describe("categoryColors", () => {
  it("provides a valid hex color for every category in both themes", () => {
    for (const theme of ["dark", "light"] as const) {
      const map = categoryColorMap(theme);
      for (const cat of CATEGORIES) {
        expect(map[cat]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it("colorForCategories picks the first category's color", () => {
    const color = colorForCategories(["Machine Learning"], "dark");
    expect(color).toBe(categoryColorMap("dark")["Machine Learning"]);
  });

  it("colorForCategories falls back to a default for an empty list", () => {
    expect(colorForCategories([], "dark")).toBeTruthy();
    expect(colorForCategories([], "light")).toBeTruthy();
  });

  it("difficultyColor returns a value for all three difficulty levels", () => {
    for (const level of ["Beginner", "Intermediate", "Advanced"]) {
      expect(difficultyColor(level, "dark")).toBeTruthy();
      expect(difficultyColor(level, "light")).toBeTruthy();
    }
  });

  it("hexToPixiNumber converts hex strings to the numeric form Pixi expects", () => {
    expect(hexToPixiNumber("#ffffff")).toBe(0xffffff);
    expect(hexToPixiNumber("#000000")).toBe(0);
    expect(hexToPixiNumber("#ffc857")).toBe(0xffc857);
  });

  it("canvasTheme returns distinct palettes for light and dark", () => {
    const dark = canvasTheme("dark");
    const light = canvasTheme("light");
    expect(dark.edge).not.toBe(light.edge);
  });
});