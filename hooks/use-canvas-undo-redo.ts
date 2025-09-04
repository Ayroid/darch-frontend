import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useUndoRedo, UndoRedoActions, UndoRedoActionType } from '@/lib/stores';

/**
 * Hook for managing undo/redo state in the architecture canvas
 * Provides methods to save state at specific moments with action descriptions
 */
export function useCanvasUndoRedo() {
  const { saveState, undo, redo, canUndo, canRedo, clearHistory } = useUndoRedo();

  // Save state with a specific action type
  const saveCanvasState = useCallback((
    nodes: Node[], 
    edges: Edge[], 
    action: UndoRedoActionType,
    description?: string
  ) => {
    const actionDescription = description || action;
    saveState(nodes, edges, actionDescription);
  }, [saveState]);

  // Save state after node operations
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

  // Save state after edge operations
  const saveAfterEdgeOperation = useCallback((
    nodes: Node[], 
    edges: Edge[], 
    operation: 'add' | 'delete'
  ) => {
    const actionMap = {
      add: UndoRedoActions.EDGE_ADD,
      delete: UndoRedoActions.EDGE_DELETE,
    };
    
    saveCanvasState(nodes, edges, actionMap[operation]);
  }, [saveCanvasState]);

  // Save state after bulk operations
  const saveAfterBulkOperation = useCallback((
    nodes: Node[], 
    edges: Edge[], 
    operation: 'paste' | 'duplicate' | 'import' | 'bulk'
  ) => {
    const actionMap = {
      paste: UndoRedoActions.PASTE,
      duplicate: UndoRedoActions.DUPLICATE,
      import: UndoRedoActions.IMPORT,
      bulk: UndoRedoActions.BULK_OPERATION,
    };
    
    saveCanvasState(nodes, edges, actionMap[operation]);
  }, [saveCanvasState]);

  // Debounced save for general changes (with longer delay to avoid too many saves)
  const debouncedSave = useCallback((
    nodes: Node[], 
    edges: Edge[], 
    delay: number = 1000
  ) => {
    return setTimeout(() => {
      saveCanvasState(nodes, edges, 'canvas_change' as UndoRedoActionType);
    }, delay);
  }, [saveCanvasState]);

  return {
    // Core undo/redo
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    
    // Specific save methods
    saveCanvasState,
    saveAfterNodeOperation,
    saveAfterEdgeOperation,
    saveAfterBulkOperation,
    debouncedSave,
  };
}
