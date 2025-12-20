/**
 * Parent-Child Relationship Logic for Container Nodes
 *
 * This module implements the core logic for managing hierarchical relationships between
 * container nodes and their children in the architecture designer. It handles automatic
 * parent detection, position calculations, and relationship validation.
 *
 * Core Concepts:
 * -------------
 * 1. Containment: Nodes can be placed inside container nodes (VPC, Subnet, etc.)
 * 2. Hierarchy: AWS resources follow a strict containment hierarchy
 * 3. Positions: Child positions are relative to their parent container
 * 4. Bounds Checking: Determines if a node should belong to a container
 * 5. Snap Targets: Visual feedback for potential parent assignments
 *
 * Key Features:
 * ------------
 * - **Smart Detection**: Finds the most appropriate parent container
 * - **Hierarchy Validation**: Enforces AWS resource nesting rules
 * - **Position Management**: Converts between absolute and relative coordinates
 * - **Performance Optimization**: Extensive caching for expensive calculations
 * - **Stability**: Prevents jittery movement with threshold-based logic
 *
 * AWS Container Hierarchy (Top to Bottom):
 * ---------------------------------------
 * 1. Account → 2. Region → 3. VPC → 4. Availability Zone →
 * 5. Subnets (Public/Private) → 6. Auto Scaling Groups →
 * 7. Security Groups → 8. Resources (EC2, etc.)
 *
 * Function Categories:
 * -------------------
 * - Cache Management: clearParentChildCaches(), invalidateNodeCache()
 * - Bounds Calculation: getNodeBounds(), isRectangleInside()
 * - Position Calculation: getAbsoluteNodePosition()
 * - Parent Finding: findParentContainer(), shouldUpdateParent()
 * - Hierarchy Validation: canContainerContainContainer()
 * - Relationship Building: buildParentChildMap()
 * - Position Updates: updateNodeParentRelationship()
 *
 * @module parent-child-logic
 */

import { Node } from "@xyflow/react";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// =============================================================================
// CACHING INFRASTRUCTURE
// =============================================================================

// Performance caches for expensive calculations
const boundsCache = new Map<string, NodeBounds>();
const hierarchyCache = new Map<string, string[]>();
const absolutePositionCache = new Map<string, { x: number; y: number }>();

// =============================================================================
// AWS HIERARCHY CONFIGURATION
// =============================================================================

// AWS container hierarchy (pre-computed for O(1) lookup)
const CONTAINER_HIERARCHY = [
  "aws-account",
  "aws-region",
  "aws-vpc",
  "aws-availability-zone",
  "aws-private-subnet",
  "aws-public-subnet",
  "aws-auto-scaling",
  "aws-security-group",
  "aws-local-zone",
  "aws-corporate-datacenter",
  "aws-edge-location",
];

// Resource groups that should be at the same hierarchy level
const RESOURCE_GROUPS = {
  "subnet": ["aws-private-subnet", "aws-public-subnet"],
  "zone": ["aws-availability-zone", "aws-local-zone"],
  "scaling": ["aws-auto-scaling"],
  "security": ["aws-security-group"],
  "datacenter": ["aws-corporate-datacenter", "aws-edge-location"]
};

// Create hierarchy index map with grouped resources at same level
const HIERARCHY_INDEX_MAP = new Map();
const groupedHierarchy: string[][] = [];

// Group resources by their logical level
let currentLevel = 0;
const processedResources = new Set<string>();

// Process each resource in the original hierarchy
for (const resource of CONTAINER_HIERARCHY) {
  if (processedResources.has(resource)) continue;

  // Find if this resource belongs to a group
  let resourceGroup: string[] | null = null;
  for (const resources of Object.values(RESOURCE_GROUPS)) {
    if (resources.includes(resource)) {
      resourceGroup = resources;
      break;
    }
  }

  if (resourceGroup) {
    // Process all resources in this group at the same level
    groupedHierarchy.push([...resourceGroup]);
    for (const groupResource of resourceGroup) {
      HIERARCHY_INDEX_MAP.set(groupResource, currentLevel);
      processedResources.add(groupResource);
    }
  } else {
    // Single resource at this level
    groupedHierarchy.push([resource]);
    HIERARCHY_INDEX_MAP.set(resource, currentLevel);
    processedResources.add(resource);
  }

  currentLevel++;
}

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

