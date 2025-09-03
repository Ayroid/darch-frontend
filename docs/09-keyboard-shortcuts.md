# Keyboard Shortcuts System

This document covers the comprehensive keyboard shortcuts system that provides efficient navigation and control throughout the application, including canvas operations, selection management, and productivity features.

## Overview

The keyboard shortcuts system enables power users to efficiently interact with the architecture designer through keyboard commands. It includes shortcuts for canvas navigation, node operations, clipboard actions, undo/redo, and application controls.

**Main Components**:
- Keyboard Shortcuts Hook (`lib/keyboard-shortcuts.ts`)
- Shortcuts Help Modal (`components/designer/KeyboardShortcutsHelp.tsx`)
- Application-wide Shortcuts Integration

## Keyboard Shortcuts Hook

### Main Hook Implementation

**File**: `lib/keyboard-shortcuts.ts`

```typescript
import { useCallback, useEffect } from "react";

interface UseApplicationShortcutsProps {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onFitView?: () => void;
  onDuplicate?: () => void;
  onImportExport?: () => void;
  onToggleHelp?: () => void;
  onNewArchitecture?: () => void;
  onQuickConfig?: () => void;
  onToggleGrid?: () => void;
  onToggleMinimap?: () => void;
}

export function useApplicationShortcuts({
  onSave,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onCut,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitView,
  onDuplicate,
  onImportExport,
  onToggleHelp,
  onNewArchitecture,
  onQuickConfig,
  onToggleGrid,
  onToggleMinimap,
}: UseApplicationShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const isModifier = ctrlKey || metaKey;

      // Prevent shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      // File Operations
      if (isModifier && key === "s") {
        event.preventDefault();
        onSave?.();
        return;
      }

      if (isModifier && key === "o") {
        event.preventDefault();
        onImportExport?.();
        return;
      }

      if (isModifier && key === "n") {
        event.preventDefault();
        onNewArchitecture?.();
        return;
      }

      // Edit Operations
      if (isModifier && !shiftKey && key === "z") {
        event.preventDefault();
        onUndo?.();
        return;
      }

      if ((isModifier && shiftKey && key === "z") || (isModifier && key === "y")) {
        event.preventDefault();
        onRedo?.();
        return;
      }

      if (isModifier && key === "c") {
        event.preventDefault();
        onCopy?.();
        return;
      }

      if (isModifier && key === "v") {
        event.preventDefault();
        onPaste?.();
        return;
      }

      if (isModifier && key === "x") {
        event.preventDefault();
        onCut?.();
        return;
      }

      if (isModifier && key === "d") {
        event.preventDefault();
        onDuplicate?.();
        return;
      }

      // Selection Operations
      if (isModifier && key === "a") {
        event.preventDefault();
        onSelectAll?.();
        return;
      }

      if (key === "Escape") {
        event.preventDefault();
        onDeselectAll?.();
        return;
      }

      if (key === "Delete" || key === "Backspace") {
        event.preventDefault();
        onDelete?.();
        return;
      }

      // View Operations
      if (isModifier && key === "=") {
        event.preventDefault();
        onZoomIn?.();
        return;
      }

      if (isModifier && key === "-") {
        event.preventDefault();
        onZoomOut?.();
        return;
      }

      if (isModifier && key === "0") {
        event.preventDefault();
        onZoomReset?.();
        return;
      }

      if (isModifier && shiftKey && key === "F") {
        event.preventDefault();
        onFitView?.();
        return;
      }

      // Toggle Operations
      if (altKey && key === "g") {
        event.preventDefault();
        onToggleGrid?.();
        return;
      }

      if (altKey && key === "m") {
        event.preventDefault();
        onToggleMinimap?.();
        return;
      }

      // Help and Configuration
      if (key === "?" || (shiftKey && key === "/")) {
        event.preventDefault();
        onToggleHelp?.();
        return;
      }

      if (isModifier && key === "k") {
        event.preventDefault();
        onQuickConfig?.();
        return;
      }
    },
    [
      onSave,
      onUndo,
      onRedo,
      onCopy,
      onPaste,
      onCut,
      onDelete,
      onSelectAll,
      onDeselectAll,
      onZoomIn,
      onZoomOut,
      onZoomReset,
      onFitView,
      onDuplicate,
      onImportExport,
      onToggleHelp,
      onNewArchitecture,
      onQuickConfig,
      onToggleGrid,
      onToggleMinimap,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
```

### Input Field Detection

