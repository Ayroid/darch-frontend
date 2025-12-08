"use client";

import React from "react";
import Image from "next/image";
import {
	Node,
	Edge,
	Handle,
	Position,
	useStore,
	NodeChange,
	NodeProps,
} from "@xyflow/react";
import {
	updateNodeParentRelationships,
	clearContainerCaches,
	updateNodeParentRelationshipsWithTracking,
	batchUpdateNodeRelationshipsWithTracking,
} from "@/lib/container-logic";
import { autoConfigureNode } from "@/lib/auto-configuration";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

// Type for architecture store - we'll use specific methods
type ArchitectureStore = {
	getNodeConfiguration: (nodeId: string) => AWSResourceConfiguration | null;
	updateNodeConfiguration: (
		nodeId: string,
		config: Partial<AWSResourceConfiguration>
	) => void;
	nodeConfigurations: Record<string, AWSResourceConfiguration>;
};

// Interfaces
export interface AWSServiceNodeData {
	icon: string;
	name: string;
	serviceId?: string; // Add serviceId for consistency
}

export interface AWSContainerNodeData {
	icon: string;
	name: string;
	isContainer: boolean;
	serviceId?: string; // Add serviceId for styling
}

export interface AWSServiceNodeProps {
	id: string;
	data: AWSServiceNodeData;
	selected?: boolean;
}

export interface AWSContainerNodeProps {
	id: string;
	data: AWSContainerNodeData;
	selected?: boolean;
	onNodeSizeChange?: (id: string, width: number, height: number, x?: number, y?: number) => void;
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

// Bidirectional Handle Component
interface BidirectionalHandleProps {
	position: Position;
	isConnected: boolean;
	style: React.CSSProperties;
}

function BidirectionalHandle({ position, isConnected, style }: BidirectionalHandleProps) {
	const positionClass = `handle-${position.toLowerCase()}`;
	const connectedClass = isConnected ? "connected" : "";

	return (
		<>
			{/* Target Handle */}
			<Handle
				type="target"
				position={position}
				id={`${position.toLowerCase()}-target`}
				className={`${positionClass} ${connectedClass}`}
				style={{
					...style,
					background: "#555",
					width: "12px",
					height: "12px",
					border: "none",
				}}
			/>
			{/* Source Handle */}
			<Handle
				type="source"
				position={position}
				id={`${position.toLowerCase()}-source`}
				className={`${positionClass} ${connectedClass}`}
				style={{
					...style,
					background: "transparent",
					border: "2px solid #555",
					width: "12px",
					height: "12px",
				}}
			/>
		</>
	);
}

// Node Label Component with smart text wrapping
interface NodeLabelProps {
	text: string;
	maxLength?: number;
}

function NodeLabel({ text, maxLength = 20 }: NodeLabelProps) {
	if (text.length <= 10) {
		return <>{text}</>;
	}

	if (text.length <= maxLength) {
		const mid = Math.ceil(text.length / 2);
		const firstLine = text.slice(0, mid);
		const secondLine = text.slice(mid);
		return (
			<>
				{firstLine}
				<br />
				{secondLine}
			</>
		);
	}

	const truncated = text.slice(0, 17);
	const mid = Math.ceil(truncated.length / 2);
	const firstLine = truncated.slice(0, mid);
	const secondLine = truncated.slice(mid);
	return (
		<>
			{firstLine}
			<br />
			{secondLine}...
		</>
	);
}

// Resize Handle Component
interface ResizeHandleProps {
	position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	onMouseDown: (e: React.MouseEvent) => void;
}

function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
	const positionStyles: Record<string, React.CSSProperties> = {
		"top-left": {
			top: -4,
			left: -4,
			cursor: "nw-resize",
		},
		"top-right": {
			top: -4,
			right: -4,
			cursor: "ne-resize",
		},
		"bottom-left": {
			bottom: -4,
			left: -4,
			cursor: "sw-resize",
		},
		"bottom-right": {
			bottom: -4,
			right: -4,
			cursor: "se-resize",
		},
	};

	return (
		<div
			className={`resize-handle ${position} nodrag`}
			style={{
				position: "absolute",
				...positionStyles[position],
				width: 8,
				height: 8,
				backgroundColor: "#fff",
				border: "1.5px solid #555",
				borderRadius: 1,
				opacity: 0,
				transition: "opacity 0.2s ease",
				zIndex: 100,
			}}
			onMouseDown={onMouseDown}
		/>
	);
}

