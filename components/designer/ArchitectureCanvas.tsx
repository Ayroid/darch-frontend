"use client";

import React, { useCallback, useRef } from "react";
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
import UndoRedoControls from "./UndoRedoControls";
import ShortcutsButton from "./ShortcutsButton";
import {
  createNodeHandlers,
  createNodeTypes,
  getId,
} from "./nodeUtils";

// Custom styles for transparent nodes
const nodeStyles = `
	.react-flow__node-awsService {
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
	}
	.react-flow__node-awsService:hover {
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3) !important;
		border-radius: 4px !important;
	  cursor: pointer !important;
	}
	.react-flow__node-awsService.selected {
		box-shadow: 0 0 0 1px #000000 !important;
		border-radius:  4px !important;
	}
	.react-flow__node-awsContainer {
		background: transparent !important;
		border: 2px solid #8b5cf6 !important;
		border-radius: 8px !important;
		box-shadow: none !important;
		min-width: 250px !important;
		min-height: 200px !important;
	}
	.react-flow__node-awsContainer:hover {
		border-color: #7c3aed !important;
		box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.3) !important;
	  cursor: move !important;
	}
	.react-flow__node-awsContainer.selected {
		border-color: #6d28d9 !important;
		box-shadow: 0 0 0 1px rgba(109, 40, 217, 0.5) !important;
	}
	.react-flow__node-awsContainer .container-header {
		display: flex !important;
		align-items: center !important;
		gap: 8px !important;
		margin-bottom: 12px !important;
		background: transparent !important;
		color: #374151 !important;
		font-weight: 600 !important;
	}
	.react-flow__node-awsContainer .resize-handle {
		position: absolute !important;
		width: 16px !important;
		height: 16px !important;
		opacity: 0 !important;
		z-index: 10 !important;
		transition: opacity 0.2s ease !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
	}
	.react-flow__node-awsContainer:hover .resize-handle {
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
	}
	.react-flow__node-awsService:hover .react-flow__handle,
	.react-flow__node-awsService.selected .react-flow__handle,
	.react-flow__node-awsContainer:hover .react-flow__handle,
	.react-flow__node-awsContainer.selected .react-flow__handle {
		opacity: 1 !important;
	  cursor: pointer !important;
	}
	.react-flow__handle:hover {
		width: 8px !important;
		height: 8px !important;
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
    }, 500); // Debounce state saving

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, saveState]);

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

  const onConnect: OnConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: defaultEdgeOptions.type }, eds)
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const name = event.dataTransfer.getData("application/name");
      const icon = event.dataTransfer.getData("application/icon");
      const isContainer =
        event.dataTransfer.getData("application/isContainer") === "true";

      if (typeof type === "undefined" || !type) {
        return;
      }

      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node = {
          id: getId(),
          type: isContainer ? "awsContainer" : "awsService",
          position,
          data: {
            icon,
            name,
            ...(isContainer && { isContainer: true }),
          },
          ...(isContainer && {
            style: {
              width: 250,
              height: 200,
            },
          }),
        };

        setNodes((nds) => nds.concat(newNode));
        onNodeAdd?.(newNode);
      }
    },
    [reactFlowInstance, setNodes, onNodeAdd]
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
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          deleteKeyCode={["Delete", "Backspace"]}
          fitView
          className="bg-gray-50"
          proOptions={proOptions}
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