```typescript
// Prevent shortcuts when user is typing
const isInputElement = (target: HTMLElement): boolean => {
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.contentEditable === "true" ||
    target.closest('[role="textbox"]') !== null ||
    target.closest('.ProseMirror') !== null // Rich text editors
  );
};

// Enhanced input detection
const shouldPreventShortcut = (event: KeyboardEvent): boolean => {
  const target = event.target as HTMLElement;

  if (isInputElement(target)) {
    return true;
  }

  // Allow certain shortcuts even in input fields
  const { key, ctrlKey, metaKey } = event;
  const isModifier = ctrlKey || metaKey;

  // Allow Ctrl+A in input fields for select all
  if (isModifier && key === "a" && isInputElement(target)) {
    return true;
  }

  return false;
};
```

## Shortcut Categories

### File Operations

```typescript
// File management shortcuts
const fileShortcuts = {
  save: { key: "Ctrl+S", action: "Save current architecture" },
  open: { key: "Ctrl+O", action: "Open import/export dialog" },
  new: { key: "Ctrl+N", action: "Create new architecture" },
  export: { key: "Ctrl+E", action: "Export architecture" },
};

// Implementation
if (isModifier && key === "s") {
  event.preventDefault();
  const { exportToFile } = useArchitectureStore.getState();
  exportToFile();
}

if (isModifier && key === "o") {
  event.preventDefault();
  setShowImportExport(true);
}

if (isModifier && key === "n") {
  event.preventDefault();
  const { createNewArchitecture } = useArchitectureStore.getState();
  createNewArchitecture();
}
```

### Edit Operations

```typescript
// Clipboard and edit shortcuts
const editShortcuts = {
  undo: { key: "Ctrl+Z", action: "Undo last action" },
  redo: { key: "Ctrl+Y / Ctrl+Shift+Z", action: "Redo last undone action" },
  copy: { key: "Ctrl+C", action: "Copy selected nodes" },
  paste: { key: "Ctrl+V", action: "Paste copied nodes" },
  cut: { key: "Ctrl+X", action: "Cut selected nodes" },
  duplicate: { key: "Ctrl+D", action: "Duplicate selected nodes" },
  delete: { key: "Delete / Backspace", action: "Delete selected nodes" },
};

// Clipboard operations integration
const handleCopy = useCallback(() => {
  const selectedNodes = getNodes().filter(node => node.selected);
  if (selectedNodes.length > 0) {
    const clipboardData = {
      nodes: selectedNodes,
      timestamp: Date.now(),
    };

    // Store in application clipboard
    setClipboard(clipboardData);

    // Also copy to system clipboard as JSON
    navigator.clipboard.writeText(JSON.stringify(clipboardData));

    toast.success(`Copied ${selectedNodes.length} node(s)`);
  }
}, [getNodes, setClipboard]);

const handlePaste = useCallback(() => {
  const clipboardData = getClipboard();
  if (clipboardData && clipboardData.nodes) {
    const { nodes } = clipboardData;
    const newNodes = nodes.map(node => ({
      ...node,
      id: generateNodeId(),
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: true,
    }));

    setNodes(prev => [...prev.map(n => ({ ...n, selected: false })), ...newNodes]);
    toast.success(`Pasted ${newNodes.length} node(s)`);
  }
}, [getClipboard, setNodes]);
```

### Selection Operations

```typescript
// Selection management shortcuts
const selectionShortcuts = {
  selectAll: { key: "Ctrl+A", action: "Select all nodes" },
  deselectAll: { key: "Escape", action: "Deselect all nodes" },
  invertSelection: { key: "Ctrl+I", action: "Invert selection" },
};

// Implementation
const handleSelectAll = useCallback(() => {
  setNodes(nodes => nodes.map(node => ({ ...node, selected: true })));

  const nodeCount = getNodes().length;
  if (nodeCount > 0) {
    toast.success(`Selected ${nodeCount} node(s)`);
  }
}, [setNodes, getNodes]);

const handleDeselectAll = useCallback(() => {
  setNodes(nodes => nodes.map(node => ({ ...node, selected: false })));
  setEdges(edges => edges.map(edge => ({ ...edge, selected: false })));
}, [setNodes, setEdges]);
```

### View Operations