// Container Header Component
interface ContainerHeaderProps {
	icon: string;
	name: string;
}

function ContainerHeader({ icon, name }: ContainerHeaderProps) {
	return (
		<div
			className="container-header"
			style={{ position: "absolute", top: -1, left: -1 }}
		>
			<Image
				src={icon}
				alt={name}
				width={20}
				height={20}
				className="w-7 h-7 rounded-tl-sm"
			/>
			<span className="text-sm font-semibold">{name}</span>
		</div>
	);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get service-specific border color
export function getBorderColor(serviceId?: string): string {
	const colorMap: Record<string, string> = {
		"aws-vpc": "#8C4FFF",
		"aws-private-subnet": "#00A4A6",
		"aws-public-subnet": "#7AA116",
		"aws-auto-scaling": "#ED7100",
		"aws-region": "#000000",
		"aws-availability-zone": "#00A4A6",
		"aws-account": "#E7157B",
		"aws-corporate-datacenter": "#666666",
		"aws-local-zone": "#4A90E2",
		"aws-edge-location": "#FF9500",
		"aws-security-group": "#FF0000",
	};

	return colorMap[serviceId || ""] || "#8C4FFF";
}

// Calculate handle positions
export function calculateHandlePositions(width: number, height: number) {
	return {
		top: { top: 0, left: width / 2 },
		right: { top: height / 2, right: -7 },
		bottom: { bottom: -7, left: width / 2 },
		left: { top: height / 2, left: 0 },
	};
}

// Helper function to check if a handle is connected (checking both source and target versions)
export const isHandleConnected = (
	nodeId: string,
	handlePosition: string,
	edges: Edge[]
): boolean => {
	return edges.some(
		(edge) =>
			// Check for source connections from this position
			(edge.source === nodeId &&
				edge.sourceHandle === `${handlePosition}-source`) ||
			// Check for target connections to this position
			(edge.target === nodeId &&
				edge.targetHandle === `${handlePosition}-target`) ||
			// Legacy support for old handle IDs
			(edge.source === nodeId && edge.sourceHandle === handlePosition) ||
			(edge.target === nodeId && edge.targetHandle === handlePosition)
	);
};

// ============================================================================
// NODE COMPONENTS
// ============================================================================

// AWS Service Node Component with handles
export function AWSServiceNode({ id, data }: AWSServiceNodeProps) {
	const { icon, name } = data;
	const edges = useStore((state) => state.edges);

	// Fixed square dimensions for service nodes
	const nodeSize = 80;

	// Calculate handle positions for service nodes
	const handlePositions = {
		top: { top: 0, left: nodeSize / 2 },
		right: { top: nodeSize / 2, right: -6 },
		bottom: { bottom: -6, left: nodeSize / 2 },
		left: { top: nodeSize / 2, left: 0 },
	};

	// Check connection status for each position
	const connections = {
		top: isHandleConnected(id, "top", edges),
		right: isHandleConnected(id, "right", edges),
		bottom: isHandleConnected(id, "bottom", edges),
		left: isHandleConnected(id, "left", edges),
	};

	return (
		<div
			className="relative flex flex-col items-center justify-center gap-1"
			style={{
				minWidth: nodeSize,
				minHeight: nodeSize,
				width: nodeSize,
				height: nodeSize,
			}}
		>
			{/* All Handles */}
			<BidirectionalHandle
				position={Position.Top}
				isConnected={connections.top}
				style={handlePositions.top}
			/>
			<BidirectionalHandle
				position={Position.Right}
				isConnected={connections.right}
				style={handlePositions.right}
			/>
			<BidirectionalHandle
				position={Position.Bottom}
				isConnected={connections.bottom}
				style={handlePositions.bottom}
			/>
			<BidirectionalHandle
				position={Position.Left}
				isConnected={connections.left}
				style={handlePositions.left}
			/>

			{/* Node content */}
			<div className="flex flex-col items-center justify-center gap-1 bg-red-100">
				<Image
					src={icon}
					alt={name}
					width={32}
					height={32}
					className="w-8 h-8"
				/>
				<span className="text-xs text-center font-medium text-gray-700 max-w-[60px] leading-tight">
					<NodeLabel text={name} />
				</span>
			</div>
		</div>
	);
}

// AWS Container Node Component - for resources that can contain other resources
export function AWSContainerNode({
	id,
	data,
	onNodeSizeChange,
}: AWSContainerNodeProps) {
	const { icon, name, serviceId } = data;
	const edges = useStore((state) => state.edges);
	const nodes = useStore((state) => state.nodes);

	// Get current node to access its style
	const currentNode = nodes.find((node) => node.id === id);
	const nodeSize = {
		width: (currentNode?.style?.width as number) || 250,
		height: (currentNode?.style?.height as number) || 200,
	};

	// Calculate handle positions based on current node size
	const handlePositions = calculateHandlePositions(nodeSize.width, nodeSize.height);

	// Check connection status for each position
	const connections = {
		top: isHandleConnected(id, "top", edges),
		right: isHandleConnected(id, "right", edges),
		bottom: isHandleConnected(id, "bottom", edges),
		left: isHandleConnected(id, "left", edges),
	};

	// Handle resize mouse down for different corners
	function handleResizeMouseDown(
		corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
	) {
		return (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const startX = e.clientX;
			const startY = e.clientY;
			const startWidth = nodeSize.width;
			const startHeight = nodeSize.height;

			// Get the current node position
			const startPosition = currentNode?.position || { x: 0, y: 0 };

			const handleMouseMove = (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();

				const deltaX = e.clientX - startX;
				const deltaY = e.clientY - startY;

				let newWidth = startWidth;
				let newHeight = startHeight;
				let newX = startPosition.x;
				let newY = startPosition.y;

				// Calculate new dimensions and position based on corner
				switch (corner) {
					case "bottom-right":
						// Expand right and down - no position change needed
						newWidth = Math.max(250, startWidth + deltaX);
						newHeight = Math.max(200, startHeight + deltaY);
						break;
					case "bottom-left":
						// Expand left and down - adjust X position to keep right edge fixed
						newWidth = Math.max(250, startWidth - deltaX);
						newHeight = Math.max(200, startHeight + deltaY);
						// Position changes by the actual width change
						newX = startPosition.x + (startWidth - newWidth);
						break;
					case "top-right":
						// Expand right and up - adjust Y position to keep bottom edge fixed
						newWidth = Math.max(250, startWidth + deltaX);
						newHeight = Math.max(200, startHeight - deltaY);
						// Position changes by the actual height change
						newY = startPosition.y + (startHeight - newHeight);
						break;
					case "top-left":
						// Expand left and up - adjust both X and Y positions
						newWidth = Math.max(250, startWidth - deltaX);
						newHeight = Math.max(200, startHeight - deltaY);
						// Position changes by the actual width and height changes
						newX = startPosition.x + (startWidth - newWidth);
						newY = startPosition.y + (startHeight - newHeight);
						break;
				}

				// Update both size and position
				onNodeSizeChange?.(id, newWidth, newHeight, newX, newY);
			};

			const handleMouseUp = (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();

				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		};
	}

	const borderColor = getBorderColor(serviceId);

	return (
		<div
			className="relative rounded-sm"
			data-service-id={serviceId}
			style={{
				width: nodeSize.width,
				height: nodeSize.height,
				minWidth: 250,
				minHeight: 200,
				border: `1px ${
					serviceId === "aws-region" ? "dashed" : "solid"
				} ${borderColor}`,
				background:
					serviceId === "aws-region" ? "transparent" : `${borderColor}0D`,
			}}
		>
			{/* All Handles */}
			<BidirectionalHandle
				position={Position.Top}
				isConnected={connections.top}
				style={handlePositions.top}
			/>
			<BidirectionalHandle
				position={Position.Right}
				isConnected={connections.right}
				style={handlePositions.right}
			/>
			<BidirectionalHandle
				position={Position.Bottom}
				isConnected={connections.bottom}
				style={handlePositions.bottom}
			/>
			<BidirectionalHandle
				position={Position.Left}
				isConnected={connections.left}
				style={handlePositions.left}
			/>

			{/* Container header */}
			<ContainerHeader icon={icon} name={name} />

			{/* Resize handles at all 4 corners */}
			<ResizeHandle position="top-left" onMouseDown={handleResizeMouseDown("top-left")} />
			<ResizeHandle position="top-right" onMouseDown={handleResizeMouseDown("top-right")} />
			<ResizeHandle position="bottom-left" onMouseDown={handleResizeMouseDown("bottom-left")} />
			<ResizeHandle position="bottom-right" onMouseDown={handleResizeMouseDown("bottom-right")} />
		</div>
	);
}

export const getNodeId = (serviceId: string) => {
	// Generate 6-character alphanumeric ID
	const randomId = Math.random().toString(36).slice(2, 8);
	return `${serviceId || "dndnode"}-${randomId}`;
};

export const getEdgeId = () => {
	// Generate 6-character alphanumeric ID
	const randomId = Math.random().toString(36).slice(2, 8);
	return `edge-${randomId}`;
};

// Node operation handlers factory
export const createNodeHandlers = (
	nodes: Node[],
	setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
	setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void,
	onNodesChange: (changes: NodeChange[]) => void,
	onNodeAdd?: (node: Node) => void,
	getNodeConfiguration?: (nodeId: string) => unknown,
	architectureStore?: ArchitectureStore,
	undoRedoHook?: {
		saveAfterNodeOperation: (
			nodes: Node[],
			edges: Edge[],
			operation: "add" | "delete" | "move" | "resize" | "configure"
		) => void;
		saveAfterEdgeOperation: (
			nodes: Node[],
			edges: Edge[],
			operation: "add" | "delete"
		) => void;
		saveAfterBulkOperation: (
			nodes: Node[],
			edges: Edge[],
			operation: "paste" | "duplicate" | "import" | "bulk"
		) => void;
	}
) => {
	// Debounce timer for parent relationship updates
	let parentUpdateTimeout: NodeJS.Timeout | null = null;

	// Handle node size changes
	const handleNodeSizeChange = (
		nodeId: string,
		width: number,
		height: number,
		x?: number,
		y?: number
	) => {
		setNodes((nodes) =>
			nodes.map((node) =>
				node.id === nodeId
					? {
							...node,
							// Update position if provided (for top/left resizing)
							...(x !== undefined && y !== undefined
								? { position: { x, y } }
								: {}),
							style: {
								...node.style,
								width,
								height,
							},
							// Force re-render by updating a timestamp
							data: {
								...node.data,
								lastResized: Date.now(),
							},
					  }
					: node
			)
		);
	};

	// Enhanced nodes change handler with container logic and edge cleanup
	const handleNodesChange = (changes: NodeChange[]) => {
		// First apply the node changes
		onNodesChange(changes);

		// Check for position changes that indicate a drag end (not during drag)
		const dragEndChanges = changes.filter(
			(change) => change.type === "position" && change.dragging === false
		);

		// Check for nodes being moved (position changes during dragging)
		const dragMoveChanges = changes.filter(
			(change) => change.type === "position" && change.dragging === true
		);

		// Check if any nodes were removed
		const removedNodeIds = changes
			.filter((change) => change.type === "remove")
			.map((change) => change.id);

		if (removedNodeIds.length > 0) {
			// Clear caches when nodes are removed
			clearContainerCaches();

			// Remove edges connected to deleted nodes
			setEdges((eds) =>
				eds.filter(
					(edge) =>
						!removedNodeIds.includes(edge.source) &&
						!removedNodeIds.includes(edge.target)
				)
			);
		}

		// PERFORMANCE: During active dragging, only update z-index for proper layering
		// Skip expensive parent relationship calculations
		if (dragMoveChanges.length > 0) {
			// Clear any pending timeout to avoid conflicts
			if (parentUpdateTimeout) {
				clearTimeout(parentUpdateTimeout);
				parentUpdateTimeout = null;
			}

			// Invalidate cache for moved nodes to ensure fresh calculations on drag end
			dragMoveChanges.forEach((change) => {
				if (change.type === "position") {
					// invalidateNodeCache((change as { id: string }).id); // COMMENTED OUT: Parent-child logic disabled
				}
			});

			// Light update - only z-index for dragging nodes
			setNodes((currentNodes) => {
				return updateNodeParentRelationships(currentNodes);
			});
			return; // Exit early to avoid heavy calculations during drag
		}

		// Only do expensive parent relationship updates when drag ends
		if (dragEndChanges.length > 0) {
			// Clear any existing timeout
			if (parentUpdateTimeout) {
				clearTimeout(parentUpdateTimeout);
			}

			// Get IDs of nodes that changed position
			const changedNodeIds = new Set(
				dragEndChanges
					.filter((change) => change.type === "position")
					.map((change) => (change as { id: string }).id)
			);

			// Reduced debounce for more responsive feel, but still stable
			parentUpdateTimeout = setTimeout(() => {
				setNodes((currentNodes) => {
					// Use batch update for better performance with multiple containers
					if (changedNodeIds.size > 1) {
						const { updatedNodes, nodesWithChangedParents } =
							batchUpdateNodeRelationshipsWithTracking(
								currentNodes,
								changedNodeIds,
								true
							);

						// Trigger auto-configuration for nodes with changed parents
						if (nodesWithChangedParents.size > 0 && architectureStore) {
							setTimeout(() => {
								for (const nodeId of nodesWithChangedParents) {
									const nodeConfig =
										architectureStore.getNodeConfiguration(nodeId);
									const node = updatedNodes.find((n) => n.id === nodeId);
									const resourceType = node?.data?.serviceId as string;
									if (nodeConfig && resourceType) {
										const { updatedConfig } = autoConfigureNode(
											nodeId,
											nodeConfig,
											updatedNodes,
											architectureStore.nodeConfigurations,
											resourceType
										);
										architectureStore.updateNodeConfiguration(
											nodeId,
											updatedConfig
										);
									}
								}
							}, 0);
						}

						return updatedNodes;
					} else {
						// Single node update with drag end flag - FIXED: pass isDragEnd: true
						const { updatedNodes, nodesWithChangedParents } =
							updateNodeParentRelationshipsWithTracking(
								currentNodes,
								false,
								true
							);

						// Trigger auto-configuration for nodes with changed parents
						if (nodesWithChangedParents.size > 0 && architectureStore) {
							setTimeout(() => {
								for (const nodeId of nodesWithChangedParents) {
									const nodeConfig =
										architectureStore.getNodeConfiguration(nodeId);
									const node = updatedNodes.find((n) => n.id === nodeId);
									const resourceType = node?.data?.serviceId as string;
									if (nodeConfig && resourceType) {
										const { updatedConfig } = autoConfigureNode(
											nodeId,
											nodeConfig,
											updatedNodes,
											architectureStore.nodeConfigurations,
											resourceType
										);
										architectureStore.updateNodeConfiguration(
											nodeId,
											updatedConfig
										);
									}
								}
							}, 0);
						}

						return updatedNodes;
					}
				});

				// Save state after node movement
				if (undoRedoHook) {
					setTimeout(() => {
						setNodes((currentNodes) => {
							setEdges((currentEdges) => {
								// Save undo state after both nodes and edges are updated
								setTimeout(() => {
									undoRedoHook.saveAfterNodeOperation(
										currentNodes,
										currentEdges,
										"move"
									);
								}, 0);
								return currentEdges;
							});
							return currentNodes;
						});
					}, 100); // Small delay to ensure state is updated
				}
			}, 1000); // Reduced from 150ms to 100ms for better responsiveness
		}
	};

	// Handle copying selected nodes
	const handleCopyNodes = () => {
		const selectedNodes = nodes.filter((node) => node.selected);

		// Enhance copied nodes with their configurations
		const nodesWithConfigs = selectedNodes.map((node) => {
			const config = getNodeConfiguration?.(node.id);
			return {
				...node,
				data: {
					...node.data,
					configuration: config, // Embed configuration in the node data
				},
			};
		});

		console.log("Copied nodes with configurations:", nodesWithConfigs);
		return nodesWithConfigs;
	};

	// Handle pasting copied nodes
	const handlePasteNodes = (copiedNodes: Node[]) => {
		if (copiedNodes.length === 0) return;

		const newNodes = copiedNodes.map((node) => ({
			...node,
			id: getNodeId(
				typeof node.data?.serviceId === "string"
					? node.data.serviceId
					: "dndnode"
			),
			position: {
				x: node.position.x + 50, // Offset by 50px
				y: node.position.y + 50,
			},
			selected: true, // Select the new nodes
		}));

		setNodes((nds) => [
			...nds.map((n) => ({ ...n, selected: false })),
			...newNodes,
		]);

		// Call onNodeAdd for each new node
		newNodes.forEach((node) => onNodeAdd?.(node));

		// Save state after pasting
		setTimeout(() => {
			if (undoRedoHook) {
				setNodes((currentNodes) => {
					setEdges((currentEdges) => {
						undoRedoHook.saveAfterBulkOperation(
							currentNodes,
							currentEdges,
							"paste"
						);
						return currentEdges;
					});
					return currentNodes;
				});
			}
		}, 0);

		console.log(`Pasted ${newNodes.length} node(s)`);
	};

	// Handle duplicating selected nodes (copy + paste in one action)
	const handleDuplicateNodes = () => {
		const selectedNodes = nodes.filter((node) => node.selected);
		if (selectedNodes.length === 0) return;

		const newNodes = selectedNodes.map((node) => {
			const config = getNodeConfiguration?.(node.id);
			return {
				...node,
				id: getNodeId(
					typeof node.data?.serviceId === "string"
						? node.data.serviceId
						: "dndnode"
				),
				position: {
					x: node.position.x + 50, // Offset by 50px
					y: node.position.y + 50,
				},
				selected: true, // Select the new nodes
				data: {
					...node.data,
					configuration: config, // Embed configuration in the node data
				},
			};
		});

		setNodes((nds) => [
			...nds.map((n) => ({ ...n, selected: false })),
			...newNodes,
		]);

		// Call onNodeAdd for each new node
		newNodes.forEach((node) => onNodeAdd?.(node));

		// Save state after duplicating
		setTimeout(() => {
			if (undoRedoHook) {
				setNodes((currentNodes) => {
					setEdges((currentEdges) => {
						undoRedoHook.saveAfterBulkOperation(
							currentNodes,
							currentEdges,
							"duplicate"
						);
						return currentEdges;
					});
					return currentNodes;
				});
			}
		}, 0);

		console.log(`Duplicated ${newNodes.length} node(s)`);
	};

	// Handle selecting all nodes
	const handleSelectAllNodes = () => {
		setNodes((nds) => nds.map((node) => ({ ...node, selected: true })));
		console.log(`Selected all ${nodes.length} node(s)`);
	};

	// Handle deselecting all nodes
	const handleDeselectAllNodes = () => {
		setNodes((nds) => nds.map((node) => ({ ...node, selected: false })));
		console.log("Deselected all nodes");
	};

	// Handle deleting selected nodes
	const handleDeleteNodes = () => {
		const selectedNodes = nodes.filter((node) => node.selected);
		if (selectedNodes.length === 0) return;

		const selectedNodeIds = selectedNodes.map((node) => node.id);

		// Apply the changes
		setNodes((nds) => nds.filter((node) => !node.selected));
		setEdges((eds) =>
			eds.filter(
				(edge) =>
					!selectedNodeIds.includes(edge.source) &&
					!selectedNodeIds.includes(edge.target)
			)
		);

		// Save state after deletion
		setTimeout(() => {
			if (undoRedoHook) {
				setNodes((currentNodes) => {
					setEdges((currentEdges) => {
						// Save undo state after both nodes and edges are updated
						setTimeout(() => {
							undoRedoHook.saveAfterNodeOperation(
								currentNodes,
								currentEdges,
								"delete"
							);
						}, 0);
						return currentEdges;
					});
					return currentNodes;
				});
			}
		}, 0);

		console.log(`Deleted ${selectedNodes.length} node(s)`);
	};

	// Handle moving selected nodes
	const handleMoveSelectedNodes = (
		direction: "up" | "down" | "left" | "right",
		distance: number
	) => {
		const selectedNodes = nodes.filter((node) => node.selected);
		if (selectedNodes.length === 0) return;

		setNodes((nds) =>
			nds.map((node) => {
				if (!node.selected) return node;

				const newPosition = { ...node.position };
				switch (direction) {
					case "up":
						newPosition.y -= distance;
						break;
					case "down":
						newPosition.y += distance;
						break;
					case "left":
						newPosition.x -= distance;
						break;
					case "right":
						newPosition.x += distance;
						break;
				}
				return { ...node, position: newPosition };
			})
		);
		console.log(
			`Moved ${selectedNodes.length} node(s) ${direction} by ${distance}px`
		);
	};

	return {
		handleNodeSizeChange,
		handleNodesChange,
		handleCopyNodes,
		handlePasteNodes,
		handleDuplicateNodes,
		handleSelectAllNodes,
		handleDeselectAllNodes,
		handleDeleteNodes,
		handleMoveSelectedNodes,
	};
};

// Create node types factory
export const createNodeTypes = (
	handleNodeSizeChange: (nodeId: string, width: number, height: number) => void
) => {
	return {
		awsService: AWSServiceNode,
		awsContainer: (props: NodeProps) => (
			<AWSContainerNode
				id={props.id}
				data={props.data as unknown as AWSContainerNodeData}
				selected={props.selected}
				onNodeSizeChange={handleNodeSizeChange}
			/>
		),
	};
};
