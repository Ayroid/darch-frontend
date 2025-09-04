# Canvas System

This document covers the canvas system built on ReactFlow, including node management, edge connections, and interactive drawing capabilities.

## Overview

The canvas system is the heart of the Darch application, providing an interactive drawing surface for creating cloud architecture diagrams. Built on ReactFlow, it handles node placement, connections, zoom/pan, and user interactions.

**Main Component**: `components/designer/ArchitectureCanvas.tsx`
**Canvas Library**: ReactFlow (@xyflow/react)

## Component Structure

### Main Canvas Component

```typescript
export default function ArchitectureCanvas({
  onNodeAdd,
  onShowHelp,
  onNodeSelect,
  onNodeDoubleClick,
}: ArchitectureCanvasProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: nodeStyles }} />
      <div className="w-full h-full relative z-10" ref={reactFlowWrapper}>
        <UndoRedoControls {...undoRedoProps} />
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
        <ShortcutsButton onClick={onShowHelp} />
      </div>
    </>
  );
}
```

## Node System

### Node Types

The canvas supports two primary node types:

#### 1. AWS Service Nodes
**Component**: `AWSServiceNode` in `nodeUtils.tsx`
**Type**: `awsService`

```typescript
export function AWSServiceNode({ id, data }: AWSServiceNodeProps) {
  const isTopConnected = isHandleConnected(id, "top", edges);
  const isRightConnected = isHandleConnected(id, "right", edges);
  const isBottomConnected = isHandleConnected(id, "bottom", edges);
  const isLeftConnected = isHandleConnected(id, "left", edges);

  return (
    <div className="relative flex flex-col items-center justify-center gap-1">
      {/* Service Icon */}
      <div className="relative w-8 h-8">
        <Image
          src={data.icon}
          alt={data.name}
          fill
          className="object-contain"
          sizes="32px"
        />
      </div>

      {/* Service Name */}
      <span className="text-xs font-medium text-gray-700 text-center">
        {data.name}
      </span>

      {/* Connection Handles - Bidirectional */}
      {/* Top, Right, Bottom, Left handles with both source and target */}
    </div>
  );
}
```

**Features**:
- Fixed size (80x80px)
- Service icon and name display
- 4 bidirectional connection handles
- Visual feedback for connected state

#### 2. AWS Container Nodes
**Component**: `AWSContainerNode` in `nodeUtils.tsx`
**Type**: `awsContainer`

```typescript
export function AWSContainerNode({
  id,
  data,
  onNodeSizeChange,
}: AWSContainerNodeProps) {
  return (
    <div className="container-wrapper" style={{ width, height }}>
      {/* Container Header */}
      <div className="container-header">
        <Image src={data.icon} alt={data.name} width={24} height={24} />
        <span className="font-semibold text-gray-800">{data.name}</span>
      </div>

      {/* Container Content Area */}
      <div className="container-content">
        {/* Child nodes rendered here by ReactFlow */}
      </div>

      {/* Resize Handles */}
      <div className="resize-handle bottom-right" />

      {/* Connection Handles */}
      {/* Top, Right, Bottom, Left handles */}
    </div>
  );
}
```

**Features**:
- Resizable containers (min: 250x200px)
- Container header with icon and name
- Child node containment
- 4 bidirectional connection handles
- Visual resize handles

### Node Creation and Management

#### Creating Node Types
```typescript
const createNodeTypes = (onNodeSizeChange: NodeSizeChangeHandler) => ({
  awsService: (props: NodeProps) => (
    <AWSServiceNode {...props} />
  ),
  awsContainer: (props: NodeProps) => (
    <AWSContainerNode {...props} onNodeSizeChange={onNodeSizeChange} />
  ),
});
```

#### Node Handlers
**File**: `nodeUtils.tsx` - `createNodeHandlers` function

```typescript
export const createNodeHandlers = (
  nodes: Node[],
  setNodes: Dispatch<SetStateAction<Node[]>>,
  setEdges: Dispatch<SetStateAction<Edge[]>>,
  onNodesChange: OnNodesChange,
  onNodeAdd?: (node: Node) => void,
  getNodeConfiguration?: (nodeId: string) => AWSResourceConfiguration | null
) => {
  // Handle node changes (position, selection, etc.)
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    onNodesChange?.(changes);
  }, [setNodes, onNodesChange]);

  // Handle node size changes for containers
  const handleNodeSizeChange = useCallback((nodeId: string, newSize: { width: number; height: number }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, style: { ...node.style, ...newSize } }
          : node
      )
    );
  }, [setNodes]);

  // Copy selected nodes
  const handleCopyNodes = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    return selectedNodes.map((node) => ({
      ...node,
      id: getNodeId(node.data?.serviceId || 'unknown'),
      position: { x: node.position.x + 20, y: node.position.y + 20 },
      selected: false,
    }));
  }, [nodes]);

  // Paste nodes
  const handlePasteNodes = useCallback((copiedNodes: Node[]) => {
    if (copiedNodes.length === 0) return;

    setNodes((nds) => [...nds, ...copiedNodes]);
    copiedNodes.forEach((node) => {
      onNodeAdd?.(node);
    });
  }, [setNodes, onNodeAdd]);

  // Delete selected nodes
  const handleDeleteNodes = useCallback(() => {
    const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);

    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) =>
      !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
    ));
  }, [nodes, setNodes, setEdges]);

  // Additional handlers: duplicate, select all, deselect all, move nodes...
};
```

