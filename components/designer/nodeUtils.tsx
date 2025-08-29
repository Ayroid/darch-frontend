"use client";

import React from "react";
import Image from "next/image";
import { FiChevronDown } from "react-icons/fi";
import {
	Node,
	Edge,
	Handle,
	Position,
	useStore,
	NodeChange,
	NodeProps,
} from "@xyflow/react";
import { updateNodeParentRelationships, clearContainerCaches, batchUpdateNodeRelationships } from "@/lib/container-logic";

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
	onNodeSizeChange?: (id: string, width: number, height: number) => void;
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
			(edge.source === nodeId && edge.sourceHandle === `${handlePosition}-source`) ||
			// Check for target connections to this position
			(edge.target === nodeId && edge.targetHandle === `${handlePosition}-target`) ||
			// Legacy support for old handle IDs
			(edge.source === nodeId && edge.sourceHandle === handlePosition) ||
			(edge.target === nodeId && edge.targetHandle === handlePosition)
	);
};

// AWS Service Node Component with handles
export function AWSServiceNode({ id, data }: AWSServiceNodeProps) {
	const { icon, name } = data;
	const edges = useStore((state) => state.edges);

	const isTopConnected = isHandleConnected(id, "top", edges);
	const isRightConnected = isHandleConnected(id, "right", edges);
	const isBottomConnected = isHandleConnected(id, "bottom", edges);
	const isLeftConnected = isHandleConnected(id, "left", edges);

	// Fixed square dimensions for service nodes
	const nodeSize = 80;

	// Calculate handle positions for service nodes - positioned exactly on edges
	const handleStyle = {
		top: { top: 0, left: nodeSize / 2 },
		right: { top: nodeSize / 2, right: -6 },
		bottom: { bottom: -6, left: nodeSize / 2 },
		left: { top: nodeSize / 2, left: 0 },
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
			{/* Top Handles - Bidirectional */}
			<Handle
				type="target"
				position={Position.Top}
				id="top-target"
				className={`handle-top ${isTopConnected ? "connected" : ""}`}
				style={{
					...handleStyle.top,
					background: '#555',
					width: '12px',
					height: '12px',
					border: 'none'
				}}
			/>
			<Handle
				type="source"
				position={Position.Top}
				id="top-source"
				className={`handle-top ${isTopConnected ? "connected" : ""}`}
				style={{
					...handleStyle.top,
					background: 'transparent',
					border: '2px solid #555',
					width: '12px',
					height: '12px'
				}}
			/>

			{/* Right Handles - Bidirectional */}
			<Handle
				type="target"
				position={Position.Right}
				id="right-target"
				className={`handle-right ${isRightConnected ? "connected" : ""}`}
				style={{
					...handleStyle.right,
					background: '#555',
					width: '12px',
					height: '12px',
					border: 'none'
				}}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right-source"
				className={`handle-right ${isRightConnected ? "connected" : ""}`}
				style={{
					...handleStyle.right,
					background: 'transparent',
					border: '2px solid #555',
					width: '12px',
					height: '12px'
				}}
			/>

			{/* Bottom Handles - Bidirectional */}
			<Handle
				type="target"
				position={Position.Bottom}
				id="bottom-target"
				className={`handle-bottom ${isBottomConnected ? "connected" : ""}`}
				style={{
					...handleStyle.bottom,
					background: '#555',
					width: '12px',
					height: '12px',
					border: 'none'
				}}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="bottom-source"
				className={`handle-bottom ${isBottomConnected ? "connected" : ""}`}
				style={{
					...handleStyle.bottom,
					background: 'transparent',
					border: '2px solid #555',
					width: '12px',
					height: '12px'
				}}
			/>

			{/* Left Handles - Bidirectional */}
			<Handle
				type="target"
				position={Position.Left}
				id="left-target"
				className={`handle-left ${isLeftConnected ? "connected" : ""}`}
				style={{
					...handleStyle.left,
					background: '#555',
					width: '12px',
					height: '12px',
					border: 'none'
				}}
			/>
			<Handle
				type="source"
				position={Position.Left}
				id="left-source"
				className={`handle-left ${isLeftConnected ? "connected" : ""}`}
				style={{
					...handleStyle.left,
					background: 'transparent',
					border: '2px solid #555',
					width: '12px',
					height: '12px'
				}}
			/>

			{/* Node content */}
			<div className="flex flex-col items-center justify-center gap-1">
				<Image
					src={icon}
					alt={name}
					width={32}
					height={32}
					className="w-8 h-8"
				/>
				<span className="text-xs text-center font-medium text-gray-700 max-w-[60px] leading-tight">
					{name}
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

	const isTopConnected = isHandleConnected(id, "top", edges);
	const isRightConnected = isHandleConnected(id, "right", edges);
	const isBottomConnected = isHandleConnected(id, "bottom", edges);
	const isLeftConnected = isHandleConnected(id, "left", edges);

	// Calculate handle positions based on current node size
	const handleStyle = {
		top: { top: 0, left: nodeSize.width / 2 },
		right: { top: nodeSize.height / 2, right: -7 },
		bottom: { bottom: -7, left: nodeSize.width / 2 },
		left: { top: nodeSize.height / 2, left: 0 },
	};

	// Helper function to handle resize mouse down for corner handles
	function handleResizeMouseDown(
		e: React.MouseEvent,
		corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
	) {
		e.preventDefault();
		e.stopPropagation();

		const startX = e.clientX;
		const startY = e.clientY;
		const startWidth = nodeSize.width;
		const startHeight = nodeSize.height;

		const handleMouseMove = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			let newWidth = startWidth;
			let newHeight = startHeight;

			switch (corner) {
				case "top-left":
					newWidth = Math.max(250, startWidth - (e.clientX - startX));
					newHeight = Math.max(200, startHeight - (e.clientY - startY));
					break;
				case "top-right":
					newWidth = Math.max(250, startWidth + (e.clientX - startX));
					newHeight = Math.max(200, startHeight - (e.clientY - startY));
					break;
				case "bottom-left":
					newWidth = Math.max(250, startWidth - (e.clientX - startX));
					newHeight = Math.max(200, startHeight + (e.clientY - startY));
					break;
				case "bottom-right":
					newWidth = Math.max(250, startWidth + (e.clientX - startX));
					newHeight = Math.max(200, startHeight + (e.clientY - startY));
					break;
			}

			onNodeSizeChange?.(id, newWidth, newHeight);
		};

		const handleMouseUp = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	}

	// Get service-specific border color
	const getBorderColor = (serviceId?: string) => {
		switch (serviceId) {
			case "aws-vpc":
				return "#8C4FFF"; // Purple (from VPC icon)
			case "aws-private-subnet":
				return "#00A4A6"; // Teal/Cyan (from Private subnet icon)
			case "aws-public-subnet":
				return "#7AA116"; // Green (from Public subnet icon)
			case "aws-auto-scaling":
				return "#ED7100"; // Orange (from Auto Scaling icon)
			case "aws-region":
				return "#000000"; // Teal (from Region icon)
			case "aws-availability-zone":
				return "#00A4A6"; // Teal (same as region for consistency)
			case "aws-account":
				return "#E7157B"; // Magenta/Pink (from AWS Account icon)
			case "aws-corporate-datacenter":
				return "#666666"; // Gray for data center
			case "aws-local-zone":
				return "#4A90E2"; // Blue for local zones
			case "aws-edge-location":
				return "#FF9500"; // Orange for edge locations
			default:
				return "#8C4FFF"; // Default purple (VPC color)
		}
	};

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
				border: `1px ${serviceId === "aws-region" ? "dashed" : "solid"} ${borderColor}`,
				background: serviceId === "aws-region" ? "transparent" : `${borderColor}0D`, // 1A = 10% alpha in hex
			}}
		>
			{/* Top Handles - Bidirectional */}
			<Handle
				type="target"
				position={Position.Top}
				id="top-target"
				className={`handle-top ${isTopConnected ? "connected" : ""}`}
				style={{
					...handleStyle.top,
					background: '#555',
					width: '12px',
					height: '12px',
					border: 'none'
				}}
			/>
			<Handle
				type="source"
				position={Position.Top}
				id="top-source"
				className={`handle-top ${isTopConnected ? "connected" : ""}`}
				style={{
					...handleStyle.top,
					background: 'transparent',
					border: '2px solid #555',
					width: '12px',
					height: '12px'
				}}
			/>

			{/* Right Handles - Bidirectional */}
			<Handle
				type="target"
				position={Position.Right}
				id="right-target"
				className={`handle-right ${isRightConnected ? "connected" : ""}`}
				style={{
					...handleStyle.right,
					background: '#555',
					width: '12px',
					height: '12px',
					border: 'none'
				}}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right-source"
				className={`handle-right ${isRightConnected ? "connected" : ""}`}
				style={{
					...handleStyle.right,
					background: 'transparent',
					border: '2px solid #555',
					width: '12px',
					height: '12px'
				}}
			/>

			{/* Bottom Handles - Bidirectional */}
			<Handle
				type="target"
				position={Position.Bottom}
				id="bottom-target"
				className={`handle-bottom ${isBottomConnected ? "connected" : ""}`}
				style={{
					...handleStyle.bottom,
					background: '#555',
					width: '12px',
					height: '12px',
					border: 'none'
				}}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="bottom-source"
				className={`handle-bottom ${isBottomConnected ? "connected" : ""}`}
				style={{
					...handleStyle.bottom,
					background: 'transparent',
					border: '2px solid #555',
					width: '12px',
					height: '12px'
				}}
			/>

			{/* Left Handles - Bidirectional */}
			<Handle
				type="target"
				position={Position.Left}
				id="left-target"
				className={`handle-left ${isLeftConnected ? "connected" : ""}`}
				style={{
					...handleStyle.left,
					background: '#555',
					width: '12px',
					height: '12px',
					border: 'none'
				}}
			/>
			<Handle
				type="source"
				position={Position.Left}
				id="left-source"
				className={`handle-left ${isLeftConnected ? "connected" : ""}`}
				style={{
					...handleStyle.left,
					background: 'transparent',
					border: '2px solid #555',
					width: '12px',
					height: '12px'
				}}
			/>

			{/* Container header - icon and name */}
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

			{/* Corner resize handles */}
			<div
				className="resize-handle bottom-right nodrag"
				style={{
					position: "absolute",
					bottom: -16,
					right: -16,
					width: 16,
					height: 16,
					cursor: "se-resize",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					opacity: 0,
					transition: "opacity 0.2s ease",
					zIndex: 10,
				}}
				onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")}
			>
				<FiChevronDown
					className="w-4 h-4 text-gray-800"
					style={{ transform: "rotate(315deg)" }}
				/>
			</div>
		</div>
	);
}

