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
	EdgeChange,
	MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasShortcuts } from "@/lib/keyboard-shortcuts";
import { useCanvasUndoRedo } from "@/lib/hooks/use-canvas-undo-redo";
import { useArchitectureData } from "@/lib/hooks/use-architecture-data";
import { useArchitectureStore } from "@/lib/stores";
import {
	updateNodeParentRelationships,
	clearContainerCaches,
} from "@/lib/container-logic";
// import UndoRedoControls from "./UndoRedoControls";
import ShortcutsButton from "./ShortcutsButton";
import {
	createNodeHandlers,
	createNodeTypes,
	getNodeId,
	getEdgeId,
} from "./NodeUtils";

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
		border-radius: 4px !important;
	}
	.react-flow__node-awsService:hover {
	  box-shadow: 0 0 0 1px #000000 !important;
	  cursor: pointer !important;
	}
	.react-flow__node-awsService.selected {
		box-shadow: 0 0 0 1px #000000 !important;
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
	onNodeDoubleClick?: (node: Node) => void;
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
	onNodeDoubleClick,
}: ArchitectureCanvasProps) {
	// Double click handler for nodes
	const handleNodeDoubleClick = useCallback(
		(event: React.MouseEvent, node: Node) => {
			if (onNodeDoubleClick) {
				onNodeDoubleClick(node);
			}
		},
		[onNodeDoubleClick]
	);
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChangeDefault] = useEdgesState(initialEdges);
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
	const { getNodeConfiguration, updateNodeConfiguration, nodeConfigurations } =
		useArchitectureStore();

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
	const undoRedoHook = useCanvasUndoRedo();
	const { undo, redo } = undoRedoHook;

	// Custom edge change handler with undo/redo support
	const onEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			// Check if any edges are being deleted
			const deleteChanges = changes.filter(
				(change) => change.type === "remove"
			);

			// Apply the default edge changes
			onEdgesChangeDefault(changes);

			// Save state if edges were deleted
			if (deleteChanges.length > 0) {
				setTimeout(() => {
					setNodes((currentNodes) => {
						setEdges((currentEdges) => {
							// Save undo state after both nodes and edges are updated
							setTimeout(() => {
								undoRedoHook.saveAfterEdgeOperation(
									currentNodes,
									currentEdges,
									"delete"
								);
							}, 0);
							return currentEdges;
						});
						return currentNodes;
					});
				}, 0);
			}
		},
		[onEdgesChangeDefault, setNodes, setEdges, undoRedoHook]
	);

	// Create node handlers
	const nodeHandlers = createNodeHandlers(
		nodes,
		setNodes,
		setEdges,
		onNodesChange,
		onNodeAdd,
		getNodeConfiguration,
		{ getNodeConfiguration, updateNodeConfiguration, nodeConfigurations },
		undoRedoHook
	);

	// Create node types
	const nodeTypes = createNodeTypes(nodeHandlers.handleNodeSizeChange);

	// Save state when significant changes occur (disabled for now since we save at specific moments)
	// React.useEffect(() => {
	// 	// Only save state if there are actual nodes/edges and we're not in a loading state
	// 	if (nodes.length > 0 || edges.length > 0) {
	// 		const timeoutId = undoRedoHook.debouncedSave(nodes, edges, 300);
	// 		// Update architecture data manager
	// 		updateFromReactFlow(nodes, edges);

	// 		return () => clearTimeout(timeoutId);
	// 	}
	// }, [nodes, edges, undoRedoHook, updateFromReactFlow]);

	// Update architecture data manager when nodes/edges change
	React.useEffect(() => {
		updateFromReactFlow(nodes, edges);
	}, [nodes, edges, updateFromReactFlow]);

	// Handle undo
	const handleUndo = useCallback(() => {
		const previousState = undo();
		if (previousState) {
			setNodes(previousState.nodes);
			setEdges(previousState.edges);
			console.log("Undid last action:", previousState.action || "unknown");
		}
	}, [undo, setNodes, setEdges]);

	// Handle redo
	const handleRedo = useCallback(() => {
		const nextState = redo();
		if (nextState) {
			setNodes(nextState.nodes);
			setEdges(nextState.edges);
			console.log("Redid last action:", nextState.action || "unknown");
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

			// Save state after adding edge
			setTimeout(() => {
				setNodes((currentNodes) => {
					setEdges((currentEdges) => {
						// Save undo state after both nodes and edges are updated
						setTimeout(() => {
							undoRedoHook.saveAfterEdgeOperation(
								currentNodes,
								currentEdges,
								"add"
							);
						}, 0);
						return currentEdges;
					});
					return currentNodes;
				});
			}, 0);
		},
		[setEdges, setNodes, addArchConnection, undoRedoHook]
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
					const updatedNodes = updateNodeParentRelationships(nodesWithNew);

					// Find the updated node with correct parent relationships
					const updatedNode =
						updatedNodes.find((node) => node.id === newNode.id) || newNode;

					// Schedule addArchNode to run after the state update with the updated node
					setTimeout(() => {
						addArchNode(updatedNode);
					}, 0);

					return updatedNodes;
				});

				// Don't call addArchNode here - it's called in setTimeout above
				onNodeAdd?.(newNode);

				// Save state after adding node
				setTimeout(() => {
					setNodes((currentNodes) => {
						setEdges((currentEdges) => {
							// Save undo state after both nodes and edges are updated
							setTimeout(() => {
								undoRedoHook.saveAfterNodeOperation(
									currentNodes,
									currentEdges,
									"add"
								);
							}, 0);
							return currentEdges;
						});
						return currentNodes;
					});
				}, 0);
			}
		},
		[
			reactFlowInstance,
			setNodes,
			setEdges,
			addArchNode,
			onNodeAdd,
			undoRedoHook,
		]
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
				{/* <UndoRedoControls
					canUndo={canUndo}
					canRedo={canRedo}
					onUndo={handleUndo}
					onRedo={handleRedo}
				/> */}

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
					onNodeDoubleClick={handleNodeDoubleClick}
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