/**
 * Clear all parent-child relationship caches
 */
export function clearParentChildCaches(): void {
  boundsCache.clear();
  hierarchyCache.clear();
  absolutePositionCache.clear();
}

/**
 * Invalidate cache for a specific node (when it moves)
 */
export function invalidateNodeCache(nodeId: string): void {
  // Remove all cache entries for this node
  for (const key of Array.from(boundsCache.keys())) {
    if (key.startsWith(`${nodeId}-`)) {
      boundsCache.delete(key);
    }
  }

  for (const key of Array.from(absolutePositionCache.keys())) {
    if (key.startsWith(`${nodeId}-`)) {
      absolutePositionCache.delete(key);
    }
  }

  hierarchyCache.delete(nodeId);
}

// =============================================================================
// SNAP DETECTION
// =============================================================================

/**
 * Detects if a node is near a container and could be snapped to it.
 * Returns potential snap targets for visual feedback during dragging.
 * ENHANCED: Adds snap detection for better UX.
 *
 * Time Complexity: O(c) where c is the number of containers
 */
export function getSnapTargets(
  node: Node,
  containers: Node[],
  nodeMap: Map<string, Node>,
  snapDistance: number = 50
): Node[] {
  const snapTargets: Node[] = [];

  for (const container of containers) {
    // Skip self and current parent
    if (container.id === node.id || container.id === node.parentId) {
      continue;
    }

    // Skip containers that are being dragged
    if (container.dragging) {
      continue;
    }

    // Check AWS hierarchy constraints for container-to-container relationships
    if (
      node.data?.isContainer &&
      !canContainerContainContainer(container, node)
    ) {
      continue;
    }

    // Check if node is near the container (within snap distance)
    const nodeBounds = getNodeBounds(node);
    const containerBounds = getNodeBounds(container);
    const absoluteNodePos = getAbsoluteNodePosition(node, nodeMap);
    const absoluteContainerPos = getAbsoluteNodePosition(container, nodeMap);

    const absoluteNodeBounds = {
      x: absoluteNodePos.x,
      y: absoluteNodePos.y,
      width: nodeBounds.width,
      height: nodeBounds.height,
    };

    const absoluteContainerBounds = {
      x: absoluteContainerPos.x,
      y: absoluteContainerPos.y,
      width: containerBounds.width,
      height: containerBounds.height,
    };

    // Check if the node is near the container (within snap distance)
    const isNear = (
      absoluteNodeBounds.x - snapDistance <= absoluteContainerBounds.x + absoluteContainerBounds.width &&
      absoluteNodeBounds.x + absoluteNodeBounds.width + snapDistance >= absoluteContainerBounds.x &&
      absoluteNodeBounds.y - snapDistance <= absoluteContainerBounds.y + absoluteContainerBounds.height &&
      absoluteNodeBounds.y + absoluteNodeBounds.height + snapDistance >= absoluteContainerBounds.y
    );

    if (isNear) {
      snapTargets.push(container);
    }
  }

  return snapTargets;
}

// =============================================================================
// BOUNDS CALCULATION
// =============================================================================

/**
 * Calculates and caches the bounding rectangle of a node including its position and dimensions.
 * Uses default dimensions if not specified: containers default to 250x200, regular nodes to 80x80.
 * Results are cached for performance optimization using position and style as cache key.
 *
 * Time Complexity: O(1) with caching
 */
export function getNodeBounds(node: Node): NodeBounds {
  const cacheKey = `${node.id}-${node.position.x}-${node.position.y}-${node.style?.width}-${node.style?.height}`;

  if (boundsCache.has(cacheKey)) {
    return boundsCache.get(cacheKey)!;
  }

  const width =
    (node.style?.width as number) || (node.data?.isContainer ? 250 : 80);
  const height =
    (node.style?.height as number) || (node.data?.isContainer ? 200 : 80);

  const bounds = {
    x: node.position.x,
    y: node.position.y,
    width,
    height,
  };

  boundsCache.set(cacheKey, bounds);
  return bounds;
}

