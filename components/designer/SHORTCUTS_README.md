# Keyboard Shortcuts System

This directory contains a comprehensive keyboard shortcuts system for the Darch Architecture Designer. The system is modular and allows for easy addition of new shortcuts.

## Files

- `keyboard-shortcuts.ts` - Main shortcuts library with hooks and interfaces
- `KeyboardShortcutsHelp.tsx` - Help modal component showing all shortcuts
- `UndoRedoControls.tsx` - Visual undo/redo controls with buttons

## Usage

### In Components

```typescript
import { useCanvasShortcuts, useApplicationShortcuts } from '@/lib/keyboard-shortcuts';

// For canvas operations
useCanvasShortcuts({
  onCopyNodes: handleCopy,
  onPasteNodes: handlePaste,
  onDeleteNodes: handleDelete,
  // ... other handlers
});

// For application-level shortcuts
useApplicationShortcuts({
  onNewArchitecture: handleNew,
  onSave: handleSave,
  onToggleSidebar: handleToggle,
  // ... other handlers
});
```

## Available Shortcuts

### Canvas Operations
- **Ctrl/Cmd + C** - Copy selected nodes
- **Ctrl/Cmd + V** - Paste copied nodes
- **Ctrl/Cmd + D** - Duplicate selected nodes
- **Ctrl/Cmd + A** - Select all nodes
- **Ctrl/Cmd + Z** - Undo last action
- **Ctrl/Cmd + Y** - Redo last action
- **Ctrl/Cmd + Shift + Z** - Redo last action (alternative)
- **Delete / Backspace** - Delete selected nodes
- **Escape** - Deselect all nodes

### View Controls
- **Ctrl/Cmd + 0** - Fit view to show all nodes
- **Ctrl/Cmd + =** - Zoom in
- **Ctrl/Cmd + -** - Zoom out
- **Ctrl/Cmd + 1** - Reset zoom to 100%
- **Space + Drag** - Pan the canvas (built into ReactFlow)

### Node Manipulation
- **Arrow Keys** - Move selected nodes (5px steps)
- **Shift + Arrow Keys** - Move selected nodes (20px steps)

### Application Shortcuts
- **Ctrl/Cmd + N** - Create new architecture
- **Ctrl/Cmd + S** - Save architecture
- **T** - Toggle sidebar
- **F** - Toggle fullscreen mode
- **?** - Show/hide keyboard shortcuts help

## Features

### Smart Input Detection
All shortcuts automatically disable when typing in input fields or text areas to prevent conflicts.

### Cross-Platform Compatibility
Shortcuts work with both Ctrl (Windows/Linux) and Cmd (Mac) modifiers.

### Visual Feedback
- Console logging for most actions
- Visual selection indicators
- Undo/redo button states
- Help modal with all shortcuts

### Undo/Redo System
- Maintains history of up to 50 states
- Automatic state saving with debouncing
- Visual indicators for available actions

## Implementation Details

### Hooks

#### `useCanvasShortcuts(actions)`
Handles all canvas-specific shortcuts including copy/paste, selection, movement, and view controls.

**Parameters:**
```typescript
interface CanvasShortcutActions {
  onCopyNodes: () => void;
  onPasteNodes: () => void;
  onDuplicateNodes: () => void;
  onSelectAllNodes: () => void;
  onDeselectAllNodes: () => void;
  onDeleteNodes: () => void;
  onMoveSelectedNodes: (direction: 'up' | 'down' | 'left' | 'right', distance: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  reactFlowInstance?: ReactFlowInstance | null;
}
```

#### `useApplicationShortcuts(actions)`
Handles application-level shortcuts like save, new architecture, sidebar toggle, etc.

**Parameters:**
```typescript
interface ShortcutActions {
  onNewArchitecture?: () => void;
  onSave?: () => void;
  onToggleSidebar?: () => void;
  onToggleFullscreen?: () => void;
  onShowHelp?: () => void;
  // ... other optional handlers
}
```

#### `useUndoRedo()`
Provides undo/redo functionality with state management.

**Returns:**
```typescript
{
  saveState: (nodes: Node[], edges: Edge[]) => void;
  undo: () => { nodes: Node[]; edges: Edge[] } | null;
  redo: () => { nodes: Node[]; edges: Edge[] } | null;
  canUndo: boolean;
  canRedo: boolean;
}
```

### Components

#### `KeyboardShortcutsHelp`
Modal component that displays all available shortcuts in a organized, searchable format.

**Props:**
```typescript
interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### `UndoRedoControls`
Visual controls for undo/redo operations with proper disabled states.

**Props:**
```typescript
interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}
```

## Adding New Shortcuts

### 1. Update the shortcuts guide
Add your new shortcut to the comment documentation at the top of `keyboard-shortcuts.ts`.

### 2. Add to the appropriate hook
```typescript
// In useCanvasShortcuts or useApplicationShortcuts
else if (isCtrlOrCmd && event.key === 'newKey') {
  event.preventDefault();
  onNewAction?.();
}
```

### 3. Update interfaces
Add new action handlers to the appropriate interface.

### 4. Update help modal
Add the new shortcut to the `shortcutSections` array in `KeyboardShortcutsHelp.tsx`.

### 5. Implement in components
Pass the handler to the appropriate hook in your component.

## Best Practices

1. **Always prevent default** for custom shortcuts to avoid browser conflicts
2. **Check input focus** before triggering shortcuts
3. **Use consistent key combinations** following platform conventions
4. **Provide visual feedback** for all actions
5. **Make actions optional** in interfaces for flexibility
6. **Test cross-platform** compatibility

## Browser Compatibility

The shortcuts system works in all modern browsers and handles:
- Different OS modifier keys (Ctrl vs Cmd)
- Focus management
- Event propagation
- Default behavior prevention
