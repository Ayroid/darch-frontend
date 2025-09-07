import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

// Enable MapSet plugin for Immer to support Set and Map data structures
enableMapSet();

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

	// Modal states
	isHelpOpen: boolean;
	isSettingsOpen: boolean;

	// Dropdown states
	showProjectDropdown: boolean;

	// Services sidebar state
	expandedCategories: Set<string>;
}

// UI actions
interface UIActions {
	// Sidebar actions
	toggleSidebar: () => void;
	toggleConfigurationSidebar: () => void;
	setConfigurationSidebarVisible: (visible: boolean) => void;

	// Canvas actions
	setCanvasLocked: (locked: boolean) => void;
	toggleGrid: () => void;
	setSnapToGrid: (snap: boolean) => void;
	setGridSize: (size: number) => void;

	// Modal actions
	setHelpOpen: (open: boolean) => void;
	setSettingsOpen: (open: boolean) => void;
	toggleHelp: () => void;
	toggleSettings: () => void;

	// Dropdown actions
	setProjectDropdownVisible: (visible: boolean) => void;
	toggleProjectDropdown: () => void;

	// Services sidebar actions
	setExpandedCategories: (categories: Set<string>) => void;
	toggleCategory: (category: string) => void;

	// Reset UI state
	resetUIState: () => void;
}

// Create the UI store
export const useUIStore = create<UIState & UIActions>()(
	devtools(
		immer((set) => ({
			// Initial state
			isSidebarOpen: true, // Match ArchitectureDesigner's initial state
			isConfigurationSidebarVisible: false,
			isCanvasLocked: false,
			showGrid: true,
			snapToGrid: true,
			gridSize: 20,
			showServicesSidebar: true,
			showPropertiesPanel: true,
			isHelpOpen: false,
			isSettingsOpen: false,
			showProjectDropdown: false,
			expandedCategories: new Set([
				"Infrastructure",
				"Compute",
				"Network",
				"Storage",
				"Database",
			]),

			// Actions
			toggleSidebar: () =>
				set((state) => {
					state.isSidebarOpen = !state.isSidebarOpen;
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

			// Modal actions
			setHelpOpen: (open) =>
				set((state) => {
					state.isHelpOpen = open;
				}),

			setSettingsOpen: (open) =>
				set((state) => {
					state.isSettingsOpen = open;
				}),

			toggleHelp: () =>
				set((state) => {
					state.isHelpOpen = !state.isHelpOpen;
				}),

			toggleSettings: () =>
				set((state) => {
					state.isSettingsOpen = !state.isSettingsOpen;
				}),

			// Dropdown actions
			setProjectDropdownVisible: (visible) =>
				set((state) => {
					state.showProjectDropdown = visible;
				}),

			toggleProjectDropdown: () =>
				set((state) => {
					state.showProjectDropdown = !state.showProjectDropdown;
				}),

			// Services sidebar actions
			setExpandedCategories: (categories) =>
				set((state) => {
					state.expandedCategories = categories;
				}),

			toggleCategory: (category) =>
				set((state) => {
					const newExpanded = new Set(state.expandedCategories);
					if (newExpanded.has(category)) {
						newExpanded.delete(category);
					} else {
						newExpanded.add(category);
					}
					state.expandedCategories = newExpanded;
				}),

			resetUIState: () =>
				set((state) => {
					state.isSidebarOpen = true; // Match default initial state
					state.isConfigurationSidebarVisible = false;
					state.isCanvasLocked = false;
					state.showGrid = true;
					state.snapToGrid = true;
					state.gridSize = 20;
					state.isHelpOpen = false;
					state.isSettingsOpen = false;
					state.showProjectDropdown = false;
					state.expandedCategories = new Set([
						"Infrastructure",
						"Compute",
						"Network",
						"Storage",
						"Database",
					]);
				}),
		})),
		{
			name: "ui-store",
		}
	)
);
