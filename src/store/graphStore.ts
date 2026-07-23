import { create } from "zustand";

interface GraphState {
  selectedId: string | null;
  hoveredId: string | null;
  searchQuery: string;
  activeCategory: string | null; // used to dim non-matching nodes
  focusRequest: { id: string; nonce: number } | null;

  setSelected: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (c: string | null) => void;
  requestFocus: (id: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  selectedId: null,
  hoveredId: null,
  searchQuery: "",
  activeCategory: null,
  focusRequest: null,

  setSelected: (id) => set({ selectedId: id }),
  setHovered: (id) => set({ hoveredId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategory: (c) => set({ activeCategory: c }),
  requestFocus: (id) =>
    set((s) => ({ focusRequest: { id, nonce: (s.focusRequest?.nonce ?? 0) + 1 } })),
}));