## Drag and Drop System

### Drop Handler
```typescript
const onDrop = useCallback(
  (event: React.DragEvent) => {
    event.preventDefault();

    const serviceId = event.dataTransfer.getData("application/reactflow");
    const name = event.dataTransfer.getData("application/name");
    const icon = event.dataTransfer.getData("application/icon");
    const isContainer = event.dataTransfer.getData("application/isContainer") === "true";

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
          serviceId,
          ...(isContainer && { isContainer: true }),
        },
        ...(isContainer && {
          style: { width: 250, height: 200 },
        }),
      };

      // Add node and update parent relationships
      setNodes((nds) => {
        const nodesWithNew = nds.concat(newNode);
        clearContainerCaches();
        return updateNodeParentRelationships(nodesWithNew);
      });

      addArchNode(newNode);
      onNodeAdd?.(newNode);
    }
  },
  [reactFlowInstance, setNodes, addArchNode, onNodeAdd]
);
```

### Drag Over Handler
```typescript
const onDragOver = useCallback((event: React.DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}, []);
```

## Container Movement System

### Complete Movement Freedom (Enhanced)

The canvas system now provides **complete freedom of movement** for all nodes, removing previous container boundary restrictions:

**Key Features:**
- **No Boundary Constraints**: Nodes can be moved anywhere on the canvas without getting stuck inside containers
- **Smart Container Assignment**: Uses 75% overlap threshold for intelligent container relationships
- **Easy Breakout**: Nodes can easily break free from containers when moved outside the overlap threshold
- **Real-time Updates**: Parent relationships update intelligently during and after dragging
- **Performance Optimized**: Light calculations during dragging, full updates on drag end

### Container Assignment Logic

```typescript
// Revolutionary change: Removed ReactFlow extent constraints completely
// BEFORE: extent: "parent" - nodes were trapped inside containers
// AFTER: No extent property - complete movement freedom

// Smart overlap-based containment (replaces boundary restrictions)
export function isRectangleWellContained(
  inner: NodeBounds,
  outer: NodeBounds,
  overlapThreshold: number = 0.75
): boolean {
  const overlapArea = calculateOverlap(inner, outer);
  const innerArea = inner.width * inner.height;
  return overlapArea / innerArea >= overlapThreshold;
}

// Enhanced parent update logic with breakout capability
function shouldUpdateParent(
  node: Node,
  potentialParent: Node,
  allNodes: Node[],
  isDragEnd: boolean = false
): boolean {
  // During dragging: allow easy breakout with lower threshold
  if (!isDragEnd && node.parentId === potentialParent.id) {
    return isRectangleWellContained(nodeBounds, parentBounds, 0.6);
  }

  // For new assignment: require substantial overlap
  return isRectangleWellContained(nodeBounds, parentBounds, 0.75);
}
```

**Revolutionary Improvements Made:**
1. **Removed ReactFlow Extent Constraints**: The `extent: "parent"` property that trapped nodes inside containers has been completely removed
2. **Enhanced Overlap Threshold**: Changed from strict boundary containment to 75% overlap requirement for assignment
3. **Breakout Capability**: Lower threshold (60%) during dragging allows easy escape from containers
4. **Smart Assignment**: Container relationships only form with intentional, substantial overlap
5. **Performance Optimized**: Heavy calculations only run on drag end, light updates during dragging

### Movement Behavior

**During Active Dragging:**
- Nodes move completely freely without any boundary restrictions
- Light parent relationship updates for visual feedback only
- Real-time z-index adjustments for proper layering
- No heavy computations that could affect dragging performance

**On Drag End:**
- Final parent relationship determination using 75% overlap threshold
- Auto-configuration updates for nodes with changed parents
- Cached calculations for performance optimization
- Debounced processing (1000ms) for multiple rapid movements

**Smart Container Interaction:**
- Nodes only become children when **75% or more** overlaps with container
- Easy breakout when dragged below **60%** overlap during movement
- Visual feedback through positioning and hierarchy indication
- Respect for AWS service hierarchy rules in parent-child relationships

## Connection System

### Edge Configuration
```typescript
const defaultEdgeOptions = {
  type: "smoothstep",
  markerStart: {
    type: MarkerType.Arrow,
  },
};
```

### Connection Handler
```typescript
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
    addArchConnection(newEdge);
  },
  [setEdges, addArchConnection]
);
```

### Handle Configuration
Each node has 4 bidirectional handles:

```typescript
// Top Handles - Bidirectional
<Handle
  type="target"
  position={Position.Top}
  id="top-target"
  className={`handle-top ${isTopConnected ? "connected" : ""}`}
  style={{
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
    background: 'transparent',
    border: '2px solid #555',
    width: '12px',
    height: '12px'
  }}
/>
```

## Interaction Systems

### Zoom and Pan

