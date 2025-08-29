/**
 * Container Logic for Node Parent-Child Relationships
 * Handles automatic detection and assignment of nodes to container parents
 * OPTIMIZED VERSION - Reduced complexity and improved performance
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
const depthCache = new Map<string, number>();
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
 * Clears all internal caches used for performance optimization.
 * This should be called whenever nodes are added or removed from the graph
 * to ensure cache consistency and prevent memory leaks.
 *
 * Time Complexity: O(1)
 *
 * @returns {void}
 */
export function clearContainerCaches(): void {
	boundsCache.clear();
	depthCache.clear();
	hierarchyCache.clear();
	absolutePositionCache.clear();
}

/**
 * Invalidates cached data for a specific node when it has been moved or modified.
 * This is more efficient than clearing all caches when only one node has changed.
 * Removes entries from bounds, position, depth, and hierarchy caches.
 *
 * Time Complexity: O(k) where k is the number of cache entries for the node
 *
 * @param {string} nodeId - The ID of the node whose cache should be invalidated
 * @returns {void}
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

	depthCache.delete(nodeId);
	hierarchyCache.delete(nodeId);
}

/**
 * Calculates and caches the bounding rectangle of a node including its position and dimensions.
 * Uses default dimensions if not specified: containers default to 250x200, regular nodes to 80x80.
 * Results are cached for performance optimization using position and style as cache key.
 *
 * Time Complexity: O(1) with caching
 *
 * @param {Node} node - The node to calculate bounds for
 * @returns {NodeBounds} Object containing x, y, width, and height of the node
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
 *
 * @param {NodeBounds} inner - The rectangle that should be inside
 * @param {NodeBounds} outer - The container rectangle
 * @param {number} [padding=10] - Minimum distance from container edges
 * @returns {boolean} True if inner rectangle is completely inside outer rectangle
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
 *
 * @param {NodeBounds} inner - The rectangle to check overlap for
 * @param {NodeBounds} outer - The container rectangle
 * @param {number} [overlapThreshold=0.6] - Minimum overlap ratio (0.0 to 1.0)
 * @returns {boolean} True if overlap area meets or exceeds the threshold
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
 *
 * @param {Node} node - The node to calculate absolute position for
 * @param {Map<string, Node>} nodeMap - Map of all nodes by ID for efficient lookup
 * @returns {{x: number, y: number}} The absolute coordinates of the node
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
 *
 * @param {Node} node - The node to check containment for
 * @param {Node} container - The potential parent container
 * @param {Map<string, Node>} nodeMap - Map of all nodes for hierarchy traversal
 * @returns {boolean} True if node is completely inside container without circular references
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
 *
 * @param {Node[]} nodes - Array of all nodes in the graph
 * @returns {{parentToChildren: Map<string, string[]>, childToParent: Map<string, string>, containers: Node[]}}
 *          Object containing parent-to-children map, child-to-parent map, and container nodes array
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
 * Calculates the depth of a container in the hierarchy with memoization for performance.
 * Depth is determined by counting ancestors up to the root level.
 * Includes circular reference detection to prevent infinite loops.
 *
 * Time Complexity: O(1) amortized with caching, O(depth) worst case
 *
 * @param {Node} node - The node to calculate depth for
 * @param {Map<string, string>} childToParentMap - Mapping from child ID to parent ID
 * @returns {number} The depth level of the node (0 for root level)
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
 * Determines if a node has been moved significantly outside its parent container boundaries.
 * Uses a buffer zone to account for minor positioning adjustments and prevents
 * unnecessary parent changes for nodes that are just slightly outside the container.
 *
 * Time Complexity: O(depth) due to absolute position calculation
 *
 * @param {Node} node - The node to check
 * @param {Node} container - The parent container to check against
 * @param {Map<string, Node>} nodeMap - Map of all nodes for position calculation
 * @returns {boolean} True if the node is significantly outside the container
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
 *
 * @param {Node} node - The node that might change parents
 * @param {Node | null} newParent - The potential new parent container
 * @param {Map<string, Node>} nodeMap - Map of all nodes for hierarchy operations
 * @param {boolean} [forceUpdate=false] - Whether to force the update regardless of other checks
 * @param {boolean} [isDragEnd=false] - Whether this is called at the end of a drag operation
 * @returns {boolean} True if the parent relationship should be updated
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
 *
 * @param {Node} node - The node that needs a parent container
 * @param {Node[]} containers - Array of all container nodes to search through
 * @param {Map<string, Node>} nodeMap - Map of all nodes for hierarchy operations
 * @param {boolean} [skipDragCheck=false] - Whether to skip drag state optimizations
 * @returns {Node | null} The best container to be the parent, or null if none found
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
 * Updates parent relationships for all nodes based on their current positions.
 * Implements performance optimizations to skip expensive calculations during active dragging.
 * Handles z-index assignment and parent relationship updates in a single pass.
 *
 * Time Complexity: Reduced from O(n³) to O(n) through optimizations
 *
 * @param {Node[]} nodes - Array of all nodes to process
 * @param {boolean} [forceUpdate=false] - Whether to force updates regardless of drag state
 * @param {boolean} [isDragEnd=false] - Whether this is called at the end of a drag operation
 * @returns {Node[]} Updated array of nodes with new parent relationships and z-indices
 */
