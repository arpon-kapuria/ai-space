export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface TopicMetadata {
  title: string;
  slug: string;
  categories: string[];
  related: string[];
  tags: string[];
  difficulty: Difficulty;
}

export interface Topic extends TopicMetadata {
  shortNote: string;
  detailedNote: string;
  readingTime: number; // minutes
}

export interface GraphNode {
  id: string;
  title: string;
  categories: string[];
  difficulty: Difficulty;
  tags: string[];
  degree: number; // number of connections, used for sizing
  // populated by the simulation at runtime
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface TopicGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const CATEGORIES = [
  "Mathematics",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Generative AI",
  "LLM Engineering",
  "Production AI",
] as const;

export type Category = (typeof CATEGORIES)[number];
