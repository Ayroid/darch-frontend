import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Canvas state for managing canvas-specific data
interface CanvasState {
	// Zoom and pan
	zoom: number;
	panX: number;
	panY: number;

	// Selection
	selectedNodes: string[];
	selectedEdges: string[];

	// Canvas interactions
	isDragging: boolean;
	isSelecting: boolean;
	selectionBox: {
		startX: number;
		startY: number;
		endX: number;
		endY: number;
	} | null;

	// Canvas settings
	canvasWidth: number;
	canvasHeight: number;
	backgroundColor: string;
}

// Canvas actions
interface CanvasActions {
	// Zoom and pan actions
	setZoom: (zoom: number) => void;
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;
	setPan: (x: number, y: number) => void;
	panBy: (deltaX: number, deltaY: number) => void;
	resetPan: () => void;

	// Selection actions
	selectNode: (nodeId: string) => void;
	selectNodes: (nodeIds: string[]) => void;
	deselectNode: (nodeId: string) => void;
	clearNodeSelection: () => void;
	selectEdge: (edgeId: string) => void;
	selectEdges: (edgeIds: string[]) => void;
	deselectEdge: (edgeId: string) => void;
	clearEdgeSelection: () => void;
	clearAllSelections: () => void;

	// Canvas interaction actions
	setDragging: (isDragging: boolean) => void;
	setSelecting: (isSelecting: boolean) => void;
	setSelectionBox: (box: {
		startX: number;
		startY: number;
		endX: number;
		endY: number;
	} | null) => void;

	// Canvas settings
	setCanvasSize: (width: number, height: number) => void;
	setBackgroundColor: (color: string) => void;

	// Reset canvas
	resetCanvas: () => void;
}

// Create the canvas store
export const useCanvasStore = create<CanvasState & CanvasActions>()(
	devtools(
		immer((set) => ({
			// Initial state
			zoom: 1,
			panX: 0,
			panY: 0,
			selectedNodes: [],
			selectedEdges: [],
			isDragging: false,
			isSelecting: false,
			selectionBox: null,
			canvasWidth: 1920,
			canvasHeight: 1080,
			backgroundColor: "#f8f9fa",

			// Actions
			setZoom: (zoom) =>
				set((state) => {
					state.zoom = Math.max(0.1, Math.min(3, zoom));
				}),

			zoomIn: () =>
				set((state) => {
					state.zoom = Math.min(3, state.zoom * 1.2);
				}),

			zoomOut: () =>
				set((state) => {
					state.zoom = Math.max(0.1, state.zoom / 1.2);
				}),

			resetZoom: () =>
				set((state) => {
					state.zoom = 1;
				}),

			setPan: (x, y) =>
				set((state) => {
					state.panX = x;
					state.panY = y;
				}),

			panBy: (deltaX, deltaY) =>
				set((state) => {
					state.panX += deltaX;
					state.panY += deltaY;
				}),

			resetPan: () =>
				set((state) => {
					state.panX = 0;
					state.panY = 0;
				}),

			selectNode: (nodeId) =>
				set((state) => {
					if (!state.selectedNodes.includes(nodeId)) {
						state.selectedNodes.push(nodeId);
					}
				}),

			selectNodes: (nodeIds) =>
				set((state) => {
					state.selectedNodes = [...new Set([...state.selectedNodes, ...nodeIds])];
				}),

			deselectNode: (nodeId) =>
				set((state) => {
					state.selectedNodes = state.selectedNodes.filter((id) => id !== nodeId);
				}),

			clearNodeSelection: () =>
				set((state) => {
					state.selectedNodes = [];
				}),

			selectEdge: (edgeId) =>
				set((state) => {
					if (!state.selectedEdges.includes(edgeId)) {
						state.selectedEdges.push(edgeId);
					}
				}),

			selectEdges: (edgeIds) =>
				set((state) => {
					state.selectedEdges = [...new Set([...state.selectedEdges, ...edgeIds])];
				}),

			deselectEdge: (edgeId) =>
				set((state) => {
					state.selectedEdges = state.selectedEdges.filter((id) => id !== edgeId);
				}),

			clearEdgeSelection: () =>
				set((state) => {
					state.selectedEdges = [];
				}),

			clearAllSelections: () =>
				set((state) => {
					state.selectedNodes = [];
					state.selectedEdges = [];
				}),

			setDragging: (isDragging) =>
				set((state) => {
					state.isDragging = isDragging;
				}),

			setSelecting: (isSelecting) =>
				set((state) => {
					state.isSelecting = isSelecting;
				}),

			setSelectionBox: (box) =>
				set((state) => {
					state.selectionBox = box;
				}),

			setCanvasSize: (width, height) =>
				set((state) => {
					state.canvasWidth = width;
					state.canvasHeight = height;
				}),

			setBackgroundColor: (color) =>
				set((state) => {
					state.backgroundColor = color;
				}),

			resetCanvas: () =>
				set((state) => {
					state.zoom = 1;
					state.panX = 0;
					state.panY = 0;
					state.selectedNodes = [];
					state.selectedEdges = [];
					state.isDragging = false;
					state.isSelecting = false;
					state.selectionBox = null;
					state.backgroundColor = "#f8f9fa";
				}),
		})),
		{
			name: "canvas-store",
		}
	)
);
