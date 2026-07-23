import { CONSTELLATION_LAYOUT } from "../content/constellationLayout";
import { colorForCategories } from "../lib/categoryColors";
import { useThemeStore } from "../store/themeStore";

/**
 * Purely decorative — sits behind the landing page's centered content.
 * Not the interactive graph (that's GraphCanvas, used on /explore); this
 * is a living, moving starfield: a dim background layer of twinkling
 * stars plus a brighter constellation of the real topic graph on top,
 * all drifting slowly together.
 */
export function ConstellationBackground() {
  const theme = useThemeStore((s) => s.theme);
  const { nodes, edges, backgroundStars, width, height } = CONSTELLATION_LAYOUT;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <g style={{ animation: "constellation-drift 100s ease-in-out infinite" }}>
          {/* Distant starfield */}
          <g className="text-ink-muted" style={{ opacity: 1.5 }}>
            {backgroundStars.map((s) => (
              <circle
                key={s.id}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="currentColor"
                style={{
                  animation: `star-twinkle ${s.duration}s ease-in-out infinite`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </g>

          {/* The real topic graph, dimmer but clearly a constellation */}
          <g className="text-ink-faint" style={{ opacity: 0.5 }}>
            {edges.map((e, i) => (
              <line
                key={i}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="currentColor"
                strokeWidth={1}
                style={{
                  animation: "line-pulse 7s ease-in-out infinite",
                  animationDelay: `${(i % 12) * 0.4}s`,
                }}
              />
            ))}
          </g>
          <g style={{ opacity: 0.5 }}>
            {nodes.map((n, i) => (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={2.5 + Math.min(n.degree, 8) * 0.6}
                fill={colorForCategories(n.categories, theme)}
                style={{
                  animation: "star-twinkle 5s ease-in-out infinite",
                  animationDelay: `${(i % 10) * 0.5}s`,
                }}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}