```typescript
// Canvas view shortcuts
const viewShortcuts = {
  zoomIn: { key: "Ctrl++", action: "Zoom in" },
  zoomOut: { key: "Ctrl+-", action: "Zoom out" },
  zoomReset: { key: "Ctrl+0", action: "Reset zoom to 100%" },
  fitView: { key: "Ctrl+Shift+F", action: "Fit all nodes in view" },
  center: { key: "Ctrl+Shift+C", action: "Center view on selection" },
};

// ReactFlow integration
const handleZoomIn = useCallback(() => {
  const reactFlowInstance = getReactFlowInstance();
  if (reactFlowInstance) {
    reactFlowInstance.zoomIn({ duration: 300 });
  }
}, [getReactFlowInstance]);

const handleZoomOut = useCallback(() => {
  const reactFlowInstance = getReactFlowInstance();
  if (reactFlowInstance) {
    reactFlowInstance.zoomOut({ duration: 300 });
  }
}, [getReactFlowInstance]);

const handleZoomReset = useCallback(() => {
  const reactFlowInstance = getReactFlowInstance();
  if (reactFlowInstance) {
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
  }
}, [getReactFlowInstance]);

const handleFitView = useCallback(() => {
  const reactFlowInstance = getReactFlowInstance();
  if (reactFlowInstance) {
    reactFlowInstance.fitView({
      padding: 50,
      duration: 300,
      minZoom: 0.1,
      maxZoom: 2,
    });
  }
}, [getReactFlowInstance]);
```

### Toggle Operations

```typescript
// UI toggle shortcuts
const toggleShortcuts = {
  grid: { key: "Alt+G", action: "Toggle grid visibility" },
  minimap: { key: "Alt+M", action: "Toggle minimap" },
  sidebar: { key: "Alt+S", action: "Toggle sidebar" },
  panels: { key: "Alt+P", action: "Toggle all panels" },
};

// Implementation with store integration
const handleToggleGrid = useCallback(() => {
  const { toggleGrid } = useCanvasStore.getState();
  toggleGrid();

  const { showGrid } = useCanvasStore.getState();
  toast.success(`Grid ${showGrid ? 'enabled' : 'disabled'}`);
}, []);

const handleToggleMinimap = useCallback(() => {
  const { toggleMinimap } = useCanvasStore.getState();
  toggleMinimap();

  const { showMinimap } = useCanvasStore.getState();
  toast.success(`Minimap ${showMinimap ? 'enabled' : 'disabled'}`);
}, []);
```

## Integration with Components

### ArchitectureDesigner Integration

**File**: `components/designer/ArchitectureDesigner.tsx`

```typescript
export default function ArchitectureDesigner() {
  const [showHelp, setShowHelp] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  // Keyboard shortcuts integration
  useApplicationShortcuts({
    onSave: handleSave,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onCut: handleCut,
    onDelete: handleDelete,
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset,
    onFitView: handleFitView,
    onDuplicate: handleDuplicate,
    onImportExport: () => setShowImportExport(true),
    onToggleHelp: () => setShowHelp(true),
    onNewArchitecture: handleNewArchitecture,
    onQuickConfig: handleQuickConfig,
    onToggleGrid: handleToggleGrid,
    onToggleMinimap: handleToggleMinimap,
  });

  return (
    <div className="architecture-designer">
      {/* Main content */}

      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
      />
    </div>
  );
}
```

### Canvas-Specific Shortcuts

```typescript
// Additional canvas shortcuts for ReactFlow
const canvasShortcuts = {
  pan: { key: "Space + Drag", action: "Pan canvas" },
  multiSelect: { key: "Ctrl + Click", action: "Multi-select nodes" },
  boxSelect: { key: "Shift + Drag", action: "Box select nodes" },
  connect: { key: "Drag from handle", action: "Connect nodes" },
};

// ReactFlow configuration with shortcuts
<ReactFlow
  nodeTypes={nodeTypes}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  multiSelectionKeyCode="Control"
  selectionKeyCode="Shift"
  deleteKeyCode="Delete"
  panOnScroll={true}
  panOnScrollSpeed={0.5}
  zoomOnScroll={true}
  zoomOnPinch={true}
  zoomOnDoubleClick={true}
  selectNodesOnDrag={false}
>
```

## Shortcuts Help Modal

### Modal Component

**File**: `components/designer/KeyboardShortcutsHelp.tsx`

