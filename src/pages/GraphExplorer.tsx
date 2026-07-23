import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GraphCanvas } from "../graph/GraphCanvas";
import { GraphSidebar } from "../components/GraphSidebar";
import { CategoryLegend } from "../components/CategoryLegend";
import { TopicSidebar } from "../components/TopicSidebar";
import { FULL_GRAPH, getGraphForCategory } from "../content/loader";
import { useGraphStore } from "../store/graphStore";

export function GraphExplorer() {
  const navigate = useNavigate();
  const { category } = useParams();
  const activeCategory = category ? decodeURIComponent(category) : null;
  const setActiveCategory = useGraphStore((s) => s.setActiveCategory);

  const graph = useMemo(
    () => (activeCategory ? getGraphForCategory(activeCategory) : FULL_GRAPH),
    [activeCategory],
  );

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    navigate(cat ? `/explore/${encodeURIComponent(cat)}` : "/explore");
  }

  return (
    <div className="flex h-full w-full">
      <TopicSidebar />

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <CategoryLegend active={activeCategory} onChange={handleCategoryChange} />
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden font-mono text-[11px] text-ink- sm:block">
          scroll to zoom · drag to pan · click a node to focus · double-click to open
        </div>
        <GraphCanvas
          key={activeCategory ?? "all"}
          nodes={graph.nodes}
          edges={graph.edges}
          onNodeActivate={(id) => navigate(`/topic/${id}`)}
        />
      </div>

      <GraphSidebar />
    </div>
  );
}