/**
 * Determines if one rectangle is completely contained within another rectangle.
 * Uses padding to ensure there's sufficient space between the inner rectangle and outer boundaries.
 * This is used for strict containment checks where nodes must be fully inside containers.
 *
 * Time Complexity: O(1)
 */
export function isRectangleInside(
  inner: NodeBounds,
  outer: NodeBounds,
  padding: number = 10
): boolean {
  return (
    inner.x >= outer.x + padding &&
    inner.y >= outer.y + padding &&
    inner.x + inner.width <= outer.x + outer.width - padding &&
    inner.y + inner.height <= outer.y + outer.height - padding
  );
}

/**
 * Determines if a rectangle has significant overlap with a container (used for container assignment).
 * ENHANCED: Simplified to use a single threshold that balances assignment and removal.
 *
 * Time Complexity: O(1)
 */
export function isRectangleWellContained(
  inner: NodeBounds,
  outer: NodeBounds,
  overlapThreshold: number = 0.6 // Balanced threshold for both assignment and removal
): boolean {
  // Calculate overlap area
  const overlapLeft = Math.max(inner.x, outer.x);
  const overlapRight = Math.min(inner.x + inner.width, outer.x + outer.width);
  const overlapTop = Math.max(inner.y, outer.y);
  const overlapBottom = Math.min(
    inner.y + inner.height,
    outer.y + outer.height
  );

  if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
    return false; // No overlap
  }

  const overlapArea =
    (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
  const innerArea = inner.width * inner.height;
  const overlapRatio = overlapArea / innerArea;

  return overlapRatio >= overlapThreshold;
}

/**
 * Determines if one rectangle has significant overlap with another rectangle.
 * Uses an overlap threshold to determine if the inner rectangle is "mostly" inside the outer one.
 * This is more lenient than strict containment and used for stability checks.
 *
 * Time Complexity: O(1)
 */
export function isRectangleMostlyInside(
  inner: NodeBounds,
  outer: NodeBounds,
  overlapThreshold: number = 0.6
): boolean {
  // Calculate overlap area
  const overlapLeft = Math.max(inner.x, outer.x);
  const overlapRight = Math.min(inner.x + inner.width, outer.x + outer.width);
  const overlapTop = Math.max(inner.y, outer.y);
  const overlapBottom = Math.min(
    inner.y + inner.height,
    outer.y + outer.height
  );

  if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
    return false; // No overlap
  }

  const overlapArea =
    (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
  const innerArea = inner.width * inner.height;

  return overlapArea / innerArea >= overlapThreshold;
}

// =============================================================================
// POSITION CALCULATION
// =============================================================================

/**
 * Calculates the absolute position of a node by traversing up the parent hierarchy.
 * Accumulates positions from all parent containers to get the global coordinates.
 * Results are cached using node position and parent hierarchy as cache key.
 *
 * Time Complexity: O(depth) with O(1) amortized through caching
 */
export function getAbsoluteNodePosition(
  node: Node,
  nodeMap: Map<string, Node>
): { x: number; y: number } {
  // Create cache key based on node position and parent hierarchy
  const cacheKey = `${node.id}-${node.position.x}-${node.position.y}-${
    node.parentId || "root"
  }`;

  if (absolutePositionCache.has(cacheKey)) {
    return absolutePositionCache.get(cacheKey)!;
  }

  let absoluteX = node.position.x;
  let absoluteY = node.position.y;
  let currentNode = node;

  // Traverse up the parent hierarchy to calculate absolute position
  while (currentNode.parentId) {
    const parent = nodeMap.get(currentNode.parentId);
    if (!parent) break;

    const parentBounds = getNodeBounds(parent);
    absoluteX += parentBounds.x;
    absoluteY += parentBounds.y;
    currentNode = parent;
  }

  const result = { x: absoluteX, y: absoluteY };
  absolutePositionCache.set(cacheKey, result);
  return result;
}

/**
 * Determines if a node is completely contained within a container using absolute positioning.
 * Prevents circular references by checking if the container is a descendant of the node.
 * Converts both node and container to absolute coordinates before performing containment check.
 *
 * Time Complexity: O(depth) where depth is the container nesting level
 */