export function updateNodeParentRelationships(
	nodes: Node[],
	forceUpdate: boolean = false,
	isDragEnd: boolean = false
): Node[] {
	// Early return for empty arrays
	if (nodes.length === 0) return nodes;

	// PERFORMANCE: If any node is actively being dragged and this isn't a forced update
	// or drag end event, skip expensive calculations
	if (!forceUpdate && !isDragEnd) {
		const anyNodeDragging = nodes.some((node) => node.dragging);
		if (anyNodeDragging) {
			// Only update z-index for dragging nodes to ensure proper layering
			return nodes.map((node) => {
				if (!node.dragging) return node;

				// Quick z-index calculation without full parent lookup
				const serviceNodeZIndex = 1000;
				const dragZIndexBoost = 10000; // Ensure dragging nodes are on top

				if (node.data?.isContainer) {
					return { ...node, zIndex: dragZIndexBoost };
				} else {
					return { ...node, zIndex: serviceNodeZIndex + dragZIndexBoost };
				}
			});
		}
	}

	// Build efficient lookup structures once
	const { childToParent, containers } = buildParentChildMap(nodes);
	const nodeMap = new Map(nodes.map((node) => [node.id, node]));

	const updatedNodes: Node[] = [];
	let hasChanges = false;

	for (const node of nodes) {
		// Calculate z-index efficiently
		const zIndex = getNodeZIndex(node, childToParent);

		// Find potential new parent efficiently
		const potentialNewParent = findParentContainer(
			node,
			containers,
			nodeMap,
			isDragEnd
		);

		// Check if we should actually update the parent (with stability checks)
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

		// Handle parent relationship changes
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
 * Updates a single node's parent relationship and adjusts its position coordinates.
 * Handles conversion between absolute and relative positioning when nodes move between parents.
 * Manages the extent property to constrain nodes within their parent containers.
 *
 * Time Complexity: O(depth) due to absolute position calculations
 *
 * @param {Node} node - The node to update
 * @param {string | undefined} newParentId - The ID of the new parent, or undefined to remove parent
 * @param {Map<string, Node>} nodeMap - Map of all nodes for position calculations
 * @returns {Node} Updated node with new parent relationship and adjusted position
 */
function updateNodeParentRelationship(
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
 *
 * @param {string} nodeId - The ID of the node to get hierarchy for
 * @param {Node[]} allNodes - Array of all nodes to build parent relationships from
 * @returns {string[]} Array of parent IDs in order from immediate parent to root
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
 *
 * @param {Node[]} nodes - Array of all nodes to validate
 * @returns {boolean} True if all relationships are valid (no cycles), false if cycles detected
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
 *
 * @returns {string[]} Copy of the container hierarchy array to prevent external mutation
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
 *
 * @param {Node} containerA - The potential parent container
 * @param {Node} containerB - The container that would be contained
 * @returns {boolean} True if containerA can contain containerB according to AWS hierarchy
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
 *
 * @param {string} containerId - The ID of the container to get children for
 * @param {Map<string, string[]>} parentToChildrenMap - Map from parent ID to array of child IDs
 * @returns {string[]} Array of all descendant node IDs
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

/**
 * Performs optimized batch updates for multiple node relationship changes.
 * Only processes nodes that have actually changed or are related to changed nodes.
 * Implements drag-aware optimizations to maintain performance during interactive operations.
 *
 * Time Complexity: Reduced from O(n²) to O(n) through selective updates
 *
 * @param {Node[]} nodes - Array of all nodes in the graph
 * @param {Set<string>} changedNodeIds - Set of node IDs that have been modified
 * @param {boolean} [isDragEnd=false] - Whether this is called at the end of drag operations
 * @returns {Node[]} Updated array of nodes with recalculated relationships
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

		const zIndex = getNodeZIndex(node, childToParent);
		const potentialNewParent = findParentContainer(
			node,
			containers,
			nodeMap,
			isDragEnd
		);

		// Check if we should actually update the parent (with stability checks)
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
