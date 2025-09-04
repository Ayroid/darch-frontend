# Undo/Redo System Documentation

## Overview

The Darch undo/redo system provides reliable, performant state management for the architecture canvas with intelligent action tracking and operation-specific state saving. The system has been completely redesigned to eliminate previous issues with stale closures, race conditions, and excessive state saving.

## Architecture

### Core Components

1. **Undo/Redo Store** (`lib/stores/canvas/undo-redo-store.ts`)
   - Zustand-based state management
   - Deep state comparison to prevent duplicates
   - Action tracking with timestamps
   - Configurable history limits

2. **Canvas Hook** (`hooks/use-canvas-undo-redo.ts`)
   - Operation-specific save methods
   - Debounced saving capabilities
   - Integration with canvas operations

3. **Enhanced Node Handlers** (`components/designer/nodeUtils.tsx`)
   - Integrated state saving for node operations
   - Timing-aware save operations
   - Action-specific descriptions

## Key Features

### ✅ Problem Solving

**Fixed Issues from Previous Implementation:**

1. **Stale Closures** - Removed dependency on `historyIndex` in callbacks
2. **Race Conditions** - Added operation flags and proper async handling
3. **Excessive State Saving** - Moved from timer-based to operation-based saving
4. **No State Comparison** - Deep comparison prevents duplicate saves
5. **Poor Performance** - Optimized with targeted saves and efficient cloning

### ✅ New Capabilities

1. **Action Tracking** - Every state change includes descriptive action
2. **Operation-Specific Saving** - Different strategies for different operations
3. **Conflict Prevention** - Robust handling of concurrent operations
4. **Zustand Integration** - Better state management and DevTools support
5. **Intelligent Timing** - Context-aware save timing for different operations

## Implementation Details

### Store Structure

```typescript
interface UndoRedoState {
  history: StateSnapshot[];
  currentIndex: number;
  maxHistorySize: number;
  isUndoing: boolean;
  isRedoing: boolean;
}

interface StateSnapshot {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  action?: string;
}
```

### Action Types

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

### State Saving Strategy

#### Operation-Based Saving

Instead of automatic debounced saving, state is saved at specific operation moments:

**Node Operations:**
- **Add Node** - Immediately after drag & drop completion
- **Delete Nodes** - After deletion and edge cleanup
- **Move Nodes** - After drag end with parent relationship updates
- **Resize Containers** - After resize operation completes
- **Configure Nodes** - After configuration changes

**Edge Operations:**
- **Add Edge** - Immediately after connection creation
- **Delete Edge** - After edge removal (manual or cascading)

**Bulk Operations:**
- **Paste** - After pasting copied nodes
- **Duplicate** - After duplicating selected nodes
- **Import** - After importing architecture data

#### Smart Timing

```typescript
// Immediate save for user-initiated actions
setTimeout(() => {
  undoRedoHook.saveAfterNodeOperation(nodes, edges, 'add');
}, 0);

// Delayed save for operations requiring state settling
setTimeout(() => {
  undoRedoHook.saveAfterNodeOperation(nodes, edges, 'move');
}, 100);

// Longer delay for complex operations
setTimeout(() => {
  undoRedoHook.saveAfterBulkOperation(nodes, edges, 'duplicate');
}, 300);
```

### State Comparison

Deep comparison prevents saving duplicate states:

```typescript
function statesAreEqual(
  nodes1: Node[], edges1: Edge[],
  nodes2: Node[], edges2: Edge[]
): boolean {
  if (nodes1.length !== nodes2.length || edges1.length !== edges2.length) {
    return false;
  }

  // Compare nodes - checks id, type, position, selection, data
  for (let i = 0; i < nodes1.length; i++) {
    const node1 = nodes1[i];
    const node2 = nodes2[i];

    if (node1.id !== node2.id ||
        node1.position.x !== node2.position.x ||
        JSON.stringify(node1.data) !== JSON.stringify(node2.data)) {
      return false;
    }
  }

  // Compare edges - checks id, source, target, handles, data
  for (let i = 0; i < edges1.length; i++) {
    const edge1 = edges1[i];
    const edge2 = edges2[i];

    if (edge1.source !== edge2.source ||
        edge1.target !== edge2.target ||
        JSON.stringify(edge1.data) !== JSON.stringify(edge2.data)) {
      return false;
    }
  }

  return true;
}
```

### Conflict Prevention

#### Operation Flags

```typescript
// Prevent saving during undo/redo operations
saveState: (nodes, edges, action) => {
  if (state.isUndoing || state.isRedoing) {
    return; // Skip saving during undo/redo
  }
  // ... save logic
}

// Set flags during operations
undo: () => {
  set({ isUndoing: true, currentIndex: state.currentIndex - 1 });
  setTimeout(() => set({ isUndoing: false }), 0);
  return previousSnapshot;
}
```

#### Async State Updates

```typescript
// Avoid race conditions with proper async handling
const handleDeleteNodes = () => {
  // Apply changes immediately
  setNodes(filteredNodes);
  setEdges(filteredEdges);

  // Save state after React has processed updates
  setTimeout(() => {
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        undoRedoHook.saveAfterNodeOperation(currentNodes, currentEdges, 'delete');
        return currentEdges;
      });
      return currentNodes;
    });
  }, 0);
};
```

## Usage Examples

### Basic Usage