export function isNodeInsideContainer(
  node: Node,
  container: Node,
  nodeMap: Map<string, Node>
): boolean {
  // Don't place a container inside itself or create circular references
  if (node.id === container.id) {
    return false;
  }

  // Check for circular reference - if container is a descendant of node
  let currentContainer = container;
  while (currentContainer.parentId) {
    if (currentContainer.parentId === node.id) {
      return false; // Would create circular reference
    }
    const parentContainer = nodeMap.get(currentContainer.parentId);
    if (!parentContainer) break;
    currentContainer = parentContainer;
  }

  const nodeBounds = getNodeBounds(node);
  const containerBounds = getNodeBounds(container);

  // Get absolute position of the node
  const absoluteNodePos = getAbsoluteNodePosition(node, nodeMap);
  const absoluteContainerPos = getAbsoluteNodePosition(container, nodeMap);

  // Create bounds with absolute positions
  const absoluteNodeBounds = {
    x: absoluteNodePos.x,
    y: absoluteNodePos.y,
    width: nodeBounds.width,
    height: nodeBounds.height,
  };

  const absoluteContainerBounds = {
    x: absoluteContainerPos.x,
    y: absoluteContainerPos.y,
    width: containerBounds.width,
    height: containerBounds.height,
  };

  // Use the new "well contained" logic that requires 75% overlap instead of strict containment
  // This makes container assignment more liberal and movement more free
  return isRectangleWellContained(absoluteNodeBounds, absoluteContainerBounds);
}

// =============================================================================
// RELATIONSHIP MANAGEMENT
// =============================================================================

/**
 * Builds efficient lookup maps for parent-child relationships from the nodes array.
 * Creates bidirectional mapping and identifies container nodes for optimization.
 * Used to avoid repeated iteration over all nodes during hierarchy operations.
 *
 * Time Complexity: O(n) where n is the number of nodes
 */
export function buildParentChildMap(nodes: Node[]): {
  parentToChildren: Map<string, string[]>;
  childToParent: Map<string, string>;
  containers: Node[];
} {
  const parentToChildren = new Map<string, string[]>();
  const childToParent = new Map<string, string>();
  const containers: Node[] = [];

  for (const node of nodes) {
    if (node.data?.isContainer) {
      containers.push(node);
    }

    if (node.parentId) {
      childToParent.set(node.id, node.parentId);

      if (!parentToChildren.has(node.parentId)) {
        parentToChildren.set(node.parentId, []);
      }
      parentToChildren.get(node.parentId)!.push(node.id);
    }
  }

  return { parentToChildren, childToParent, containers };
}

/**
 * Determines if a node has been moved significantly outside its parent container boundaries.
 * Uses a buffer zone to account for minor positioning adjustments and prevents
 * unnecessary parent changes for nodes that are just slightly outside the container.
 *
 * Time Complexity: O(depth) due to absolute position calculation
 */
export function isNodeSignificantlyOutside(
  node: Node,
  container: Node,
  nodeMap: Map<string, Node>
): boolean {
  const nodeBounds = getNodeBounds(node);
  const containerBounds = getNodeBounds(container);

  const absoluteNodePos = getAbsoluteNodePosition(node, nodeMap);
  const absoluteContainerPos = getAbsoluteNodePosition(container, nodeMap);

  const absoluteNodeBounds = {
    x: absoluteNodePos.x,
    y: absoluteNodePos.y,
    width: nodeBounds.width,
    height: nodeBounds.height,
  };

  const absoluteContainerBounds = {
    x: absoluteContainerPos.x,
    y: absoluteContainerPos.y,
    width: containerBounds.width,
    height: containerBounds.height,
  };

  // Check if node is completely outside with some buffer
  const buffer = 30; // pixels
  return (
    absoluteNodeBounds.x + absoluteNodeBounds.width <
      absoluteContainerBounds.x - buffer ||
    absoluteNodeBounds.x >
      absoluteContainerBounds.x + absoluteContainerBounds.width + buffer ||
    absoluteNodeBounds.y + absoluteNodeBounds.height <
      absoluteContainerBounds.y - buffer ||
    absoluteNodeBounds.y >
      absoluteContainerBounds.y + absoluteContainerBounds.height + buffer
  );
}

