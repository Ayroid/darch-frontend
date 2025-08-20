"use client";

import React from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
	Node,
	Edge,
	Handle,
	Position,
	useStore,
	NodeChange,
	NodeProps,
} from "@xyflow/react";

// Interfaces
export interface AWSServiceNodeData {
	icon: string;
	name: string;
}

export interface AWSContainerNodeData {
	icon: string;
	name: string;
	isContainer: boolean;
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

// Helper function to check if a handle is connected
export const isHandleConnected = (
	nodeId: string,
	handleId: string,
	edges: Edge[]
): boolean => {
	return edges.some(
		(edge) =>
			(edge.source === nodeId && edge.sourceHandle === handleId) ||
			(edge.target === nodeId && edge.targetHandle === handleId)
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
			{/* Handles for connections with explicit positioning */}
			<Handle
				type="target"
				position={Position.Top}
				id="top"
				className={`handle-top ${isTopConnected ? "connected" : ""}`}
				style={handleStyle.top}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right"
				className={`handle-right ${isRightConnected ? "connected" : ""}`}
				style={handleStyle.right}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="bottom"
				className={`handle-bottom ${isBottomConnected ? "connected" : ""}`}
				style={handleStyle.bottom}
			/>
			<Handle
				type="target"
				position={Position.Left}
				id="left"
				className={`handle-left ${isLeftConnected ? "connected" : ""}`}
				style={handleStyle.left}
			/>

			{/* Node content */}
			<div className="flex flex-col items-center justify-center gap-1">
				<Image
					src={icon}
					alt={name}
					width={24}
					height={24}
					className="w-6 h-6"
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
	const { icon, name } = data;
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
		top: { top: -1, left: nodeSize.width / 2},
		right: { top: nodeSize.height / 2, right: -3 },
		bottom: { bottom: -3, left: nodeSize.width / 2 },
		left: { top: nodeSize.height / 2, left: -1 },
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

	return (
		<div
			className="relative"
			style={{
				width: nodeSize.width,
				height: nodeSize.height,
				minWidth: 250,
				minHeight: 200,
			}}
		>
			{/* Handles for connections with dynamic positioning */}
			<Handle
				type="target"
				position={Position.Top}
				id="top"
				className={`handle-top ${isTopConnected ? "connected" : ""}`}
				style={handleStyle.top}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right"
				className={`handle-right ${isRightConnected ? "connected" : ""}`}
				style={handleStyle.right}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="bottom"
				className={`handle-bottom ${isBottomConnected ? "connected" : ""}`}
				style={handleStyle.bottom}
			/>
			<Handle
				type="target"
				position={Position.Left}
				id="left"
				className={`handle-left ${isLeftConnected ? "connected" : ""}`}
				style={handleStyle.left}
			/>

			{/* Container header - icon and name */}
			<div
				className="container-header"
				style={{ position: "absolute", top: 4, left: 4 }}
			>
				<Image
					src={icon}
					alt={name}
					width={20}
					height={20}
					className="w-5 h-5"
				/>
				<span className="text-sm font-semibold">{name}</span>
			</div>

			{/* Corner resize handles */}
			<div
				className="resize-handle bottom-right nodrag"
				style={{
					position: "absolute",
					bottom: -8,
					right: -8,
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
				<ChevronDownIcon
					className="w-4 h-4 text-gray-800"
					style={{ transform: "rotate(315deg)" }}
				/>
			</div>
		</div>
	);
}

// Node ID generator
let nodeId = 0;
export const getId = () => `dndnode_${nodeId++}`;

// Node operation handlers factory
export const createNodeHandlers = (
	nodes: Node[],
	setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
	setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void,
	onNodesChange: (changes: NodeChange[]) => void,
	onNodeAdd?: (node: Node) => void
) => {
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

	// Enhanced nodes change handler to clean up edges when nodes are deleted
	const handleNodesChange = (changes: NodeChange[]) => {
		// First apply the node changes
		onNodesChange(changes);

		// Check if any nodes were removed
		const removedNodeIds = changes
			.filter((change) => change.type === "remove")
			.map((change) => change.id);

		if (removedNodeIds.length > 0) {
			// Remove edges connected to deleted nodes
			setEdges((eds) =>
				eds.filter(
					(edge) =>
						!removedNodeIds.includes(edge.source) &&
						!removedNodeIds.includes(edge.target)
				)
			);
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
			id: getId(),
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
			id: getId(),
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
