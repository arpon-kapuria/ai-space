import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { FULL_GRAPH } from "./loader";

export interface ConstellationNode {
  id: string;
  x: number;
  y: number;
  categories: string[];
  degree: number;
}

export interface ConstellationEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BackgroundStar {
  id: number;
  x: number;
  y: number;
  r: number;
  duration: number; // twinkle animation duration, seconds
  delay: number; // twinkle animation delay, seconds
}

export interface ConstellationLayout {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  backgroundStars: BackgroundStar[];
  width: number;
  height: number;
}

const WIDTH = 1200;
const HEIGHT = 700;
const SETTLE_TICKS = 260;
const STAR_COUNT = 160;

// Deterministic PRNG (mulberry32) so the starfield is stable across
// re-renders and reloads instead of jumping around every mount.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeBackgroundStars(): BackgroundStar[] {
  const random = mulberry32(20260722);
  const stars: BackgroundStar[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      id: i,
      x: random() * WIDTH,
      y: random() * HEIGHT,
      r: 0.5 + random() * 1.5,
      duration: 2.5 + random() * 4.5,
      delay: random() * 6,
    });
  }
  return stars;
}

// This runs once at module load — a decorative background has no need to
// re-simulate on every render (or ever move), unlike the live graph on
// /explore. Positions are derived from the real topic graph so the
// constellation reflects actual structure rather than random noise.
function computeLayout(): ConstellationLayout {
  interface SimNode {
    id: string;
    categories: string[];
    degree: number;
    x?: number;
    y?: number;
  }

  const nodes: SimNode[] = FULL_GRAPH.nodes.map((n) => ({
    id: n.id,
    categories: n.categories,
    degree: n.degree,
  }));
  const links = FULL_GRAPH.edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  const simulation = forceSimulation(nodes)
    .force(
      "link",
      forceLink(links)
        .id((d: any) => d.id)
        .distance(85)
        .strength(0.35),
    )
    .force("charge", forceManyBody().strength(-85))
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
    .force(
      "collide",
      forceCollide((d: any) => 8 + Math.min(d.degree, 8) * 1.4),
    )
    .stop();

  for (let i = 0; i < SETTLE_TICKS; i++) simulation.tick();

  const nodeMap = new Map<string, ConstellationNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, {
      id: n.id,
      x: n.x ?? WIDTH / 2,
      y: n.y ?? HEIGHT / 2,
      categories: n.categories,
      degree: n.degree,
    });
  }

  const edges: ConstellationEdge[] = [];
  for (const e of FULL_GRAPH.edges) {
    const a = nodeMap.get(e.source);
    const b = nodeMap.get(e.target);
    if (a && b) edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
    backgroundStars: computeBackgroundStars(),
    width: WIDTH,
    height: HEIGHT,
  };
}

export const CONSTELLATION_LAYOUT: ConstellationLayout = computeLayout();