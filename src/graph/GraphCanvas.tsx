import { useEffect, useRef } from "react";
import {
  Application,
  Container,
  Graphics,
  Text,
  type FederatedPointerEvent,
} from "pixi.js";
import gsap from "gsap";
import type { GraphEdge, GraphNode } from "../types/content";
import { nodeRadius, useForceSimulation } from "./useForceSimulation";
import { colorForCategories, hexToPixiNumber, canvasTheme } from "../lib/categoryColors";
import { useGraphStore } from "../store/graphStore";
import { useThemeStore } from "../store/themeStore";

const MIN_SCALE = 0.35;
const MAX_SCALE = 3.2;

interface NodeVisual {
  node: GraphNode;
  container: Container;
  circle: Graphics;
  glow: Graphics;
  label: Text;
  baseRadius: number;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeActivate: (id: string) => void; // double-click / enter -> navigate to note
}

export function GraphCanvas({ nodes, edges, onNodeActivate }: GraphCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const edgesGfxRef = useRef<Graphics | null>(null);
  const visualsRef = useRef<Map<string, NodeVisual>>(new Map());
  const edgesDataRef = useRef<GraphEdge[]>(edges);
  const onActivateRef = useRef(onNodeActivate);
  onActivateRef.current = onNodeActivate;

  const selectedId = useGraphStore((s) => s.selectedId);
  const hoveredId = useGraphStore((s) => s.hoveredId);
  const searchQuery = useGraphStore((s) => s.searchQuery);
  const focusRequest = useGraphStore((s) => s.focusRequest);
  const setSelected = useGraphStore((s) => s.setSelected);
  const setHovered = useGraphStore((s) => s.setHovered);
  const theme = useThemeStore((s) => s.theme);

  // Mirrored into refs so the simulation's tick handler (registered once
  // per node-set change, not every render) always reads current values.
  const hoveredIdRef = useRef(hoveredId);
  hoveredIdRef.current = hoveredId;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // ---- one-time Pixi application setup ----------------------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let destroyed = false;
    const visuals = visualsRef.current;

    const app = new Application();

    app
      .init({
        backgroundAlpha: 0,
        resizeTo: host,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      })
      .then(() => {
        if (destroyed) {
          app.destroy(true, { children: true });
          return;
        }
        host.appendChild(app.canvas);
        app.canvas.style.touchAction = "none";
        appRef.current = app;

        const world = new Container();
        world.sortableChildren = true;
        app.stage.addChild(world);
        worldRef.current = world;
        world.position.set(app.screen.width / 2, app.screen.height / 2);

        const edgesGfx = new Graphics();
        edgesGfx.zIndex = 0;
        world.addChild(edgesGfx);
        edgesGfxRef.current = edgesGfx;

        // ---- pan + pinch-to-zoom ----
        app.stage.eventMode = "static";
        app.stage.hitArea = app.screen;

        const activePointers = new Map<number, { x: number; y: number }>();
        let dragging = false;
        let dragStart = { x: 0, y: 0 };
        let worldStart = { x: 0, y: 0 };
        let dragDistance = 0;
        const TAP_MOVE_THRESHOLD = 6; // px — beyond this it's a pan, not a tap

        let pinching = false;
        let pinchStartDistance = 0;
        let pinchStartScale = 1;
        let pinchStartMid = { x: 0, y: 0 };
        let pinchStartWorldPos = { x: 0, y: 0 };
        let hadMultiTouch = false; // suppresses tap-to-deselect after a pinch

        const distanceBetween = (
          a: { x: number; y: number },
          b: { x: number; y: number },
        ) => Math.hypot(a.x - b.x, a.y - b.y);
        const midpointOf = (
          a: { x: number; y: number },
          b: { x: number; y: number },
        ) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

        function beginSinglePointerDrag(point: { x: number; y: number }) {
          dragging = true;
          dragDistance = 0;
          dragStart = { x: point.x, y: point.y };
          worldStart = { x: world.position.x, y: world.position.y };
        }

        function beginPinch() {
          const pts = Array.from(activePointers.values());
          if (pts.length < 2) return;
          pinching = true;
          dragging = false;
          pinchStartDistance = distanceBetween(pts[0], pts[1]) || 1;
          pinchStartScale = world.scale.x;
          pinchStartMid = midpointOf(pts[0], pts[1]);
          pinchStartWorldPos = { x: world.position.x, y: world.position.y };
        }

        app.stage.on("pointerdown", (e: FederatedPointerEvent) => {
          activePointers.set(e.pointerId, { x: e.global.x, y: e.global.y });
          if (activePointers.size === 1) {
            hadMultiTouch = false;
            beginSinglePointerDrag({ x: e.global.x, y: e.global.y });
          } else if (activePointers.size === 2) {
            hadMultiTouch = true;
            beginPinch();
          }
        });

        app.stage.on("pointermove", (e: FederatedPointerEvent) => {
          if (!activePointers.has(e.pointerId)) return;
          activePointers.set(e.pointerId, { x: e.global.x, y: e.global.y });

          if (pinching && activePointers.size >= 2) {
            const pts = Array.from(activePointers.values()).slice(0, 2);
            const currentDistance = distanceBetween(pts[0], pts[1]);
            const currentMid = midpointOf(pts[0], pts[1]);
            const nextScale = Math.min(
              MAX_SCALE,
              Math.max(
                MIN_SCALE,
                pinchStartScale * (currentDistance / pinchStartDistance),
              ),
            );
            // keep the point under the pinch's starting midpoint anchored,
            // while also following any two-finger pan movement
            const worldPointAtStart = {
              x: (pinchStartMid.x - pinchStartWorldPos.x) / pinchStartScale,
              y: (pinchStartMid.y - pinchStartWorldPos.y) / pinchStartScale,
            };
            world.scale.set(nextScale);
            world.position.set(
              currentMid.x - worldPointAtStart.x * nextScale,
              currentMid.y - worldPointAtStart.y * nextScale,
            );
            return;
          }

          if (!dragging) return;
          const dx = e.global.x - dragStart.x;
          const dy = e.global.y - dragStart.y;
          dragDistance = Math.hypot(dx, dy);
          world.position.set(worldStart.x + dx, worldStart.y + dy);
        });

        const endPointer = (e: FederatedPointerEvent) => {
          activePointers.delete(e.pointerId);
          if (activePointers.size < 2) pinching = false;
          if (activePointers.size === 1) {
            // seamlessly resume single-finger pan from here, no jump
            const [remaining] = Array.from(activePointers.values());
            beginSinglePointerDrag(remaining);
          } else if (activePointers.size === 0) {
            dragging = false;
          }
        };
        app.stage.on("pointerup", endPointer);
        app.stage.on("pointerupoutside", endPointer);
        app.stage.on("pointercancel", endPointer);

        app.stage.on("pointertap", () => {
          if (!hadMultiTouch && dragDistance < TAP_MOVE_THRESHOLD) {
            setSelected(null);
          }
        });

        // ---- zoom ----
        const onWheel = (e: WheelEvent) => {
          e.preventDefault();
          const rect = host.getBoundingClientRect();
          const pointer = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          const prevScale = world.scale.x;
          const delta = -e.deltaY * 0.0015;
          const nextScale = Math.min(
            MAX_SCALE,
            Math.max(MIN_SCALE, prevScale * (1 + delta)),
          );
          const worldPointBefore = {
            x: (pointer.x - world.position.x) / prevScale,
            y: (pointer.y - world.position.y) / prevScale,
          };
          world.scale.set(nextScale);
          world.position.set(
            pointer.x - worldPointBefore.x * nextScale,
            pointer.y - worldPointBefore.y * nextScale,
          );
        };
        host.addEventListener("wheel", onWheel, { passive: false });

        // Pixi's `resizeTo` option only reacts to the window's resize
        // event — it won't notice this host element changing size on its
        // own (e.g. the right sidebar's width transition). Observe it
        // directly and keep the world visually centered as it happens.
        const resizeObserver = new ResizeObserver(() => {
          const prevCenterX = app.screen.width / 2;
          const prevCenterY = app.screen.height / 2;
          const offsetX = world.position.x - prevCenterX;
          const offsetY = world.position.y - prevCenterY;
          app.resize();
          world.position.set(
            app.screen.width / 2 + offsetX,
            app.screen.height / 2 + offsetY,
          );
        });
        resizeObserver.observe(host);
        (app as any)._cleanupResizeObserver = () => resizeObserver.disconnect();

        (app as any)._cleanupWheel = () =>
          host.removeEventListener("wheel", onWheel);
      });

    return () => {
      destroyed = true;
      const app = appRef.current;
      if (app) {
        (app as any)._cleanupWheel?.();
        (app as any)._cleanupResizeObserver?.();
        app.destroy(true, { children: true });
        appRef.current = null;
      }
      if (host) host.innerHTML = "";
      worldRef.current = null;
      edgesGfxRef.current = null;
      visuals.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- build node visuals whenever the node SET changes ------------------
  useEffect(() => {
    // world may not be ready yet on first paint; retry via rAF loop below
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      const world = worldRef.current;
      if (!world) {
        requestAnimationFrame(build);
        return;
      }

      // clear previous
      for (const v of visualsRef.current.values()) {
        v.container.destroy({ children: true });
      }
      visualsRef.current.clear();

      for (const node of nodes) {
        const radius = nodeRadius(node.degree);
        const color = hexToPixiNumber(colorForCategories(node.categories, theme));
        const ct = canvasTheme(theme);

        const container = new Container();
        container.eventMode = "static";
        container.cursor = "pointer";
        container.zIndex = 2;
        container.x = node.x ?? (Math.random() - 0.5) * 200;
        container.y = node.y ?? (Math.random() - 0.5) * 200;

        let nodeDownPoint = { x: 0, y: 0 };
        let nodeDragDistance = 0;
        const NODE_TAP_THRESHOLD = 6;

        const glow = new Graphics()
          .circle(0, 0, radius + 8)
          .fill({ color, alpha: 0.16 });
        glow.alpha = 0;

        const circle = new Graphics()
          .circle(0, 0, radius)
          .fill({ color })
          .stroke({ width: 1.5, color: ct.nodeStroke, alpha: 0.7 });

        const label = new Text({
          text: node.title,
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            fill: ct.label,
            fontWeight: "500",
          },
        });
        label.anchor.set(0.5, 0);
        label.y = radius + 6;
        label.alpha = radius >= 16 ? 0.85 : 0;

        container.addChild(glow, circle, label);
        world.addChild(container);

        container.on("pointerover", () => {
          setHovered(node.id);
          gsap.to(container.scale, { x: 1.15, y: 1.15, duration: 0.18, ease: "power2.out" });
          gsap.to(label, { alpha: 1, duration: 0.15 });
        });
        container.on("pointerout", () => {
          setHovered(null);
          gsap.to(container.scale, { x: 1, y: 1, duration: 0.22, ease: "power2.out" });
          gsap.to(label, { alpha: radius >= 16 ? 0.85 : 0, duration: 0.2 });
        });

        container.on("pointerdown", (e) => {  
          nodeDownPoint = { x: e.global.x, y: e.global.y };
          nodeDragDistance = 0;
        });
        container.on("pointermove", (e) => {
          nodeDragDistance = Math.hypot(e.global.x - nodeDownPoint.x, e.global.y - nodeDownPoint.y);
        });

        container.on("pointertap", (e) => {
          e.stopPropagation();
          if (nodeDragDistance >= NODE_TAP_THRESHOLD) {
            return;
          }
          setSelected(node.id);
          useGraphStore.getState().requestFocus(node.id);
        });
        container.on("dblclick", () => onActivateRef.current(node.id));

        visualsRef.current.set(node.id, {
          node,
          container,
          circle,
          glow,
          label,
          baseRadius: radius,
        });
      }

      redrawEdges();
    };

    build();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, theme]);

  useEffect(() => {
    edgesDataRef.current = edges;
  }, [edges]);

  function redrawEdges() {
    const gfx = edgesGfxRef.current;
    if (!gfx) return;
    gfx.clear();
    const visuals = visualsRef.current;
    const ct = canvasTheme(themeRef.current);
    const hovered = hoveredIdRef.current;
    const selected = selectedIdRef.current;
    for (const edge of edgesDataRef.current) {
      const a = visuals.get(edge.source as string);
      const b = visuals.get(edge.target as string);
      if (!a || !b) continue;
      const isActive =
        hovered === a.node.id ||
        hovered === b.node.id ||
        selected === a.node.id ||
        selected === b.node.id;
      gfx
        .moveTo(a.container.x, a.container.y)
        .lineTo(b.container.x, b.container.y)
        .stroke({
          width: isActive ? 1.6 : 1,
          color: isActive ? ct.edgeActive : ct.edge,
          alpha: isActive ? 0.8 : 0.5,
        });
    }
  }

  // ---- drive positions from the force simulation --------------------------
  useForceSimulation(nodes, edges, (simNodes) => {
    for (const sn of simNodes) {
      const v = visualsRef.current.get(sn.id);
      if (!v) continue;
      v.container.x = sn.x ?? 0;
      v.container.y = sn.y ?? 0;
    }
    redrawEdges();
  });

  // ---- dim/highlight based on hover, selection, search --------------------
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    for (const v of visualsRef.current.values()) {
      const matchesSearch =
        !query || v.node.title.toLowerCase().includes(query);
      const isDimmed =
        (hoveredId !== null && hoveredId !== v.node.id && !isNeighbor(hoveredId, v.node.id)) ||
        (!!query && !matchesSearch);
      const isSelected = selectedId === v.node.id;
      const isGlowing = isSelected || hoveredId === v.node.id;

      gsap.to(v.container, {
        alpha: isDimmed ? 0.22 : 1,
        duration: 0.25,
        overwrite: true,
      });
      gsap.to(v.glow, {
        alpha: isGlowing ? 1 : 0,
        duration: 0.2,
        overwrite: true,
      });
    }
    redrawEdges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredId, selectedId, searchQuery]);

  function isNeighbor(idA: string, idB: string): boolean {
    if (idA === idB) return true;
    return edgesDataRef.current.some(
      (e) =>
        (e.source === idA && e.target === idB) ||
        (e.target === idA && e.source === idB),
    );
  }

  // ---- camera focus animation ---------------------------------------------
  useEffect(() => {
    if (!focusRequest) return;

    // The right sidebar's width transition (see GraphSidebar.tsx) takes
    // 300ms. Reading app.screen.width immediately would use the
    // pre-shrink canvas size and land off-center once the sidebar
    // finishes opening, so wait for it to settle first.
    const SIDEBAR_TRANSITION_MS = 300;

    const timeout = window.setTimeout(() => {
      const world = worldRef.current;
      const app = appRef.current;
      const visual = visualsRef.current.get(focusRequest.id);
      if (!world || !app || !visual) return;

      const targetScale = 1.4;
      const targetX = app.screen.width / 2 - visual.container.x * targetScale;
      const targetY = app.screen.height / 2 - visual.container.y * targetScale;

      gsap.to(world.scale, {
        x: targetScale,
        y: targetScale,
        duration: 0.7,
        ease: "power3.inOut",
      });
      gsap.to(world.position, {
        x: targetX,
        y: targetY,
        duration: 0.7,
        ease: "power3.inOut",
      });
    }, SIDEBAR_TRANSITION_MS);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="Interactive graph of AI topics and their relationships"
    />
  );
}