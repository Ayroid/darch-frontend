/**
 * Keyboard Shortcuts for Darch Architecture Designer
 * 
 * This file contains all keyboard shortcuts used throughout the application.
 * Import the relevant hook in components where shortcuts are needed.
 * 
 * AVAILABLE SHORTCUTS:
 * 
 * === CANVAS OPERATIONS ===
 * Ctrl/Cmd + C         Copy selected nodes
 * Ctrl/Cmd + V         Paste copied nodes
 * Ctrl/Cmd + D         Duplicate selected nodes
 * Ctrl/Cmd + A         Select all nodes
 * Ctrl/Cmd + Z         Undo last action
 * Ctrl/Cmd + Y         Redo last action
 * Ctrl/Cmd + Shift + Z Redo last action (alternative)
 * Delete / Backspace   Delete selected nodes
 * Escape               Deselect all nodes
 * 
 * === VIEW CONTROLS ===
 * Ctrl/Cmd + 0         Fit view to show all nodes
 * Ctrl/Cmd + =         Zoom in
 * Ctrl/Cmd + -         Zoom out
 * Ctrl/Cmd + 1         Reset zoom to 100%
 * Space + Drag         Pan the canvas
 * 
 * === NODE MANIPULATION ===
 * Arrow Keys           Move selected nodes (5px steps)
 * Shift + Arrow Keys   Move selected nodes (20px steps)
 * Ctrl/Cmd + G         Group selected nodes
 * Ctrl/Cmd + U         Ungroup selected nodes
 * 
 * === APPLICATION SHORTCUTS ===
 * Ctrl/Cmd + N         Create new architecture
 * Ctrl/Cmd + S         Save architecture
 * Ctrl/Cmd + O         Open architecture
 * T                    Toggle sidebar
 * F                    Toggle fullscreen mode
 * ?                    Show/hide keyboard shortcuts help
 * 
 * === EDGE OPERATIONS ===
 * E                    Toggle edge creation mode
 * R                    Toggle edge removal mode
 * 
 */

import { useCallback, useEffect, useState } from 'react';
import { Node, Edge, ReactFlowInstance } from '@xyflow/react';

export interface ShortcutActions {
  // Canvas operations
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onDeselect?: () => void;

  // View controls
  onFitView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;

  // Node manipulation
  onMoveNodes?: (direction: 'up' | 'down' | 'left' | 'right', distance: number) => void;
  onGroupNodes?: () => void;
  onUngroupNodes?: () => void;

  // Application shortcuts
  onNewArchitecture?: () => void;
  onSave?: () => void;
  onOpen?: () => void;
  onToggleSidebar?: () => void;
  onToggleFullscreen?: () => void;
  onShowHelp?: () => void;

  // Edge operations
  onToggleEdgeMode?: () => void;
  onToggleEdgeRemovalMode?: () => void;
}

export interface CanvasShortcutActions {
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

/**
 * Hook for canvas-specific keyboard shortcuts
 */
export const useCanvasShortcuts = (actions: CanvasShortcutActions) => {
  const {
    onCopyNodes,
    onPasteNodes,
    onDuplicateNodes,
    onSelectAllNodes,
    onDeselectAllNodes,
    onDeleteNodes,
    onMoveSelectedNodes,
    onUndo,
    onRedo,
    reactFlowInstance,
  } = actions;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    
    // Don't trigger shortcuts when typing in inputs
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;

    // Canvas operations
    if (isCtrlOrCmd && event.key === 'c') {
      event.preventDefault();
      onCopyNodes();
    } else if (isCtrlOrCmd && event.key === 'v') {
      event.preventDefault();
      onPasteNodes();
    } else if (isCtrlOrCmd && event.key === 'd') {
      event.preventDefault();
      onDuplicateNodes();
    } else if (isCtrlOrCmd && event.key === 'a') {
      event.preventDefault();
      onSelectAllNodes();
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      onDeleteNodes();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onDeselectAllNodes();
    }

    // Undo/Redo
    else if (isCtrlOrCmd && event.key === 'z' && !isShift) {
      event.preventDefault();
      onUndo?.();
    } else if (isCtrlOrCmd && ((event.key === 'y') || (event.key === 'z' && isShift))) {
      event.preventDefault();
      onRedo?.();
    }

    // View controls
    else if (isCtrlOrCmd && event.key === '0') {
      event.preventDefault();
      reactFlowInstance?.fitView();
    } else if (isCtrlOrCmd && event.key === '=') {
      event.preventDefault();
      reactFlowInstance?.zoomIn();
    } else if (isCtrlOrCmd && event.key === '-') {
      event.preventDefault();
      reactFlowInstance?.zoomOut();
    } else if (isCtrlOrCmd && event.key === '1') {
      event.preventDefault();
      reactFlowInstance?.setViewport({ x: 0, y: 0, zoom: 1 });
    }

    // Node movement
    else if (event.key === 'ArrowUp') {
      event.preventDefault();
      onMoveSelectedNodes('up', isShift ? 20 : 5);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      onMoveSelectedNodes('down', isShift ? 20 : 5);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onMoveSelectedNodes('left', isShift ? 20 : 5);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onMoveSelectedNodes('right', isShift ? 20 : 5);
    }
  }, [
    onCopyNodes,
    onPasteNodes,
    onDuplicateNodes,
    onSelectAllNodes,
    onDeselectAllNodes,
    onDeleteNodes,
    onMoveSelectedNodes,
    onUndo,
    onRedo,
    reactFlowInstance,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * Hook for application-level keyboard shortcuts
 */
export const useApplicationShortcuts = (actions: ShortcutActions) => {
  const {
    onNewArchitecture,
    onSave,
    onToggleSidebar,
    onToggleFullscreen,
    onShowHelp,
  } = actions;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    
    // Don't trigger shortcuts when typing in inputs
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    // Application shortcuts
    if (isCtrlOrCmd && event.key === 'n') {
      event.preventDefault();
      onNewArchitecture?.();
    } else if (isCtrlOrCmd && event.key === 's') {
      event.preventDefault();
      onSave?.();
    } else if (event.key === 't' && !isCtrlOrCmd) {
      event.preventDefault();
      onToggleSidebar?.();
    } else if (event.key === 'f' && !isCtrlOrCmd) {
      event.preventDefault();
      onToggleFullscreen?.();
    } else if (event.key === '?' || (isCtrlOrCmd && event.key === '/')) {
      event.preventDefault();
      onShowHelp?.();
    }
  }, [onNewArchitecture, onSave, onToggleSidebar, onToggleFullscreen, onShowHelp]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * Hook for undo/redo functionality
 */
export const useUndoRedo = () => {
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[]; }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveState = useCallback((nodes: Node[], edges: Edge[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes: [...nodes], edges: [...edges] });
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return { saveState, undo, redo, canUndo, canRedo };
};
