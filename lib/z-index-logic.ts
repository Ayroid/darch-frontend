/**
 * Z-Index Logic for Node Layering
 * Handles automatic z-index assignment for proper node layering in the canvas
 * READY FOR SHIPPING - Stable and optimized
 */

import { Node } from "@xyflow/react";

// Cache for depth calculations
const depthCache = new Map<string, number>();

// Helper function to get the base z-index for similar resources
function getResourceGroupZIndex(serviceId: string): number {
  // Base z-indices for different resource groups
  const GROUP_Z_INDEX_MAP = {
    "aws-account": 10,
    "aws-region": 20,
    "aws-availability-zone": 30,
    "aws-local-zone": 30, // Same as availability-zone
    "aws-vpc": 40,
    "aws-private-subnet": 50,
    "aws-public-subnet": 50, // Same as private-subnet
    "aws-auto-scaling": 60,
    "aws-security-group": 70,
    "aws-corporate-datacenter": 80,
    "aws-edge-location": 80, // Same as corporate-datacenter
  };

  return GROUP_Z_INDEX_MAP[serviceId as keyof typeof GROUP_Z_INDEX_MAP] || 100;
}

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
 * Similar resources (like subnets) get the same base z-index to appear at the same level.
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
  const serviceNodeZIndex = 1000;
  const depth = calculateContainerDepth(node, childToParentMap);

  if (node.data?.isContainer) {
    // Use grouped z-index for containers with similar resources at same level
    const serviceId = (node.data?.serviceId as string) || "";
    const baseZIndex = getResourceGroupZIndex(serviceId);
    return baseZIndex + depth;
  } else {
    // Service nodes always appear in front of containers
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