```typescript
// In a canvas component
const undoRedoHook = useCanvasUndoRedo();
const { undo, redo, canUndo, canRedo } = undoRedoHook;

// Handle undo/redo with action logging
const handleUndo = useCallback(() => {
  const previousState = undo();
  if (previousState) {
    setNodes(previousState.nodes);
    setEdges(previousState.edges);
    console.log("Undid:", previousState.action);
  }
}, [undo, setNodes, setEdges]);
```

### Operation-Specific Saving

```typescript
// After adding a node
const onDrop = useCallback((event) => {
  // ... create and add node
  setNodes(nodesWithNew);

  // Save state with specific action
  setTimeout(() => {
    undoRedoHook.saveAfterNodeOperation(nodes, edges, 'add');
  }, 0);
}, [undoRedoHook]);

// After bulk operation
const handlePaste = useCallback((copiedNodes) => {
  // ... paste logic
  setNodes(updatedNodes);

  // Save state for bulk operation
  setTimeout(() => {
    undoRedoHook.saveAfterBulkOperation(nodes, edges, 'paste');
  }, 0);
}, [undoRedoHook]);
```

### Custom Actions

```typescript
// Save with custom action description
undoRedoHook.saveCanvasState(
  nodes,
  edges,
  'custom_action' as UndoRedoActionType,
  'User performed custom operation'
);
```

## Integration Points

### Canvas Component

```typescript
// components/designer/ArchitectureCanvas.tsx
export default function ArchitectureCanvas() {
  const undoRedoHook = useCanvasUndoRedo();

  // Pass to node handlers for integrated saving
  const nodeHandlers = createNodeHandlers(
    nodes, setNodes, setEdges, onNodesChange,
    onNodeAdd, getNodeConfiguration,
    architectureStore, undoRedoHook // Pass hook
  );

  // Enhanced event handlers with state saving
  const onConnect = useCallback((params) => {
    // ... create edge
    setEdges(addEdge(newEdge, eds));

    // Save state after edge addition
    setTimeout(() => {
      undoRedoHook.saveAfterEdgeOperation(nodes, edges, 'add');
    }, 0);
  }, [undoRedoHook]);
}
```

### Keyboard Shortcuts

```typescript
// lib/keyboard-shortcuts.ts
useCanvasShortcuts({
  onUndo: handleUndo,
  onRedo: handleRedo,
  // ... other shortcuts
});

// Shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)
```

### UI Controls

```typescript
// components/designer/UndoRedoControls.tsx
<UndoRedoControls
  canUndo={canUndo}
  canRedo={canRedo}
  onUndo={handleUndo}
  onRedo={handleRedo}
/>
```

## Performance Considerations

### Optimizations

1. **Efficient Cloning** - JSON-based deep cloning for state snapshots
2. **History Limits** - Configurable max history size (default: 50)
3. **Smart Comparison** - Only saves when meaningful changes occur
4. **Targeted Saves** - Operation-specific saving reduces unnecessary snapshots
5. **Memory Management** - Automatic cleanup of old history entries

### Memory Usage

```typescript
// Configure history size based on use case
undoRedoHook.setMaxHistorySize(30); // Smaller for memory-constrained environments
undoRedoHook.setMaxHistorySize(100); // Larger for power users
```

### Performance Monitoring

```typescript
// Get history information for debugging
const historyInfo = undoRedoHook.getHistoryInfo();
console.log('History size:', historyInfo.total);
console.log('Current position:', historyInfo.current);
console.log('Can undo:', historyInfo.canUndo);
console.log('Can redo:', historyInfo.canRedo);
```

## Debugging

### Action Tracking

Every undo/redo operation logs the action being performed:

```typescript
// Console output examples:
"Undid: node_add"
"Redid: edge_delete"
"Undid: paste"
"Redid: node_move"
```

### Zustand DevTools

Enable browser DevTools integration for full state inspection:

```typescript
// In browser DevTools -> Zustand tab
// View: history, currentIndex, operation flags
// Monitor: state changes, action dispatches
```

### Store Debugging

```typescript
// Access store state directly for debugging
const store = useUndoRedoStore.getState();
console.log('Current history:', store.history);
console.log('Current index:', store.currentIndex);
console.log('Is undoing:', store.isUndoing);
```

## Best Practices

### Do's

✅ **Use operation-specific saves** for different types of changes
✅ **Include action descriptions** for better debugging
✅ **Test undo/redo after major changes** to verify functionality
✅ **Use setTimeout(0)** for async state updates
✅ **Pass undoRedoHook to handlers** that modify state

### Don'ts

❌ **Don't save state during undo/redo operations** (handled automatically)
❌ **Don't save state on every minor change** (use debounced saves sparingly)
❌ **Don't mutate state objects** (always create new objects)
❌ **Don't ignore async timing** (use proper setTimeout delays)
❌ **Don't skip state comparison** (let the system handle duplicates)

## Migration from Previous System

### Key Changes

1. **Hook Import**: `useUndoRedo()` → `useCanvasUndoRedo()`
2. **Save Method**: `saveState(nodes, edges)` → `saveAfterNodeOperation(nodes, edges, 'add')`
3. **Return Type**: `{ nodes, edges }` → `StateSnapshot`
4. **Configuration**: Pass `undoRedoHook` to node handlers

### Migration Steps

1. Replace old hook imports
2. Update save calls to use operation-specific methods
3. Add undoRedoHook parameter to createNodeHandlers
4. Update return type handling in undo/redo handlers
5. Test all operations thoroughly

This enhanced undo/redo system provides robust, performant state management that integrates seamlessly with canvas operations while providing clear feedback and debugging capabilities.
