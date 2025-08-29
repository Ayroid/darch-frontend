"use client";

import React, { useCallback, useRef, useEffect } from "react";
import {
	ReactFlow,
	Node,
	Edge,
	addEdge,
	Background,
	Controls,
	useNodesState,
	useEdgesState,
	OnConnect,
	Connection,
	ReactFlowInstance,
	MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasShortcuts, useUndoRedo } from "@/lib/keyboard-shortcuts";
import { useArchitectureData } from "@/hooks/use-architecture-data";
import { updateNodeParentRelationships, clearContainerCaches } from "@/lib/container-logic";
import UndoRedoControls from "./UndoRedoControls";
import ShortcutsButton from "./ShortcutsButton";
import {
	createNodeHandlers,
	createNodeTypes,
	getNodeId,
	getEdgeId,
} from "./nodeUtils";

// Custom styles for transparent nodes
const nodeStyles = `
	.react-flow__node {
		cursor: pointer !important;
	}
	.react-flow__node-awsService {
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
		min-width: 60px !important;
		min-height: 60px !important;
		z-index: 1000 !important;
		pointer-events: all !important;
	}
	.react-flow__node-awsService:hover {
	  	box-shadow: 0 0 0 1px #302f2fff !important;
	  cursor: pointer !important;
	}
	.react-flow__node-awsService.selected {
		box-shadow: 0 0 0 1px #302f2fff !important;
	}
	.react-flow__node-awsContainer {
		background: transparent !important;
		border-radius: 0px !important;
		box-shadow: none !important;
		min-width: 250px !important;
		min-height: 200px !important;
		z-index: 1 !important;
		pointer-events: all !important;
	}
	.react-flow__node-awsContainer:hover {
	  cursor: move !important;
		box-shadow: 0 0 0 1px #6E6E6E !important;
	}
	.react-flow__node-awsContainer .container-header {
		display: flex !important;
		align-items: center !important;
		gap: 8px !important;
		margin-bottom: 12px !important;
		background: transparent !important;
		color: #374151 !important;
		font-weight: 600 !important;
		z-index: 50 !important;
		pointer-events: all !important;
	}
	.react-flow__node-awsContainer .resize-handle {
		position: absolute !important;
		opacity: 0 !important;
		transition: opacity 0.2s ease !important;
		z-index: 51 !important;
		pointer-events: all !important;
		cursor: resize !important;
	}
	.react-flow__node-awsContainer:hover .resize-handle,
	.react-flow__node-awsContainer.selected .resize-handle {
		opacity: 1 !important;
	}
	.react-flow__handle {
		width: 6px !important;
		height: 6px !important;
		background: #ffffff !important;
		border: 1px solid #000000 !important;
		opacity: 0 !important;
		position: absolute !important;
		transition: opacity 0.2s ease, transform 0.2s ease !important;
		transform: translate(-50%, -50%) !important;
		z-index: 200 !important;
	}
	.react-flow__node:hover .react-flow__handle,
	.react-flow__node.selected .react-flow__handle {
		opacity: 1 !important;
	  cursor: pointer !important;
	}
	.react-flow__node-awsContainer:hover .react-flow__handle,
	.react-flow__node-awsContainer.selected .react-flow__handle {
		opacity: 1 !important;
	  cursor: pointer !important;
	}
	.react-flow__handle:hover {
		width: 6px !important;
		height: 6px !important;
		transition: all 0.2s ease !important;
	}
	.react-flow__handle.connected {
		opacity: 1 !important;
		background: #000000 !important;
	}
`;
interface ArchitectureCanvasProps {
	onNodeAdd?: (node: Node) => void;
	onShowHelp?: () => void;
	onNodeSelect?: (node: Node | null) => void;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Use ReactFlow's prebuilt step edge type
const defaultEdgeOptions = {
	type: "smoothstep",
	markerStart: {
		type: MarkerType.Arrow,
	},
};

export default function ArchitectureCanvas({
	onNodeAdd,
	onShowHelp,
	onNodeSelect,
}: ArchitectureCanvasProps) {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [reactFlowInstance, setReactFlowInstance] =
		React.useState<ReactFlowInstance | null>(null);
	const [copiedNodes, setCopiedNodes] = React.useState<Node[]>([]);

	// Architecture data management
	const {
		currentData,
		updateFromReactFlow,
		addNode: addArchNode,
		addConnection: addArchConnection,
		convertToReactFlow,
	} = useArchitectureData();

	// Load initial data from architecture manager (only on first load)
	useEffect(() => {
		if (currentData && nodes.length === 0 && edges.length === 0) {
			const { nodes: archNodes, edges: archEdges } = convertToReactFlow();
			if (archNodes.length > 0 || archEdges.length > 0) {
				setNodes(archNodes);
				setEdges(archEdges);
			}
		}
	}, [currentData, convertToReactFlow, setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

	// Undo/Redo functionality
	const { saveState, undo, redo, canUndo, canRedo } = useUndoRedo();

	// Create node handlers
	const nodeHandlers = createNodeHandlers(
		nodes,
		setNodes,
		setEdges,
		onNodesChange,
		onNodeAdd
	);

	// Create node types
	const nodeTypes = createNodeTypes(nodeHandlers.handleNodeSizeChange);

	// Save state whenever nodes or edges change
	React.useEffect(() => {
		const timeoutId = setTimeout(() => {
			saveState(nodes, edges);
			// Update architecture data manager
			updateFromReactFlow(nodes, edges);
		}, 500); // Debounce state saving

		return () => clearTimeout(timeoutId);
	}, [nodes, edges, saveState, updateFromReactFlow]);

	// Handle undo
	const handleUndo = useCallback(() => {
		const previousState = undo();
		if (previousState) {
			setNodes(previousState.nodes);
			setEdges(previousState.edges);
			console.log("Undid last action");
		}
	}, [undo, setNodes, setEdges]);

	// Handle redo
	const handleRedo = useCallback(() => {
		const nextState = redo();
		if (nextState) {
			setNodes(nextState.nodes);
			setEdges(nextState.edges);
			console.log("Redid last action");
		}
	}, [redo, setNodes, setEdges]);

	// Use the canvas shortcuts hook
	useCanvasShortcuts({
		onCopyNodes: () => setCopiedNodes(nodeHandlers.handleCopyNodes()),
		onPasteNodes: () => nodeHandlers.handlePasteNodes(copiedNodes),
		onDuplicateNodes: nodeHandlers.handleDuplicateNodes,
		onSelectAllNodes: nodeHandlers.handleSelectAllNodes,
		onDeselectAllNodes: nodeHandlers.handleDeselectAllNodes,
		onDeleteNodes: nodeHandlers.handleDeleteNodes,
		onMoveSelectedNodes: nodeHandlers.handleMoveSelectedNodes,
		onUndo: handleUndo,
		onRedo: handleRedo,
		reactFlowInstance,
	});

	// Handle custom wheel behavior
	const onWheel = useCallback(
		(event: React.WheelEvent) => {
			if (!reactFlowInstance) return;

			// If Ctrl key is pressed, handle zoom
			if (event.ctrlKey || event.metaKey) {
				event.preventDefault();
				const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
				reactFlowInstance.zoomTo(reactFlowInstance.getZoom() * zoomFactor);
			}
			// Otherwise, let default pan behavior handle it (since panOnScroll=true)
		},
		[reactFlowInstance]
	);

	const onConnect: OnConnect = useCallback(
		(params: Connection) => {
			const newEdge: Edge = {
				...params,
				type: defaultEdgeOptions.type,
				id: getEdgeId(),
				source: params.source!,
				target: params.target!,
			};
			setEdges((eds) => addEdge(newEdge, eds));
			// Add to architecture data
			addArchConnection(newEdge);
		},
		[setEdges, addArchConnection]
	);

	const onDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault();

			const serviceId = event.dataTransfer.getData("application/reactflow");
			const name = event.dataTransfer.getData("application/name");
			const icon = event.dataTransfer.getData("application/icon");
			const isContainer =
				event.dataTransfer.getData("application/isContainer") === "true";

			if (typeof serviceId === "undefined" || !serviceId) {
				return;
			}

			if (reactFlowInstance) {
				const position = reactFlowInstance.screenToFlowPosition({
					x: event.clientX,
					y: event.clientY,
				});

				const newNode: Node = {
					id: getNodeId(serviceId),
					type: isContainer ? "awsContainer" : "awsService",
					position,
					data: {
						icon,
						name,
						serviceId, // Add service ID for styling
						...(isContainer && { isContainer: true }),
					},
					...(isContainer && {
						style: {
							width: 250,
							height: 200,
						},
					}),
				};

				// Add the new node and then update all parent relationships
				setNodes((nds) => {
					const nodesWithNew = nds.concat(newNode);
					// Clear caches when adding new nodes
					clearContainerCaches();
					return updateNodeParentRelationships(nodesWithNew, true, false);
				});

				// Add to architecture data
				addArchNode(newNode);
				onNodeAdd?.(newNode);
			}
		},
		[reactFlowInstance, setNodes, addArchNode, onNodeAdd]
	);

	const proOptions = { hideAttribution: true };

	// Handle selection changes
	const onSelectionChange = useCallback(
		({ nodes: selectedNodes }: { nodes: Node[] }) => {
			const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null;
			onNodeSelect?.(selectedNode);
		},
		[onNodeSelect]
	);

	return (
		<>
			<style dangerouslySetInnerHTML={{ __html: nodeStyles }} />
			<div className="w-full h-full relative z-10" ref={reactFlowWrapper}>
				{/* Undo/Redo Controls */}
				<UndoRedoControls
					canUndo={canUndo}
					canRedo={canRedo}
					onUndo={handleUndo}
					onRedo={handleRedo}
				/>

				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={nodeHandlers.handleNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onInit={setReactFlowInstance}
					onDrop={onDrop}
					onDragOver={onDragOver}
					onSelectionChange={onSelectionChange}
					onWheel={onWheel}
					nodeTypes={nodeTypes}
					defaultEdgeOptions={defaultEdgeOptions}
					deleteKeyCode={["Delete", "Backspace"]}
					fitView
					className="bg-gray-50"
					proOptions={proOptions}
					panOnScroll={true}
					zoomOnScroll={false}
				>
					<Controls />
					<Background gap={12} size={1} />
				</ReactFlow>

				{/* Shortcuts Button */}
				{onShowHelp && <ShortcutsButton onClick={onShowHelp} />}
			</div>
		</>
	);
}
