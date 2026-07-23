import { useEffect, useRef } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
} from "d3-force";
import type { GraphEdge, GraphNode } from "../types/content";

export interface SimLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

const BASE_RADIUS = 10;
const RADIUS_PER_DEGREE = 2.2;
const MAX_RADIUS = 30;

export function nodeRadius(degree: number): number {
  return Math.min(MAX_RADIUS, BASE_RADIUS + degree * RADIUS_PER_DEGREE);
}

/**
 * Runs a d3-force simulation over the given nodes/edges and invokes
 * onTick on every simulation step with the (mutated) node array.
 * Nodes/edges are re-seeded whenever the input arrays change identity
 * (e.g. switching category filter).
 */
export function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  onTick: (nodes: GraphNode[]) => void,
) {
  const simRef = useRef<Simulation<GraphNode, SimLink> | null>(null);

  useEffect(() => {
    if (simRef.current) {
      simRef.current.stop();
    }

    // d3-force mutates node objects in place (x, y, vx, vy) and expects
    // fresh copies so switching filters doesn't inherit stale positions
    // from a previous, differently-shaped graph.
    const simNodes = nodes.map((n) => ({ ...n }));
    const links: SimLink[] = edges
      .filter(
        (e) =>
          simNodes.some((n) => n.id === e.source) &&
          simNodes.some((n) => n.id === e.target),
      )
      .map((e) => ({ source: e.source, target: e.target }));

    const simulation = forceSimulation<GraphNode>(simNodes)
      .force(
        "link",
        forceLink<GraphNode, SimLink>(links)
          .id((d) => d.id)
          .distance(110)
          .strength(0.5),
      )
      .force("charge", forceManyBody().strength(-260).distanceMax(600))
      .force("center", forceCenter(0, 0))
      .force(
        "collide",
        forceCollide<GraphNode>((d) => nodeRadius(d.degree) + 18).strength(
          0.9,
        ),
      )
      .alpha(1)
      .alphaDecay(0.02);

    simulation.on("tick", () => {
      onTick(simulation.nodes());
    });

    simRef.current = simulation;

    return () => {
      simulation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  return simRef;
}
