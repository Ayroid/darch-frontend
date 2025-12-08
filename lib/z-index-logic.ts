/**
 * Z-Index Logic for Node Layering
 *
 * This module handles automatic z-index assignment to ensure proper visual layering
 * of nodes on the canvas. Container nodes appear behind their children, with service
 * nodes always on top. Similar resources (e.g., subnets) share the same base z-index.
 *
 * Key Concepts:
 * ------------
 * 1. **Layering**: Containers have lower z-index than services
 * 2. **Depth-Based**: Nested containers get incrementally higher z-index
 * 3. **Grouped Resources**: Similar resources (subnets, zones) share base z-index
 * 4. **Drag Priority**: Dragged nodes always appear on top
 * 5. **Performance**: Extensive caching for repeated calculations
 *
 * Z-Index Ranges:
 * --------------
 * - Containers: 10-100 (base) + depth
 * - Services: 1000 + depth
 * - Dragging: 10000+ (always on top)
 *
 * Base Z-Index Groups:
 * -------------------
 * - Account: 10
 * - Region: 20
 * - Availability/Local Zones: 30 (grouped)
 * - VPC: 40
 * - Subnets: 50 (public/private grouped)
 * - Auto Scaling: 60
 * - Security Groups: 70
 * - Data Centers: 80 (corporate/edge grouped)
 * - Default: 100
 *
 * @module z-index-logic
 */

import { Node } from "@xyflow/react";

// =============================================================================
// CACHING INFRASTRUCTURE
// =============================================================================

// Cache for depth calculations (cleared on major structural changes)
const depthCache = new Map<string, number>();

// =============================================================================
// Z-INDEX CONFIGURATION
// =============================================================================

/**
 * Get the base z-index for a resource type
 * Similar resources share the same base to appear at the same level
 */
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

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

/**
 * Clear z-index related caches
 * Called when nodes are added/removed or major structural changes occur
 */
export function clearZIndexCaches(): void {
  depthCache.clear();
}

// =============================================================================
// Z-INDEX CALCULATION
// =============================================================================

/**
 * Calculate container hierarchy depth with memoization
 * Counts how many parent levels exist above a node
 *
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
 * Get drag-optimized z-index for dragged nodes
 * Ensures nodes being dragged always appear on top of everything else
 * for better visual feedback during drag operations
 *
 * @param node - The node being dragged
 * @returns Z-index value that ensures top-most position
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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Build parent-child relationship map for z-index calculations
 * Creates a map from child node IDs to their parent node IDs
 *
 * Time Complexity: O(n) where n is the number of nodes
 *
 * @param nodes - Array of all nodes in the canvas
 * @returns Map of child node ID to parent node ID
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
