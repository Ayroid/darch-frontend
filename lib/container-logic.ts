/**
 * Container Logic - Main Entry Point
 *
 * This module provides the main interface for managing container-based node relationships
 * in the architecture designer. It combines z-index layering with parent-child hierarchy
 * to create a cohesive container management system.
 *
 * Key Responsibilities:
 * ------------------
 * 1. Node Layering: Automatic z-index assignment for proper visual stacking
 * 2. Parent Detection: Finding appropriate parent containers for nodes
 * 3. Hierarchy Management: Maintaining valid parent-child relationships
 * 4. Position Conversion: Converting between absolute and relative coordinates
 * 5. Performance Optimization: Caching and drag-aware updates
 *
 * Main Functions:
 * --------------
 * - updateNodeParentRelationships(): Full relationship update with parent detection
 * - batchUpdateNodeRelationships(): Optimized updates for changed nodes only
 * - clearContainerCaches(): Cache management for performance
 *
 * Usage:
 * ------
 * Called during:
 * - Node drag operations (real-time with optimizations)
 * - Node drop events (complete relationship recalculation)
 * - Bulk node operations (batch processing for efficiency)
 * - Auto-configuration triggers (relationship change tracking)
 *
 * @module container-logic
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
 * Helper: Process a single node for parent relationship updates
 * Shared logic between tracking and non-tracking update functions
 */
function processNodeUpdate(
  node: Node,
  containers: Node[],
  nodeMap: Map<string, Node>,
  childToParent: Map<string, string>,
  isDragEnd: boolean,
  forceUpdate: boolean
): {
  updatedNode: Node;
  parentChanged: boolean;
} {
  // Calculate z-index efficiently
  const zIndex = getNodeZIndex(node, childToParent);

  // Find potential new parent
  const potentialNewParent = findParentContainer(node, containers, nodeMap, isDragEnd);

  // Check if we should update the parent
  const shouldUpdate = shouldUpdateParent(node, potentialNewParent, nodeMap, forceUpdate, isDragEnd);
  const newParentId = shouldUpdate ? potentialNewParent?.id || undefined : node.parentId;

  // Check if update is needed
  const needsUpdate = forceUpdate || node.parentId !== newParentId || node.zIndex !== zIndex;

  if (!needsUpdate) {
    return { updatedNode: { ...node, zIndex }, parentChanged: false };
  }

  let updatedNode: Node = { ...node, zIndex };
  let parentChanged = false;

  // Handle parent relationship changes
  if (node.parentId !== newParentId) {
    updatedNode = updateNodeParentRelationship(updatedNode, newParentId, nodeMap);
    parentChanged = true;
  }

  return { updatedNode, parentChanged };
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

  // PERFORMANCE: During active dragging, use z-index-only updates
  if (!forceUpdate && !isDragEnd && nodes.some((node) => node.dragging)) {
    return updateNodesZIndex(nodes);
  }

  // Build efficient lookup structures once
  const { childToParent, containers } = buildParentChildMap(nodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const updatedNodes: Node[] = [];
  let hasChanges = false;

  for (const node of nodes) {
    const { updatedNode, parentChanged } = processNodeUpdate(
      node,
      containers,
      nodeMap,
      childToParent,
      isDragEnd,
      forceUpdate
    );

    if (parentChanged) hasChanges = true;
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
  updatedNodes: Node[];
  nodesWithChangedParents: Set<string>;
} {
  // Early return for empty arrays
  if (nodes.length === 0) return { updatedNodes: nodes, nodesWithChangedParents: new Set() };

  // PERFORMANCE: During active dragging, use z-index-only updates
  if (!forceUpdate && !isDragEnd && nodes.some((node) => node.dragging)) {
    return { updatedNodes: updateNodesZIndex(nodes), nodesWithChangedParents: new Set() };
  }

  // Build efficient lookup structures once
  const { childToParent, containers } = buildParentChildMap(nodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const updatedNodes: Node[] = [];
  const nodesWithChangedParents = new Set<string>();
  let hasChanges = false;

  for (const node of nodes) {
    const { updatedNode, parentChanged } = processNodeUpdate(
      node,
      containers,
      nodeMap,
      childToParent,
      isDragEnd,
      forceUpdate
    );

    if (parentChanged) {
      hasChanges = true;
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
 * Helper: Build set of nodes that need updating in batch operations
 */
function buildNodesToUpdateSet(
  changedNodeIds: Set<string>,
  parentToChildren: Map<string, string[]>,
  childToParent: Map<string, string>
): Set<string> {
  const nodesToUpdate = new Set<string>();

  for (const nodeId of changedNodeIds) {
    nodesToUpdate.add(nodeId);

    // Add children of changed containers
    parentToChildren.get(nodeId)?.forEach((childId) => nodesToUpdate.add(childId));

    // Add parent of changed node
    const parentId = childToParent.get(nodeId);
    if (parentId) nodesToUpdate.add(parentId);
  }

  return nodesToUpdate;
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
  const { parentToChildren, childToParent, containers } = buildParentChildMap(nodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const nodesToUpdate = buildNodesToUpdateSet(changedNodeIds, parentToChildren, childToParent);

  return nodes.map((node) => {
    if (!nodesToUpdate.has(node.id)) {
      return node; // No change needed
    }

    const { updatedNode } = processNodeUpdate(
      node,
      containers,
      nodeMap,
      childToParent,
      isDragEnd,
      false
    );

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
  updatedNodes: Node[];
  nodesWithChangedParents: Set<string>;
} {
  const { parentToChildren, childToParent, containers } = buildParentChildMap(nodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const nodesToUpdate = buildNodesToUpdateSet(changedNodeIds, parentToChildren, childToParent);
  const nodesWithChangedParents = new Set<string>();

  const updatedNodes = nodes.map((node) => {
    if (!nodesToUpdate.has(node.id)) {
      return node; // No change needed
    }

    const { updatedNode, parentChanged } = processNodeUpdate(
      node,
      containers,
      nodeMap,
      childToParent,
      isDragEnd,
      false
    );

    if (parentChanged) {
      nodesWithChangedParents.add(node.id);
    }

    return updatedNode;
  });

  return { updatedNodes, nodesWithChangedParents };
}
