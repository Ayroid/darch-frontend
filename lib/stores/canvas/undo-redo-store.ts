import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Node, Edge } from "@xyflow/react";

// State snapshot for undo/redo
interface StateSnapshot {
	nodes: Node[];
	edges: Edge[];
	timestamp: number;
	action?: string; // Optional description of what action caused this state
}

// Undo/Redo state
interface UndoRedoState {
	history: StateSnapshot[];
	currentIndex: number;
	maxHistorySize: number;
	isUndoing: boolean;
	isRedoing: boolean;
}

// Undo/Redo actions
interface UndoRedoActions {
	// Core undo/redo operations
	saveState: (nodes: Node[], edges: Edge[], action?: string) => void;
	undo: () => StateSnapshot | null;
	redo: () => StateSnapshot | null;

	// State checks
	canUndo: () => boolean;
	canRedo: () => boolean;

	// Configuration
	setMaxHistorySize: (size: number) => void;

	// Clear history
	clearHistory: () => void;

	// Get current state info
	getCurrentSnapshot: () => StateSnapshot | null;
	getHistoryInfo: () => {
		total: number;
		current: number;
		canUndo: boolean;
		canRedo: boolean;
	};
}

// Helper function to deep compare nodes and edges
function statesAreEqual(
	nodes1: Node[],
	edges1: Edge[],
	nodes2: Node[],
	edges2: Edge[]
): boolean {
	if (nodes1.length !== nodes2.length || edges1.length !== edges2.length) {
		return false;
	}

	// Compare nodes
	for (let i = 0; i < nodes1.length; i++) {
		const node1 = nodes1[i];
		const node2 = nodes2[i];

		if (
			node1.id !== node2.id ||
			node1.type !== node2.type ||
			node1.position.x !== node2.position.x ||
			node1.position.y !== node2.position.y ||
			node1.selected !== node2.selected ||
			node1.dragging !== node2.dragging ||
			JSON.stringify(node1.data) !== JSON.stringify(node2.data)
		) {
			return false;
		}
	}

	// Compare edges
	for (let i = 0; i < edges1.length; i++) {
		const edge1 = edges1[i];
		const edge2 = edges2[i];

		if (
			edge1.id !== edge2.id ||
			edge1.source !== edge2.source ||
			edge1.target !== edge2.target ||
			edge1.sourceHandle !== edge2.sourceHandle ||
			edge1.targetHandle !== edge2.targetHandle ||
			edge1.selected !== edge2.selected ||
			JSON.stringify(edge1.data) !== JSON.stringify(edge2.data)
		) {
			return false;
		}
	}

	return true;
}

