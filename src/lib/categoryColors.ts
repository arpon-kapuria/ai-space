import type { Category } from "../types/content";
import type { Theme } from "../store/themeStore";

// Rich pastel jewel tones. Dark-mode values are lighter/higher-chroma so
// they glow against the dark panel/void; light-mode values are the same
// hues pulled deeper and more saturated so they stay readable as text and
// borders against a white panel. Every pair keeps roughly the same hue,
// just re-balanced for contrast in its own theme.
const CATEGORY_COLORS_DARK: Record<Category, string> = {
  "Mathematics": "#4DA3FF",
  "Machine Learning": "#3DDC84",
  "Deep Learning": "#FFB84D",
  "Natural Language Processing": "#FF5C8A",
  "Computer Vision": "#FF8A3D",
  "Generative AI": "#B47CFF",
  "LLM Engineering": "#4FD1C5",
  "Production AI": "#B5BDC9",
};

const CATEGORY_COLORS_LIGHT: Record<Category, string> = {
  "Mathematics": "#007AFF",
  "Machine Learning": "#34C759",
  "Deep Learning": "#FF9500",
  "Natural Language Processing": "#FF2D55",
  "Computer Vision": "#FF6A00",
  "Generative AI": "#AF52DE",
  "LLM Engineering": "#14B8A6",
  "Production AI": "#636366",
};

export const DEFAULT_NODE_COLOR_DARK = "#B9C2DE";
export const DEFAULT_NODE_COLOR_LIGHT = "#48517A";

export function categoryColorMap(theme: Theme): Record<Category, string> {
  return theme === "light" ? CATEGORY_COLORS_LIGHT : CATEGORY_COLORS_DARK;
}

export function colorForCategories(
  categories: string[],
  theme: Theme = "dark",
): string {
  const map = categoryColorMap(theme);
  const first = categories[0] as Category | undefined;
  if (first && map[first]) return map[first];
  return theme === "light" ? DEFAULT_NODE_COLOR_LIGHT : DEFAULT_NODE_COLOR_DARK;
}

export function hexToPixiNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

const DIFFICULTY_COLORS_DARK: Record<string, string> = {
  Beginner: "#A9E38A",
  Intermediate: "#FFC172",
  Advanced: "#FF9DB3",
};
const DIFFICULTY_COLORS_LIGHT: Record<string, string> = {
  Beginner: "#2E7D37",
  Intermediate: "#A6650A",
  Advanced: "#C82F55",
};

export function difficultyColor(difficulty: string, theme: Theme = "dark"): string {
  const map = theme === "light" ? DIFFICULTY_COLORS_LIGHT : DIFFICULTY_COLORS_DARK;
  return map[difficulty] ?? (theme === "light" ? "#545B69" : "#9BA1B0");
}

// Canvas-only tokens: PixiJS renders to WebGL and can't read CSS variables,
// so the graph's background/edge/label colors are mirrored here per theme.
export interface CanvasTheme {
  edge: number;
  edgeActive: number;
  label: number;
  labelMuted: number;
  nodeStroke: number;
}

const CANVAS_THEME_DARK: CanvasTheme = {
  edge: 0x333846,
  edgeActive: 0xffc857,
  label: 0xedeff3,
  labelMuted: 0x5c6270,
  nodeStroke: 0x0a0b0e,
};

const CANVAS_THEME_LIGHT: CanvasTheme = {
  edge: 0xd7dbe3,
  edgeActive: 0x8a5a00,
  label: 0x14161b,
  labelMuted: 0x8a90a0,
  nodeStroke: 0xffffff,
};

export function canvasTheme(theme: Theme): CanvasTheme {
  return theme === "light" ? CANVAS_THEME_LIGHT : CANVAS_THEME_DARK;
}