#### Custom Wheel Handler
```typescript
const onWheel = useCallback(
  (event: React.WheelEvent) => {
    if (!reactFlowInstance) return;

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      reactFlowInstance.zoomTo(reactFlowInstance.getZoom() * zoomFactor);
    }
    // Otherwise, default pan behavior handles scrolling
  },
  [reactFlowInstance]
);
```

#### ReactFlow Configuration
```typescript
<ReactFlow
  panOnScroll={true}        // Enable pan with mouse scroll
  zoomOnScroll={false}      // Disable zoom on scroll (custom wheel handler)
  fitView                   // Auto-fit view on initialization
  deleteKeyCode={["Delete", "Backspace"]}  // Delete keys
/>
```

### Selection System

#### Selection Change Handler
```typescript
const onSelectionChange = useCallback(
  ({ nodes: selectedNodes }: { nodes: Node[] }) => {
    const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null;
    onNodeSelect?.(selectedNode);
  },
  [onNodeSelect]
);
```

#### Double-Click Handler
```typescript
const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
  if (onNodeDoubleClick) {
    onNodeDoubleClick(node);
  }
}, [onNodeDoubleClick]);
```

## Undo/Redo System

### Undo/Redo Hook
```typescript
const { saveState, undo, redo, canUndo, canRedo } = useUndoRedo();
```

### State Saving
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    saveState(nodes, edges);
    updateFromReactFlow(nodes, edges);
  }, 500); // Debounce state saving

  return () => clearTimeout(timeoutId);
}, [nodes, edges, saveState, updateFromReactFlow]);
```

### Undo/Redo Handlers
```typescript
const handleUndo = useCallback(() => {
  const previousState = undo();
  if (previousState) {
    setNodes(previousState.nodes);
    setEdges(previousState.edges);
    console.log("Undid last action");
  }
}, [undo, setNodes, setEdges]);

const handleRedo = useCallback(() => {
  const nextState = redo();
  if (nextState) {
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    console.log("Redid last action");
  }
}, [redo, setNodes, setEdges]);
```

### Undo/Redo Controls
```typescript
<UndoRedoControls
  canUndo={canUndo}
  canRedo={canRedo}
  onUndo={handleUndo}
  onRedo={handleRedo}
/>
```

## Keyboard Shortcuts Integration

### Canvas Shortcuts
```typescript
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
```

### Available Shortcuts
- `Ctrl/Cmd + C`: Copy selected nodes
- `Ctrl/Cmd + V`: Paste copied nodes
- `Ctrl/Cmd + D`: Duplicate selected nodes
- `Ctrl/Cmd + A`: Select all nodes
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Delete/Backspace`: Delete selected nodes
- `Escape`: Deselect all nodes
- `Arrow Keys`: Move selected nodes
- `Ctrl/Cmd + 0`: Fit view
- `Ctrl/Cmd + =/-`: Zoom in/out

## Styling System

### Node Styles
**Custom CSS**: Injected via `dangerouslySetInnerHTML`

```css
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

.react-flow__node-awsContainer {
  background: transparent !important;
  border-radius: 0px !important;
  box-shadow: none !important;
  min-width: 250px !important;
  min-height: 200px !important;
  z-index: 1 !important;
  pointer-events: all !important;
}
```

### Handle Styles
```css
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
```

## Container System Integration

### Parent-Child Relationships
```typescript
// Update parent relationships when nodes are added or moved
setNodes((nds) => {
  const nodesWithNew = nds.concat(newNode);
  clearContainerCaches();
  return updateNodeParentRelationships(nodesWithNew);
});
```

### Container Logic
**File**: `lib/container-logic.ts`

Handles automatic parent-child relationship detection based on node positions and container boundaries.

## Data Integration

### Architecture Data Sync
```typescript
const {
  currentData,
  updateFromReactFlow,
  addNode: addArchNode,
  addConnection: addArchConnection,
  convertToReactFlow,
} = useArchitectureData();
```

### Initial Data Loading
```typescript
useEffect(() => {
  if (currentData && nodes.length === 0 && edges.length === 0) {
    const { nodes: archNodes, edges: archEdges } = convertToReactFlow();
    if (archNodes.length > 0 || archEdges.length > 0) {
      setNodes(archNodes);
      setEdges(archEdges);
    }
  }
}, [currentData, convertToReactFlow, setNodes, setEdges]);
```

## Performance Optimizations

### 1. Callback Memoization
All event handlers use `useCallback` to prevent unnecessary re-renders.

### 2. Debounced State Saving
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    saveState(nodes, edges);
    updateFromReactFlow(nodes, edges);
  }, 500); // 500ms debounce

  return () => clearTimeout(timeoutId);
}, [nodes, edges]);
```

### 3. Selective Re-renders
Components subscribe only to necessary state changes.

### 4. ReactFlow Optimizations
- `proOptions={{ hideAttribution: true }}`: Hide ReactFlow attribution
- Efficient node/edge updates using ReactFlow's built-in optimizations

This comprehensive canvas system provides users with a powerful, interactive drawing surface for creating complex cloud architecture diagrams with full keyboard support, undo/redo capabilities, and real-time state synchronization.
