/**
 * Parent-Child Relationship Logic for Container Nodes
 * Handles automatic detection and assignment of nodes to container parents
 * NEEDS REFINEMENT - Core logic in development
 */

import { Node } from "@xyflow/react";

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Cache for expensive calculations
const boundsCache = new Map<string, NodeBounds>();
const hierarchyCache = new Map<string, string[]>();
const absolutePositionCache = new Map<string, { x: number; y: number }>();

// AWS container hierarchy (pre-computed for O(1) lookup)
const CONTAINER_HIERARCHY = [
  "aws-account",
  "aws-region",
  "aws-availability-zone",
  "aws-vpc",
  "aws-private-subnet",
  "aws-public-subnet",
  "aws-auto-scaling",
  "aws-local-zone",
  "aws-corporate-datacenter",
  "aws-edge-location",
];

const HIERARCHY_INDEX_MAP = new Map(
  CONTAINER_HIERARCHY.map((type, index) => [type, index])
);

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
  for (const key of boundsCache.keys()) {
    if (key.startsWith(`${nodeId}-`)) {
      boundsCache.delete(key);
    }
  }

  for (const key of absolutePositionCache.keys()) {
    if (key.startsWith(`${nodeId}-`)) {
      absolutePositionCache.delete(key);
    }
  }

  hierarchyCache.delete(nodeId);
}

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

  return isRectangleInside(absoluteNodeBounds, absoluteContainerBounds, 20);
}

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
 * Implements stability checks to prevent unnecessary parent changes during dragging operations.
 * Allows intentional moves outside parents while preventing accidental relationship changes.
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

  // PERFORMANCE: During active dragging (not drag end), be very conservative
  // Only allow changes for nodes that are significantly outside their parent
  if (!isDragEnd && node.dragging) {
    // For containers being dragged, never change parent relationships
    if (node.data?.isContainer) {
      return false;
    }

    // For regular nodes, only change if significantly outside current parent
    if (currentParentId) {
      const currentParent = nodeMap.get(currentParentId);
      if (currentParent) {
        return isNodeSignificantlyOutside(node, currentParent, nodeMap);
      }
    }

    return false;
  }

  // If node currently has a parent
  if (currentParentId) {
    const currentParent = nodeMap.get(currentParentId);
    if (currentParent) {
      const isStillInside = isNodeInsideContainer(node, currentParent, nodeMap);
      const isSignificantlyOutside = isNodeSignificantlyOutside(
        node,
        currentParent,
        nodeMap
      );

      // If node is significantly outside current parent, definitely allow the change
      if (isSignificantlyOutside) {
        return true;
      }

      // If node is completely outside current parent, allow the change (intentional move)
      if (!isStillInside) {
        const isMostlyInside = (() => {
          // Calculate if node is mostly inside using absolute positions
          const nodeBounds = getNodeBounds(node);
          const absoluteNodePos = getAbsoluteNodePosition(node, nodeMap);
          const absoluteParentPos = getAbsoluteNodePosition(
            currentParent,
            nodeMap
          );
          const parentBounds = getNodeBounds(currentParent);

          const absoluteNodeBounds = {
            x: absoluteNodePos.x,
            y: absoluteNodePos.y,
            width: nodeBounds.width,
            height: nodeBounds.height,
          };

          const absoluteParentBounds = {
            x: absoluteParentPos.x,
            y: absoluteParentPos.y,
            width: parentBounds.width,
            height: parentBounds.height,
          };

          return isRectangleMostlyInside(
            absoluteNodeBounds,
            absoluteParentBounds
          );
        })();

        // If not mostly inside anymore, allow the move
        if (!isMostlyInside) {
          return true;
        }
      }

      // If node is still inside current parent and there's a new potential parent
      if (newParent && isStillInside) {
        // Check if new parent is more specific (smaller area)
        const currentParentBounds = getNodeBounds(currentParent);
        const newParentBounds = getNodeBounds(newParent);
        const currentArea =
          currentParentBounds.width * currentParentBounds.height;
        const newArea = newParentBounds.width * newParentBounds.height;

        // Only change if new parent is significantly smaller (more specific)
        return newArea < currentArea * 0.7;
      }

      // Stay with current parent if still mostly inside and no better option
      return false;
    }
  }

  // If no current parent or current parent doesn't exist, check new parent
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
 * Manages the extent property to constrain nodes within their parent containers.
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
        extent: undefined,
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
        extent: "parent",
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
        extent: "parent",
      };
    }
  }

  return {
    ...node,
    parentId: newParentId,
    extent: newParentId ? "parent" : undefined,
  };
}

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
 *
 * Time Complexity: O(1)
 */
export const getContainerHierarchyOrder = (): string[] => {
  return [...CONTAINER_HIERARCHY]; // Return copy to prevent mutation
};

/**
 * Determines if one container can legally contain another based on AWS hierarchy rules.
 * Uses pre-computed hierarchy indices for O(1) lookup performance.
 * Containers can only contain other containers that come after them in the hierarchy.
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