/**
 * Determines whether a node should update its parent relationship based on various criteria.
 * Implements stability checks while allowing free movement and easy parent escape.
 * ENHANCED: Much more permissive to allow nodes to break free from containers easily.
 *
 * Time Complexity: O(depth) for position calculations, with performance shortcuts during dragging
 */
export function shouldUpdateParent(
  node: Node,
  newParent: Node | null,
  nodeMap: Map<string, Node>,
  forceUpdate: boolean = false,
  isDragEnd: boolean = false
): boolean {
  const currentParentId = node.parentId;
  const newParentId = newParent?.id;

  // No change needed if parent is the same
  if (currentParentId === newParentId) {
    return false;
  }

  // If forcing update (like on drop), always update
  if (forceUpdate) {
    return true;
  }

  // ENHANCED: During active dragging, allow much more freedom to move
  if (!isDragEnd && node.dragging) {
    // Always allow nodes to break free from current parents during dragging
    // This makes movement feel natural and removes the "sticky container" problem
    if (currentParentId && !newParentId) {
      return true; // Allow breaking free immediately
    }

    // For containers being dragged, always allow them to break free
    if (node.data?.isContainer && currentParentId) {
      return true; // Containers can always break free during drag
    }

    // Allow assignment to new parent only if well-contained (intentional placement)
    if (!currentParentId && newParentId) {
      return newParent ? isNodeInsideContainer(node, newParent, nodeMap) : false;
    }

    // Allow switching between parents if new parent is better contained
    if (currentParentId && newParentId) {
      const currentParent = nodeMap.get(currentParentId);
      if (currentParent && newParent) {
        const wellContainedInCurrent = isNodeInsideContainer(node, currentParent, nodeMap);
        const wellContainedInNew = isNodeInsideContainer(node, newParent, nodeMap);

        // Switch if new parent contains it better, or if not well-contained in current
        return !wellContainedInCurrent || wellContainedInNew;
      }
    }

    return false;
  }

  // ENHANCED: At drag end, be more responsive to user intent
  if (isDragEnd) {
    // If node currently has a parent
    if (currentParentId) {
      const currentParent = nodeMap.get(currentParentId);
      if (currentParent) {
        const isWellContained = isNodeInsideContainer(node, currentParent, nodeMap);

        // If not well-contained in current parent, allow removal
        if (!isWellContained) {
          return true;
        }

        // If well-contained in current but also well-contained in a new parent
        if (newParent && isWellContained) {
          const isWellContainedInNew = isNodeInsideContainer(node, newParent, nodeMap);
          if (isWellContainedInNew) {
            // Prefer smaller (more specific) containers
            const currentParentBounds = getNodeBounds(currentParent);
            const newParentBounds = getNodeBounds(newParent);
            const currentArea = currentParentBounds.width * currentParentBounds.height;
            const newArea = newParentBounds.width * newParentBounds.height;
            return newArea < currentArea * 0.8; // Switch to smaller container
          }
        }

        return false; // Stay with current parent if well-contained
      }
    }

    // If no current parent, check if new parent should be assigned
    if (newParent) {
      return isNodeInsideContainer(node, newParent, nodeMap);
    }
  }

  // For non-dragging scenarios, use well-contained logic
  if (currentParentId) {
    const currentParent = nodeMap.get(currentParentId);
    if (currentParent) {
      const isWellContained = isNodeInsideContainer(node, currentParent, nodeMap);

      // If not well-contained, allow removal
      if (!isWellContained) {
        return true;
      }

      // If well-contained in current and new parent exists
      if (newParent && isWellContained) {
        const isWellContainedInNew = isNodeInsideContainer(node, newParent, nodeMap);
        if (isWellContainedInNew) {
          // Prefer smaller containers
          const currentParentBounds = getNodeBounds(currentParent);
          const newParentBounds = getNodeBounds(newParent);
          const currentArea = currentParentBounds.width * currentParentBounds.height;
          const newArea = newParentBounds.width * newParentBounds.height;
          return newArea < currentArea * 0.7;
        }
      }

      return false; // Stay with current parent
    }
  }

  // If no current parent, check new parent
  if (newParent) {
    return isNodeInsideContainer(node, newParent, nodeMap);
  }

  return true; // Remove from parent if no new parent found
}