```typescript
interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  const shortcutGroups = [
    {
      title: "File Operations",
      shortcuts: [
        { key: "Ctrl+S", description: "Save architecture" },
        { key: "Ctrl+O", description: "Import/Export" },
        { key: "Ctrl+N", description: "New architecture" },
      ],
    },
    {
      title: "Edit Operations",
      shortcuts: [
        { key: "Ctrl+Z", description: "Undo" },
        { key: "Ctrl+Y", description: "Redo" },
        { key: "Ctrl+C", description: "Copy selected" },
        { key: "Ctrl+V", description: "Paste" },
        { key: "Ctrl+X", description: "Cut selected" },
        { key: "Ctrl+D", description: "Duplicate selected" },
        { key: "Delete", description: "Delete selected" },
      ],
    },
    {
      title: "Selection",
      shortcuts: [
        { key: "Ctrl+A", description: "Select all" },
        { key: "Escape", description: "Deselect all" },
        { key: "Ctrl+Click", description: "Multi-select" },
        { key: "Shift+Drag", description: "Box select" },
      ],
    },
    {
      title: "View Controls",
      shortcuts: [
        { key: "Ctrl++", description: "Zoom in" },
        { key: "Ctrl+-", description: "Zoom out" },
        { key: "Ctrl+0", description: "Reset zoom" },
        { key: "Ctrl+Shift+F", description: "Fit view" },
      ],
    },
    {
      title: "Toggle Options",
      shortcuts: [
        { key: "Alt+G", description: "Toggle grid" },
        { key: "Alt+M", description: "Toggle minimap" },
        { key: "?", description: "Show this help" },
      ],
    },
    {
      title: "Configuration",
      shortcuts: [
        { key: "Ctrl+K", description: "Quick configuration" },
        { key: "Enter", description: "Apply configuration" },
        { key: "Tab", description: "Next field" },
        { key: "Shift+Tab", description: "Previous field" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">?</kbd>
            to toggle this help dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Dynamic Shortcut Display

```typescript
// Context-aware shortcut hints
const ShortcutHint = ({ shortcut, description }: { shortcut: string; description: string }) => {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <kbd className="px-1 py-0.5 bg-gray-100 rounded">{shortcut}</kbd>
      <span>{description}</span>
    </div>
  );
};

// Usage in components
<Button
  onClick={handleSave}
  className="relative group"
>
  Save
  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
    <ShortcutHint shortcut="Ctrl+S" description="Save" />
  </div>
</Button>
```

## Platform-Specific Shortcuts

### macOS Compatibility

```typescript
// Detect platform and adjust modifiers
const isMac = typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const getModifierKey = () => isMac ? "metaKey" : "ctrlKey";
const getModifierSymbol = () => isMac ? "⌘" : "Ctrl";

// Adjust shortcuts for platform
const formatShortcut = (shortcut: string): string => {
  if (isMac) {
    return shortcut
      .replace(/Ctrl/g, "⌘")
      .replace(/Alt/g, "⌥")
      .replace(/Shift/g, "⇧");
  }
  return shortcut;
};

// Use in event handling
const isModifier = event[getModifierKey()];
```

### Custom Shortcut Configuration

```typescript
// Allow users to customize shortcuts
interface ShortcutConfig {
  action: string;
  key: string;
  modifiers: string[];
  description: string;
}

const defaultShortcuts: ShortcutConfig[] = [
  {
    action: "save",
    key: "s",
    modifiers: ["ctrl"],
    description: "Save architecture",
  },
  {
    action: "undo",
    key: "z",
    modifiers: ["ctrl"],
    description: "Undo last action",
  },
  // ... more shortcuts
];

// Store shortcuts in settings
const useShortcutSettings = () => {
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);

  const updateShortcut = (action: string, newShortcut: Partial<ShortcutConfig>) => {
    setShortcuts(prev =>
      prev.map(s => s.action === action ? { ...s, ...newShortcut } : s)
    );
  };

  return { shortcuts, updateShortcut };
};
```

## Accessibility Features

### Screen Reader Support

```typescript
// Announce shortcut actions to screen readers
const announceAction = (action: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = `Action: ${action}`;

  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};

// Use in shortcut handlers
const handleSave = useCallback(() => {
  const { exportToFile } = useArchitectureStore.getState();
  exportToFile();
  announceAction("Architecture saved");
}, []);
```

### Focus Management

```typescript
// Manage focus for keyboard navigation
const useFocusManagement = () => {
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, []);

  return { trapFocus };
};
```

## Performance Optimization

### Event Listener Optimization

```typescript
// Debounce rapid keystrokes
const useOptimizedShortcuts = () => {
  const lastKeyTime = useRef(0);
  const DEBOUNCE_TIME = 50; // 50ms debounce

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const now = Date.now();
    if (now - lastKeyTime.current < DEBOUNCE_TIME) {
      return;
    }
    lastKeyTime.current = now;

    // Process shortcuts...
  }, []);

  return { handleKeyDown };
};

// Efficient cleanup
useEffect(() => {
  const controller = new AbortController();

  window.addEventListener("keydown", handleKeyDown, {
    signal: controller.signal,
    passive: false,
  });

  return () => controller.abort();
}, [handleKeyDown]);
```

This comprehensive keyboard shortcuts system provides users with efficient, accessible, and customizable keyboard navigation throughout the application, enhancing productivity and user experience.
