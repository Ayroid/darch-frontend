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

// Import parent-child logic (now enabled for auto-configuration)
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
  canContainerContainContainer,
  getContainerChildren,
  clearParentChildCaches,
  invalidateNodeCache,
  getSnapTargets
} from "./parent-child-logic";

// Export types
export type { NodeBounds };

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

// Export parent-child functions (now enabled)
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
  canContainerContainContainer,
  getContainerChildren,
  invalidateNodeCache,
  getSnapTargets
};

/**
 * Clear all caches - unified function for both z-index and parent-child caches
 */
export function clearContainerCaches(): void {
  clearZIndexCaches();
  clearParentChildCaches();
}

/**
 * Updates parent relationships for all nodes based on their current positions.
 * Implements performance optimizations to skip expensive calculations during active dragging.
 * Handles z-index assignment and parent relationship updates in a single pass.
 *
 * Time Complexity: O(n log n) with full parent-child logic
 */
export function updateNodeParentRelationships(
  nodes: Node[],
  forceUpdate: boolean = false,
  isDragEnd: boolean = false
): Node[] {
  // Early return for empty arrays
  if (nodes.length === 0) return nodes;

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

    // Find potential new parent efficiently (parent-child logic)
    const potentialNewParent = findParentContainer(
      node,
      containers,
      nodeMap,
      isDragEnd
    );

    // Check if we should actually update the parent (parent-child logic)
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

    // Handle parent relationship changes (parent-child logic)
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
}

/**
 * Updates parent relationships and returns both updated nodes and nodes with changed parents.
 * This version tracks parent relationship changes to trigger auto-configuration.
 */
export function updateNodeParentRelationshipsWithTracking(
  nodes: Node[],
  forceUpdate: boolean = false,
  isDragEnd: boolean = false
): {
  updatedNodes: Node[],
  nodesWithChangedParents: Set<string>
} {
  // Early return for empty arrays
  if (nodes.length === 0) return { updatedNodes: nodes, nodesWithChangedParents: new Set() };

  // PERFORMANCE: If any node is actively being dragged and this isn't a forced update
  // or drag end event, use shipping-ready z-index-only updates
  if (!forceUpdate && !isDragEnd) {
    const anyNodeDragging = nodes.some((node) => node.dragging);
    if (anyNodeDragging) {
      // Use shipping-ready z-index logic for optimal performance during dragging
      return { updatedNodes: updateNodesZIndex(nodes), nodesWithChangedParents: new Set() };
    }
  }

  // Build efficient lookup structures once
  const { childToParent, containers } = buildParentChildMap(nodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const updatedNodes: Node[] = [];
  const nodesWithChangedParents = new Set<string>();
  let hasChanges = false;

  for (const node of nodes) {
    // Calculate z-index efficiently using shipping-ready logic
    const zIndex = getNodeZIndex(node, childToParent);

    // Find potential new parent efficiently (parent-child logic)
    const potentialNewParent = findParentContainer(
      node,
      containers,
      nodeMap,
      isDragEnd
    );

    // Check if we should actually update the parent (parent-child logic)
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

    // Handle parent relationship changes (parent-child logic)
    if (node.parentId !== newParentId) {
      updatedNode = updateNodeParentRelationship(
        updatedNode,
        newParentId,
        nodeMap
      );
      // Track this node for auto-configuration
      nodesWithChangedParents.add(node.id);
    }

    updatedNodes.push(updatedNode);
  }

  // Clear caches if there were significant changes
  if (hasChanges && forceUpdate) {
    clearContainerCaches();
  }

  return { updatedNodes, nodesWithChangedParents };
}

/**
 * Performs optimized batch updates for multiple node relationship changes.
 * Only processes nodes that have actually changed or are related to changed nodes.
 * Implements drag-aware optimizations to maintain performance during interactive operations.
 *
 * Time Complexity: O(n log n) with parent-child logic enabled
 */
export function batchUpdateNodeRelationships(
  nodes: Node[],
  changedNodeIds: Set<string>,
  isDragEnd: boolean = false
): Node[] {
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

    // Use parent-child logic
    const potentialNewParent = findParentContainer(
      node,
      containers,
      nodeMap,
      isDragEnd
    );

    // Check if we should actually update the parent
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
}

/**
 * Batch update with tracking for auto-configuration
 */
export function batchUpdateNodeRelationshipsWithTracking(
  nodes: Node[],
  changedNodeIds: Set<string>,
  isDragEnd: boolean = false
): {
  updatedNodes: Node[],
  nodesWithChangedParents: Set<string>
} {
  // Only update nodes that actually changed or their potential parents/children
  const { parentToChildren, childToParent, containers } =
    buildParentChildMap(nodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const nodesToUpdate = new Set<string>();
  const nodesWithChangedParents = new Set<string>();

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

  const updatedNodes = nodes.map((node) => {
    if (!nodesToUpdate.has(node.id)) {
      return node; // No change needed
    }

    // Use shipping-ready z-index logic
    const zIndex = getNodeZIndex(node, childToParent);

    // Use parent-child logic
    const potentialNewParent = findParentContainer(
      node,
      containers,
      nodeMap,
      isDragEnd
    );

    // Check if we should actually update the parent
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
      // Track this node for auto-configuration
      nodesWithChangedParents.add(node.id);
    }

    return updatedNode;
  });

  return { updatedNodes, nodesWithChangedParents };
}
