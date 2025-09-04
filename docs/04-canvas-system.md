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

### Overview
The undo/redo system has been completely redesigned to provide reliable, performant state management with action tracking and intelligent state saving.

**Key Components:**
- **Undo/Redo Store**: Zustand-based state management (`lib/stores/canvas/undo-redo-store.ts`)
- **Canvas Hook**: Specialized operations hook (`hooks/use-canvas-undo-redo.ts`)
- **Action Tracking**: Named actions for better debugging and user feedback

### Store-Based Architecture

#### Undo/Redo Store
```typescript
// lib/stores/canvas/undo-redo-store.ts
export const useUndoRedoStore = create<UndoRedoState & UndoRedoActions>()(
  devtools((set, get) => ({
    history: [],
    currentIndex: -1,
    maxHistorySize: 50,
    isUndoing: false,
    isRedoing: false,

    saveState: (nodes: Node[], edges: Edge[], action?: string) => {
      // Prevents saving during undo/redo operations
      if (state.isUndoing || state.isRedoing) return;

      // Deep state comparison to avoid duplicate saves
      if (statesAreEqual(nodesCopy, edgesCopy, currentSnapshot.nodes, currentSnapshot.edges)) {
        return;
      }

      // Save with action tracking
      const newSnapshot = { nodes: nodesCopy, edges: edgesCopy, timestamp: Date.now(), action };
      // ... history management
    },

    undo: () => { /* Returns previous state snapshot */ },
    redo: () => { /* Returns next state snapshot */ },
  }))
);
```

#### Canvas Hook
```typescript
// hooks/use-canvas-undo-redo.ts
export function useCanvasUndoRedo() {
  const { saveState, undo, redo, canUndo, canRedo } = useUndoRedo();

  // Specialized save methods for different operations
  const saveAfterNodeOperation = useCallback((
    nodes: Node[],
    edges: Edge[],
    operation: 'add' | 'delete' | 'move' | 'resize' | 'configure'
  ) => {
    const actionMap = {
      add: UndoRedoActions.NODE_ADD,
      delete: UndoRedoActions.NODE_DELETE,
      move: UndoRedoActions.NODE_MOVE,
      resize: UndoRedoActions.NODE_RESIZE,
      configure: UndoRedoActions.NODE_CONFIG_CHANGE,
    };
    saveCanvasState(nodes, edges, actionMap[operation]);
  }, [saveCanvasState]);

  const saveAfterEdgeOperation = useCallback(/* ... */);
  const saveAfterBulkOperation = useCallback(/* ... */);

  return { undo, redo, canUndo, canRedo, saveAfterNodeOperation, /* ... */ };
}
```

### Action-Based State Saving

#### Action Types
```typescript
export const UndoRedoActions = {
  NODE_ADD: 'node_add',
  NODE_DELETE: 'node_delete',
  NODE_MOVE: 'node_move',
  NODE_RESIZE: 'node_resize',
  NODE_CONFIG_CHANGE: 'node_config_change',
  EDGE_ADD: 'edge_add',
  EDGE_DELETE: 'edge_delete',
  BULK_OPERATION: 'bulk_operation',
  PASTE: 'paste',
  DUPLICATE: 'duplicate',
  IMPORT: 'import',
} as const;
```

#### Intelligent State Saving
State is saved at specific moments rather than on every change:

**Node Operations:**
```typescript
// After adding a node (drag & drop)
setTimeout(() => {
  undoRedoHook.saveAfterNodeOperation(nodes, edges, 'add');
}, 0);

// After deleting nodes
setTimeout(() => {
  undoRedoHook.saveAfterNodeOperation(nodes, edges, 'delete');
}, 0);

// After moving nodes (drag end)
setTimeout(() => {
  undoRedoHook.saveAfterNodeOperation(nodes, edges, 'move');
}, 100);
```

**Edge Operations:**
```typescript
// After adding a connection
setTimeout(() => {
  undoRedoHook.saveAfterEdgeOperation(nodes, edges, 'add');
}, 0);

// After deleting an edge
setTimeout(() => {
  undoRedoHook.saveAfterEdgeOperation(nodes, edges, 'delete');
}, 0);
```

