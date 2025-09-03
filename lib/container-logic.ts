/**
 * Container Logic - Main Entry Point
 * Combines Z-Index Logic (shipping-ready) and Parent-Child Logic (in development)
 *
 * SHIPPING STRATEGY:
 * - Z-Index Logic: Stable and ready for production
 * - Parent-Child Logic: Under active development and refinement
 */

import { Node } from "@xyflow/react";

// Import shipping-ready z-index logic
import {
  getNodeZIndex,
  updateNodesZIndex,
  clearZIndexCaches
} from "./z-index-logic";

// Import shipping-ready hierarchy functions
import {
  getContainerHierarchyOrder,
  getGroupedHierarchyOrder
} from "./parent-child-logic";

// COMMENTED OUT: Import parent-child logic (under development)
/*
import {
  NodeBounds,
  getNodeBounds,
  isRectangleInside,
  isRectangleMostlyInside,
  getAbsoluteNodePosition,
  isNodeInsideContainer,
  buildParentChildMap,
  isNodeSignificantlyOutside,
  shouldUpdateParent,
  findParentContainer,
  updateNodeParentRelationship,
  getContainerHierarchy,
  validateContainerRelationships,
  getContainerHierarchyOrder,
  canContainerContainContainer,
  getContainerChildren,
  clearParentChildCaches,
  invalidateNodeCache
} from "./parent-child-logic";
*/

// COMMENTED OUT: Export types
// export type { NodeBounds };

// Export shipping-ready z-index functions
export {
  getNodeZIndex,
  updateNodesZIndex
};

// Export hierarchy utility functions
export {
  getContainerHierarchyOrder,
  getGroupedHierarchyOrder
};

// COMMENTED OUT: Export parent-child functions (under development)
/*
export {
  getNodeBounds,
  isRectangleInside,
  isRectangleMostlyInside,
  getAbsoluteNodePosition,
  isNodeInsideContainer,
  buildParentChildMap,
  isNodeSignificantlyOutside,
  shouldUpdateParent,
  findParentContainer,
  updateNodeParentRelationship,
  getContainerHierarchy,
  validateContainerRelationships,
  getContainerHierarchyOrder,
  canContainerContainContainer,
  getContainerChildren,
  invalidateNodeCache
};
*/

/**
 * Clear all caches - unified function for both z-index and parent-child caches
 * CURRENTLY: Only clearing z-index caches (parent-child logic commented out)
 */
export function clearContainerCaches(): void {
  clearZIndexCaches();
  // COMMENTED OUT: clearParentChildCaches();
}

/**
 * Updates parent relationships for all nodes based on their current positions.
 * Implements performance optimizations to skip expensive calculations during active dragging.
 * Handles z-index assignment and parent relationship updates in a single pass.
 *
 * DEVELOPMENT NOTE: Parent-child logic is currently commented out.
 * Only z-index logic is active for shipping.
 *
 * Time Complexity: O(n) - z-index only updates
 */
export function updateNodeParentRelationships(
  nodes: Node[]
): Node[] {
  // Early return for empty arrays
  if (nodes.length === 0) return nodes;

  // SHIPPING VERSION: Always use z-index-only updates for optimal performance
  return updateNodesZIndex(nodes);

  /* COMMENTED OUT: Parent-child relationship logic
  // PERFORMANCE: If any node is actively being dragged and this isn't a forced update
  // or drag end event, use shipping-ready z-index-only updates
  if (!forceUpdate && !isDragEnd) {
    const anyNodeDragging = nodes.some((node) => node.dragging);
    if (anyNodeDragging) {
      // Use shipping-ready z-index logic for optimal performance during dragging
      return updateNodesZIndex(nodes);
    }
  }

  // Build efficient lookup structures once
  const { childToParent, containers } = buildParentChildMap(nodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const updatedNodes: Node[] = [];
  let hasChanges = false;

  for (const node of nodes) {
    // Calculate z-index efficiently using shipping-ready logic
    const zIndex = getNodeZIndex(node, childToParent);

    // Find potential new parent efficiently (parent-child logic - under development)
    const potentialNewParent = findParentContainer(
      node,
      containers,
      nodeMap,
      isDragEnd
    );

    // Check if we should actually update the parent (parent-child logic - under development)
    const shouldUpdate = shouldUpdateParent(
      node,
      potentialNewParent,
      nodeMap,
      forceUpdate,
      isDragEnd
    );
    const newParentId = shouldUpdate
      ? potentialNewParent?.id || undefined
      : node.parentId;

    // Check if parent relationship needs updating
    const needsUpdate =
      forceUpdate || node.parentId !== newParentId || node.zIndex !== zIndex;

    if (!needsUpdate) {
      updatedNodes.push({ ...node, zIndex });
      continue;
    }

    hasChanges = true;
    let updatedNode: Node = { ...node, zIndex };

    // Handle parent relationship changes (parent-child logic - under development)
    if (node.parentId !== newParentId) {
      updatedNode = updateNodeParentRelationship(
        updatedNode,
        newParentId,
        nodeMap
      );
    }

    updatedNodes.push(updatedNode);
  }

  // Clear caches if there were significant changes
  if (hasChanges && forceUpdate) {
    clearContainerCaches();
  }

  return updatedNodes;
  */
}

/**
 * Performs optimized batch updates for multiple node relationship changes.
 * Only processes nodes that have actually changed or are related to changed nodes.
 * Implements drag-aware optimizations to maintain performance during interactive operations.
 *
 * DEVELOPMENT NOTE: Parent-child logic is currently commented out.
 * Only z-index logic is active for shipping.
 *
 * Time Complexity: O(n) with z-index-only updates
 */
export function batchUpdateNodeRelationships(
  nodes: Node[]
): Node[] {
  // SHIPPING VERSION: Always use z-index-only updates
  return updateNodesZIndex(nodes);

  /* COMMENTED OUT: Parent-child relationship logic
  // Only update nodes that actually changed or their potential parents/children
  const { parentToChildren, childToParent, containers } =
    buildParentChildMap(nodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const nodesToUpdate = new Set<string>();

  // Add changed nodes and their related nodes
  for (const nodeId of changedNodeIds) {
    nodesToUpdate.add(nodeId);

    // Add children of changed containers
    if (parentToChildren.has(nodeId)) {
      parentToChildren
        .get(nodeId)!
        .forEach((childId) => nodesToUpdate.add(childId));
    }

    // Add parent of changed node
    if (childToParent.has(nodeId)) {
      nodesToUpdate.add(childToParent.get(nodeId)!);
    }
  }

  return nodes.map((node) => {
    if (!nodesToUpdate.has(node.id)) {
      return node; // No change needed
    }

    // Use shipping-ready z-index logic
    const zIndex = getNodeZIndex(node, childToParent);

    // Use parent-child logic (under development)
    const potentialNewParent = findParentContainer(
      node,
      containers,
      nodeMap,
      isDragEnd
    );

    // Check if we should actually update the parent (parent-child logic - under development)
    const shouldUpdate = shouldUpdateParent(
      node,
      potentialNewParent,
      nodeMap,
      false,
      isDragEnd
    );
    const newParentId = shouldUpdate
      ? potentialNewParent?.id || undefined
      : node.parentId;

    if (node.parentId === newParentId && node.zIndex === zIndex) {
      return node; // No actual change
    }

    let updatedNode: Node = { ...node, zIndex };
    if (node.parentId !== newParentId) {
      updatedNode = updateNodeParentRelationship(
        updatedNode,
        newParentId,
        nodeMap
      );
    }

    return updatedNode;
  });
  */
}
