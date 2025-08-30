import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// UI state for sidebars and panels
interface UIState {
	// Sidebar state
	isSidebarOpen: boolean;
	isConfigurationSidebarVisible: boolean;

	// Canvas state
	isCanvasLocked: boolean;
	showGrid: boolean;
	snapToGrid: boolean;
	gridSize: number;

	// Panel visibility
	showServicesSidebar: boolean;
	showPropertiesPanel: boolean;
}

// UI actions
interface UIActions {
	// Sidebar actions
	openSidebar: () => void;
	closeSidebar: () => void;
	toggleConfigurationSidebar: () => void;
	setConfigurationSidebarVisible: (visible: boolean) => void;

	// Canvas actions
	setCanvasLocked: (locked: boolean) => void;
	toggleGrid: () => void;
	setSnapToGrid: (snap: boolean) => void;
	setGridSize: (size: number) => void;

	// Panel actions
	setServicesSidebarVisible: (visible: boolean) => void;
	setPropertiesPanelVisible: (visible: boolean) => void;

	// Reset UI state
	resetUIState: () => void;
}

// Create the UI store
export const useUIStore = create<UIState & UIActions>()(
	devtools(
		immer((set) => ({
			// Initial state
			isSidebarOpen: false,
			isConfigurationSidebarVisible: false,
			isCanvasLocked: false,
			showGrid: true,
			snapToGrid: true,
			gridSize: 20,
			showServicesSidebar: true,
			showPropertiesPanel: true,

			// Actions
			openSidebar: () =>
				set((state) => {
					state.isSidebarOpen = true;
				}),

			closeSidebar: () =>
				set((state) => {
					state.isSidebarOpen = false;
				}),

			toggleConfigurationSidebar: () =>
				set((state) => {
					state.isConfigurationSidebarVisible =
						!state.isConfigurationSidebarVisible;
				}),

			setConfigurationSidebarVisible: (visible) =>
				set((state) => {
					state.isConfigurationSidebarVisible = visible;
				}),

			setCanvasLocked: (locked) =>
				set((state) => {
					state.isCanvasLocked = locked;
				}),

			toggleGrid: () =>
				set((state) => {
					state.showGrid = !state.showGrid;
				}),

			setSnapToGrid: (snap) =>
				set((state) => {
					state.snapToGrid = snap;
				}),

			setGridSize: (size) =>
				set((state) => {
					state.gridSize = size;
				}),

			setServicesSidebarVisible: (visible) =>
				set((state) => {
					state.showServicesSidebar = visible;
				}),

			setPropertiesPanelVisible: (visible) =>
				set((state) => {
					state.showPropertiesPanel = visible;
				}),

			resetUIState: () =>
				set((state) => {
					state.isSidebarOpen = false;
					state.isConfigurationSidebarVisible = false;
					state.isCanvasLocked = false;
					state.showGrid = true;
					state.snapToGrid = true;
					state.gridSize = 20;
					state.showServicesSidebar = true;
					state.showPropertiesPanel = true;
				}),
		})),
		{
			name: "ui-store",
		}
	)
);