**Bulk Operations:**
```typescript
// After pasting nodes
setTimeout(() => {
  undoRedoHook.saveAfterBulkOperation(nodes, edges, 'paste');
}, 0);

// After duplicating nodes
setTimeout(() => {
  undoRedoHook.saveAfterBulkOperation(nodes, edges, 'duplicate');
}, 0);
```

### Canvas Integration

#### Canvas Component Setup
```typescript
// components/designer/ArchitectureCanvas.tsx
export default function ArchitectureCanvas() {
  // Use the enhanced canvas undo/redo hook
  const undoRedoHook = useCanvasUndoRedo();
  const { undo, redo, canUndo, canRedo } = undoRedoHook;

  // Pass hook to node handlers for operation-specific saving
  const nodeHandlers = createNodeHandlers(
    nodes, setNodes, setEdges, onNodesChange, onNodeAdd,
    getNodeConfiguration, architectureStore, undoRedoHook
  );

  // Handlers with action logging
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      console.log("Undid:", previousState.action || 'unknown');
    }
  }, [undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      console.log("Redid:", nextState.action || 'unknown');
    }
  }, [redo, setNodes, setEdges]);
}
```

#### Enhanced Node Handlers
```typescript
// components/designer/nodeUtils.tsx
export const createNodeHandlers = (
  nodes, setNodes, setEdges, onNodesChange, onNodeAdd,
  getNodeConfiguration, architectureStore, undoRedoHook
) => {
  const handleDeleteNodes = () => {
    // Apply deletions
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter(/* remove connected edges */));

    // Save state after deletion
    setTimeout(() => {
      if (undoRedoHook) {
        undoRedoHook.saveAfterNodeOperation(currentNodes, currentEdges, 'delete');
      }
    }, 0);
  };

  const handlePasteNodes = (copiedNodes) => {
    // Apply paste operation
    setNodes((nds) => [...nds.map(n => ({...n, selected: false})), ...newNodes]);

    // Save state after pasting
    setTimeout(() => {
      if (undoRedoHook) {
        undoRedoHook.saveAfterBulkOperation(currentNodes, currentEdges, 'paste');
      }
    }, 0);
  };

  // Similar pattern for duplicate, move operations...
};
```

### State Management Features

#### Conflict Prevention
- **Operation Flags**: Prevents saving state during undo/redo operations
- **Async Handling**: Uses setTimeout to avoid race conditions
- **State Comparison**: Deep comparison prevents duplicate saves

#### Performance Optimizations
- **Smart Saving**: Only saves when meaningful changes occur
- **History Limit**: Configurable history size (default: 50 states)
- **Efficient Cloning**: JSON-based deep cloning for state snapshots

#### Debugging & Monitoring
- **Action Tracking**: Each state change includes action description
- **Console Logging**: Undo/redo operations log action names
- **Zustand DevTools**: Full state inspection in browser DevTools

### Undo/Redo Controls
```typescript
<UndoRedoControls
  canUndo={canUndo}
  canRedo={canRedo}
  onUndo={handleUndo}
  onRedo={handleRedo}
/>
```

### Key Improvements Over Previous System

**✅ Fixed Issues:**
1. **Stale Closures**: Removed callback dependencies on `historyIndex`
2. **Race Conditions**: Added operation flags and proper timing
3. **Excessive Saves**: Moved from timer-based to operation-based saving
4. **No State Comparison**: Added deep comparison to prevent duplicates
5. **Poor Performance**: Optimized with targeted saves and efficient cloning

**✅ New Features:**
1. **Action Tracking**: Know exactly what action is being undone/redone
2. **Zustand Integration**: Better state management and DevTools support
3. **Operation-Specific Saving**: Different strategies for different operations
4. **Conflict Prevention**: Robust handling of concurrent operations

This new undo/redo system provides reliable, performant state management that integrates seamlessly with the canvas operations and provides clear feedback to users about what actions are being undone or redone.

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