export const getNodeId = (serviceId: string) => {
	const now = new Date();
	const timestamp = now.getTime();
	const ms = now.getMilliseconds();
	return `${serviceId || "dndnode"}-${timestamp}${ms}`;
};

export const getEdgeId = () => {
	const now = new Date();
	const timestamp = now.getTime();
	const ms = now.getMilliseconds();
	return `edge-${timestamp}${ms}`;
};

// Node operation handlers factory
export const createNodeHandlers = (
	nodes: Node[],
	setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
	setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void,
	onNodesChange: (changes: NodeChange[]) => void,
	onNodeAdd?: (node: Node) => void
) => {
	// Debounce timer for parent relationship updates
	let parentUpdateTimeout: NodeJS.Timeout | null = null;

	// Handle node size changes
	const handleNodeSizeChange = (
		nodeId: string,
		width: number,
		height: number
	) => {
		setNodes((nodes) =>
			nodes.map((node) =>
				node.id === nodeId
					? {
							...node,
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
		const dragEndChanges = changes.filter(change =>
			change.type === 'position' &&
			change.dragging === false
		);

		// Check for nodes being moved (position changes during dragging)
		const dragMoveChanges = changes.filter(change =>
			change.type === 'position' &&
			change.dragging === true
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
			dragMoveChanges.forEach(change => {
				if (change.type === 'position') {
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
					.filter(change => change.type === 'position')
					.map(change => (change as { id: string }).id)
			);

			// Reduced debounce for more responsive feel, but still stable
			parentUpdateTimeout = setTimeout(() => {
				setNodes((currentNodes) => {
					// Use batch update for better performance with multiple containers
					if (changedNodeIds.size > 1) {
						return batchUpdateNodeRelationships(currentNodes);
					} else {
						// Single node update with drag end flag
						return updateNodeParentRelationships(currentNodes);
					}
				});
			}, 1000); // Reduced from 150ms to 100ms for better responsiveness
		}
	};

	// Handle copying selected nodes
	const handleCopyNodes = () => {
		const selectedNodes = nodes.filter((node) => node.selected);
		return selectedNodes;
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

		console.log(`Pasted ${newNodes.length} node(s)`);
	};

	// Handle duplicating selected nodes (copy + paste in one action)
	const handleDuplicateNodes = () => {
		const selectedNodes = nodes.filter((node) => node.selected);
		if (selectedNodes.length === 0) return;

		const newNodes = selectedNodes.map((node) => ({
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
		setNodes((nds) => nds.filter((node) => !node.selected));
		setEdges((eds) =>
			eds.filter(
				(edge) =>
					!selectedNodeIds.includes(edge.source) &&
					!selectedNodeIds.includes(edge.target)
			)
		);
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