// Create the undo/redo store
export const useUndoRedoStore = create<UndoRedoState & UndoRedoActions>()(
	devtools((set, get) => ({
		// Initial state
		history: [],
		currentIndex: -1,
		maxHistorySize: 50,
		isUndoing: false,
		isRedoing: false,

		// Save a new state to history
		saveState: (nodes: Node[], edges: Edge[], action?: string) => {
			const state = get();

			// Don't save state during undo/redo operations
			if (state.isUndoing || state.isRedoing) {
				return;
			}

			// Create deep copies to prevent mutations
			const nodesCopy: Node[] = JSON.parse(JSON.stringify(nodes));
			const edgesCopy: Edge[] = JSON.parse(JSON.stringify(edges));

			// Check if this state is different from the current one
			const currentSnapshot = state.history[state.currentIndex];
			if (
				currentSnapshot &&
				statesAreEqual(nodesCopy, edgesCopy, currentSnapshot.nodes, currentSnapshot.edges)
			) {
				return; // No changes, don't save
			}

			set((state) => {
				// Remove any future history if we're not at the end
				const newHistory = state.currentIndex < state.history.length - 1
					? state.history.slice(0, state.currentIndex + 1)
					: [...state.history];

				// Add new snapshot
				const newSnapshot: StateSnapshot = {
					nodes: nodesCopy,
					edges: edgesCopy,
					timestamp: Date.now(),
					action,
				};

				newHistory.push(newSnapshot);

				// Enforce max history size
				let newCurrentIndex = state.currentIndex;
				if (newHistory.length > state.maxHistorySize) {
					newHistory.shift();
				} else {
					newCurrentIndex++;
				}

				return {
					...state,
					history: newHistory,
					currentIndex: newCurrentIndex,
				};
			});
		},

		// Undo operation
		undo: () => {
			const state = get();

			if (!state.canUndo()) {
				return null;
			}

			set({ ...state, isUndoing: true, currentIndex: state.currentIndex - 1 });

			const previousSnapshot = state.history[state.currentIndex - 1];

			// Reset undo flag after a short delay to allow React to process the state change
			setTimeout(() => {
				set((currentState) => ({ ...currentState, isUndoing: false }));
			}, 0);

			return previousSnapshot ? {
				nodes: JSON.parse(JSON.stringify(previousSnapshot.nodes)),
				edges: JSON.parse(JSON.stringify(previousSnapshot.edges)),
				timestamp: previousSnapshot.timestamp,
				action: previousSnapshot.action,
			} : null;
		},

		// Redo operation
		redo: () => {
			const state = get();

			if (!state.canRedo()) {
				return null;
			}

			set({ ...state, isRedoing: true, currentIndex: state.currentIndex + 1 });

			const nextSnapshot = state.history[state.currentIndex + 1];

			// Reset redo flag after a short delay to allow React to process the state change
			setTimeout(() => {
				set((currentState) => ({ ...currentState, isRedoing: false }));
			}, 0);

			return nextSnapshot ? {
				nodes: JSON.parse(JSON.stringify(nextSnapshot.nodes)),
				edges: JSON.parse(JSON.stringify(nextSnapshot.edges)),
				timestamp: nextSnapshot.timestamp,
				action: nextSnapshot.action,
			} : null;
		},

		// Check if undo is possible
		canUndo: () => {
			const state = get();
			return state.currentIndex > 0;
		},

		// Check if redo is possible
		canRedo: () => {
			const state = get();
			return state.currentIndex < state.history.length - 1;
		},

		// Set maximum history size
		setMaxHistorySize: (size: number) =>
			set((state) => {
				const newMaxSize = Math.max(1, size);
				const newHistory = [...state.history];
				let newCurrentIndex = state.currentIndex;

				// Trim history if needed
				if (newHistory.length > newMaxSize) {
					const excess = newHistory.length - newMaxSize;
					newHistory.splice(0, excess);
					newCurrentIndex = Math.max(0, newCurrentIndex - excess);
				}

				return {
					...state,
					maxHistorySize: newMaxSize,
					history: newHistory,
					currentIndex: newCurrentIndex,
				};
			}),

		// Clear all history
		clearHistory: () =>
			set((state) => ({
				...state,
				history: [],
				currentIndex: -1,
			})),

		// Get current snapshot
		getCurrentSnapshot: () => {
			const state = get();
			return state.history[state.currentIndex] || null;
		},

		// Get history information
		getHistoryInfo: () => {
			const state = get();
			return {
				total: state.history.length,
				current: state.currentIndex,
				canUndo: state.canUndo(),
				canRedo: state.canRedo(),
			};
		},
	}),
	{
		name: "undo-redo-store",
	}
)
);

// Helper hook for easier usage
export function useUndoRedo() {
	const store = useUndoRedoStore();

	return {
		saveState: store.saveState,
		undo: store.undo,
		redo: store.redo,
		canUndo: store.canUndo(),
		canRedo: store.canRedo(),
		clearHistory: store.clearHistory,
		getHistoryInfo: store.getHistoryInfo,
		setMaxHistorySize: store.setMaxHistorySize,
	};
}

// Action types for better tracking
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

export type UndoRedoActionType = typeof UndoRedoActions[keyof typeof UndoRedoActions];
