/**
 * Z-Index Logic for Node Layering
 * Handles automatic z-index assignment for proper node layering in the canvas
 * READY FOR SHIPPING - Stable and optimized
 */

import { Node } from "@xyflow/react";

// Cache for depth calculations
const depthCache = new Map<string, number>();

/**
 * Clear z-index related caches
 */
export function clearZIndexCaches(): void {
  depthCache.clear();
}

/**
 * Calculate container hierarchy depth with memoization
 * Time Complexity: O(1) amortized with caching
 */
export function calculateContainerDepth(
  node: Node,
  childToParentMap: Map<string, string>
): number {
  if (depthCache.has(node.id)) {
    return depthCache.get(node.id)!;
  }

  let depth = 0;
  let currentId = node.id;
  const visited = new Set<string>();

  while (childToParentMap.has(currentId)) {
    if (visited.has(currentId)) {
      // Circular reference detected - break and return current depth
      console.warn(
        `Circular reference detected in container hierarchy: ${currentId}`
      );
      break;
    }

    visited.add(currentId);
    currentId = childToParentMap.get(currentId)!;
    depth++;
  }

  depthCache.set(node.id, depth);
  return depth;
}

/**
 * Calculates the appropriate z-index for a node based on its type and hierarchy depth.
 * Container nodes get lower z-index values to appear behind their children.
 * Service nodes get higher z-index values to appear in front of containers.
 *
 * Time Complexity: O(1) amortized through depth caching
 *
 * @param {Node} node - The node to calculate z-index for
 * @param {Map<string, string>} childToParentMap - Mapping for efficient depth calculation
 * @returns {number} The z-index value for proper layering
 */
export function getNodeZIndex(
  node: Node,
  childToParentMap: Map<string, string>
): number {
  const baseZIndex = 1;
  const containerZIndexIncrement = 10;
  const serviceNodeZIndex = 1000;

  const depth = calculateContainerDepth(node, childToParentMap);

  if (node.data?.isContainer) {
    return baseZIndex + depth * containerZIndexIncrement;
  } else {
    return serviceNodeZIndex + depth;
  }
}

/**
 * Get drag-optimized z-index for nodes being dragged
 * Ensures dragging nodes appear on top of all other nodes
 */
export function getDragZIndex(node: Node): number {
  const serviceNodeZIndex = 1000;
  const dragZIndexBoost = 10000; // Ensure dragging nodes are on top

  if (node.data?.isContainer) {
    return dragZIndexBoost;
  } else {
    return serviceNodeZIndex + dragZIndexBoost;
  }
}

/**
 * Build parent-child relationship map for z-index calculations
 * Time Complexity: O(n)
 */
export function buildChildToParentMap(nodes: Node[]): Map<string, string> {
  const childToParent = new Map<string, string>();

  for (const node of nodes) {
    if (node.parentId) {
      childToParent.set(node.id, node.parentId);
    }
  }

  return childToParent;
}

/**
 * Update z-index for all nodes
 * OPTIMIZED: Lightweight function for z-index only updates
 */
export function updateNodesZIndex(nodes: Node[]): Node[] {
  const childToParentMap = buildChildToParentMap(nodes);

  return nodes.map(node => {
    // Use drag z-index for nodes being dragged
    if (node.dragging) {
      return { ...node, zIndex: getDragZIndex(node) };
    }

    // Calculate normal z-index
    const zIndex = getNodeZIndex(node, childToParentMap);
    return { ...node, zIndex };
  });
}