/**
 * Finds the most appropriate parent container for a node based on containment and hierarchy rules.
 * Searches through all containers to find the smallest one that can contain the node.
 * Implements AWS hierarchy constraints and performance optimizations for dragging scenarios.
 *
 * Time Complexity: O(c) where c is the number of containers (typically << n)
 */
export function findParentContainer(
  node: Node,
  containers: Node[],
  nodeMap: Map<string, Node>,
  skipDragCheck: boolean = false
): Node | null {
  // PERFORMANCE: Don't look for parents if this node is being dragged
  // unless explicitly told to skip this check (for drag end scenarios)
  if (!skipDragCheck && node.dragging) {
    return node.parentId ? nodeMap.get(node.parentId) || null : null;
  }

  // PERFORMANCE: If any container in the list is being dragged, don't calculate
  // new relationships as positions are unstable
  if (!skipDragCheck) {
    const anyContainerDragging = containers.some(
      (container) => container.dragging
    );
    if (anyContainerDragging) {
      return node.parentId ? nodeMap.get(node.parentId) || null : null;
    }
  }

  let bestContainer: Node | null = null;
  let smallestArea = Infinity;

  for (const container of containers) {
    // Skip self and current parent
    if (container.id === node.id || container.id === node.parentId) {
      continue;
    }

    // PERFORMANCE: Skip containers that are being dragged
    if (!skipDragCheck && container.dragging) {
      continue;
    }

    // Check if node fits inside container
    if (!isNodeInsideContainer(node, container, nodeMap)) {
      continue;
    }

    // Check AWS hierarchy constraints for container-to-container relationships
    if (
      node.data?.isContainer &&
      !canContainerContainContainer(container, node)
    ) {
      continue;
    }

    // Prefer smallest container (most specific)
    const containerBounds = getNodeBounds(container);
    const area = containerBounds.width * containerBounds.height;

    if (area < smallestArea) {
      smallestArea = area;
      bestContainer = container;
    }
  }

  return bestContainer;
}

/**
 * Updates a single node's parent relationship and adjusts its position coordinates.
 * Handles conversion between absolute and relative positioning when nodes move between parents.
 * REMOVED extent constraints to allow free movement - nodes are no longer bounded by parent containers.
 *
 * Time Complexity: O(depth) due to absolute position calculations
 */
export function updateNodeParentRelationship(
  node: Node,
  newParentId: string | undefined,
  nodeMap: Map<string, Node>
): Node {
  const oldParentId = node.parentId;

  // No change needed
  if (oldParentId === newParentId) {
    return node;
  }

  // Removing from parent - convert to absolute position
  if (oldParentId && !newParentId) {
    const oldParent = nodeMap.get(oldParentId);
    if (oldParent) {
      const absolutePos = getAbsoluteNodePosition(node, nodeMap);
      return {
        ...node,
        parentId: undefined,
        position: absolutePos,
        extent: undefined, // Allow free movement
      };
    }
  }

  // Adding to parent - convert to relative position
  if (!oldParentId && newParentId) {
    const newParent = nodeMap.get(newParentId);
    if (newParent) {
      const newParentAbsolutePos = getAbsoluteNodePosition(newParent, nodeMap);
      return {
        ...node,
        parentId: newParentId,
        position: {
          x: node.position.x - newParentAbsolutePos.x,
          y: node.position.y - newParentAbsolutePos.y,
        },
        extent: undefined, // FIXED: Remove extent constraint to allow free movement
      };
    }
  }

  // Moving between parents
  if (oldParentId && newParentId) {
    const oldParent = nodeMap.get(oldParentId);
    const newParent = nodeMap.get(newParentId);

    if (oldParent && newParent) {
      const absolutePos = getAbsoluteNodePosition(node, nodeMap);
      const newParentAbsolutePos = getAbsoluteNodePosition(newParent, nodeMap);

      return {
        ...node,
        parentId: newParentId,
        position: {
          x: absolutePos.x - newParentAbsolutePos.x,
          y: absolutePos.y - newParentAbsolutePos.y,
        },
        extent: undefined, // FIXED: Remove extent constraint to allow free movement
      };
    }
  }

  return {
    ...node,
    parentId: newParentId,
    extent: undefined, // FIXED: Always allow free movement
  };
}

