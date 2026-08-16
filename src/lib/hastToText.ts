// Minimal hast node shape we care about — avoids pulling in @types/hast
// just for this one helper.
export interface HastNode {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
}

/**
 * Flattens a hast node (as produced by remark/rehype, e.g. a <code>
 * element already tokenized by rehype-highlight into nested <span>s)
 * back into its original plain-text source. Needed anywhere we need the
 * raw code string — like a copy button — since by the time our
 * components run, `node.children` is markup, not a single string.
 */
export function hastToText(node: HastNode | undefined | null): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  if (node.children) return node.children.map(hastToText).join("");
  return "";
}