// =============================================================================
// HIERARCHY & VALIDATION
// =============================================================================

/**
 * Retrieves the complete container hierarchy chain for a given node.
 * Returns an array of parent container IDs from immediate parent to root.
 * Results are cached for performance optimization during repeated calls.
 *
 * Time Complexity: O(h) where h is hierarchy depth, O(1) with caching
 */
export function getContainerHierarchy(
  nodeId: string,
  allNodes: Node[]
): string[] {
  if (hierarchyCache.has(nodeId)) {
    return hierarchyCache.get(nodeId)!;
  }

  const { childToParent } = buildParentChildMap(allNodes);
  const hierarchy: string[] = [];
  let currentId = nodeId;

  while (childToParent.has(currentId)) {
    const parentId = childToParent.get(currentId)!;
    hierarchy.push(parentId);
    currentId = parentId;
  }

  hierarchyCache.set(nodeId, hierarchy);
  return hierarchy;
}

/**
 * Validates that the container relationships don't contain circular references.
 * Performs a depth-first traversal to detect cycles in the parent-child graph.
 * Should be called after major structural changes to ensure graph integrity.
 *
 * Time Complexity: O(n) where n is the number of nodes
 */
export function validateContainerRelationships(nodes: Node[]): boolean {
  const { childToParent } = buildParentChildMap(nodes);
  const visited = new Set<string>();

  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    const pathVisited = new Set<string>();
    let currentId = node.id;

    while (childToParent.has(currentId)) {
      if (pathVisited.has(currentId)) {
        return false; // Cycle detected
      }

      pathVisited.add(currentId);
      visited.add(currentId);
      currentId = childToParent.get(currentId)!;
    }
  }

  return true;
}

/**
 * Returns a copy of the AWS container hierarchy order for external configuration.
 * The hierarchy defines the allowed nesting order from top-level (account) to bottom-level containers.
 * Used for validating and enforcing proper container relationships.
 * Similar resources are grouped at the same level.
 *
 * Time Complexity: O(1)
 */
export const getContainerHierarchyOrder = (): string[] => {
  return [...CONTAINER_HIERARCHY]; // Return copy to prevent mutation
};

/**
 * Returns the grouped hierarchy showing which resources are at the same level.
 * Similar resources like subnets appear in the same array.
 *
 * Time Complexity: O(1)
 */
export const getGroupedHierarchyOrder = (): string[][] => {
  return groupedHierarchy.map(group => [...group]); // Return deep copy to prevent mutation
};

/**
 * Determines if one container can legally contain another based on AWS hierarchy rules.
 * Uses pre-computed hierarchy indices for O(1) lookup performance.
 * Containers can only contain other containers that come after them in the hierarchy.
 * Similar resources (like different subnet types) are considered at the same level.
 *
 * Time Complexity: O(1) with pre-computed hierarchy map
 */
export function canContainerContainContainer(
  containerA: Node,
  containerB: Node
): boolean {
  const aServiceId = (containerA.data?.serviceId as string) || "";
  const bServiceId = (containerB.data?.serviceId as string) || "";

  const aIndex = HIERARCHY_INDEX_MAP.get(aServiceId);
  const bIndex = HIERARCHY_INDEX_MAP.get(bServiceId);

  // If either container type is not in hierarchy, allow containment
  if (aIndex === undefined || bIndex === undefined) {
    return true;
  }

  // Container A can contain B if A comes before B in hierarchy
  // Similar resources at the same level cannot contain each other
  if (aIndex === bIndex) {
    return false; // Same level resources cannot contain each other
  }

  return aIndex < bIndex;
}

/**
 * Recursively retrieves all children (direct and indirect) of a container.
 * Performs breadth-first traversal to collect all descendant node IDs.
 * Useful for operations that need to affect entire container subtrees.
 *
 * Time Complexity: O(c) where c is the total number of children and descendants
 */
export function getContainerChildren(
  containerId: string,
  parentToChildrenMap: Map<string, string[]>
): string[] {
  const result: string[] = [];
  const queue = [containerId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = parentToChildrenMap.get(currentId) || [];

    result.push(...children);
    queue.push(...children);
  }

  return result;
}
