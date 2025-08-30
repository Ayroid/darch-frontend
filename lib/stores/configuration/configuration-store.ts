import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Available_AWS_Resource_Configuration } from "@/lib/types/aws-resources";

// Configuration state
interface ConfigurationState {
	// Current node being configured
	selectedNodeId: string | null;

	// Configuration data for each node (nodeId -> config)
	nodeConfigurations: Record<string, Available_AWS_Resource_Configuration>;

	// Temporary/draft state for forms
	draftConfiguration: Available_AWS_Resource_Configuration | null;
}

// Configuration actions
interface ConfigurationActions {
	// Node selection
	setSelectedNode: (nodeId: string | null) => void;

	// Configuration management
	setNodeConfiguration: (
		nodeId: string,
		config: Available_AWS_Resource_Configuration
	) => void;
	getNodeConfiguration: (
		nodeId: string
	) => Available_AWS_Resource_Configuration | undefined;
	updateNodeConfiguration: (
		nodeId: string,
		updates: Partial<Available_AWS_Resource_Configuration>
	) => void;
	deleteNodeConfiguration: (nodeId: string) => void;

	// Draft state for form editing
	setDraftConfiguration: (config: Available_AWS_Resource_Configuration) => void;
	clearDraftConfiguration: () => void;
	commitDraftConfiguration: (nodeId: string) => void;

	// Bulk operations
	clearAllConfigurations: () => void;
	importConfigurations: (
		configurations: Record<string, Available_AWS_Resource_Configuration>
	) => void;
	exportConfigurations: () => Record<
		string,
		Available_AWS_Resource_Configuration
	>;
}

// Create the configuration store
export const useConfigurationStore = create<
	ConfigurationState & ConfigurationActions
>()(
	devtools(
		immer((set, get) => ({
			// Initial state
			selectedNodeId: null,
			nodeConfigurations: {},
			draftConfiguration: null,

			// Actions
			setSelectedNode: (nodeId) =>
				set((state) => {
					state.selectedNodeId = nodeId;
				}),

			setNodeConfiguration: (nodeId, config) =>
				set((state) => {
					state.nodeConfigurations[nodeId] = config;
				}),

			getNodeConfiguration: (nodeId) => {
				return get().nodeConfigurations[nodeId];
			},

			updateNodeConfiguration: (nodeId, updates) =>
				set((state) => {
					if (state.nodeConfigurations[nodeId]) {
						state.nodeConfigurations[nodeId] = {
							...state.nodeConfigurations[nodeId],
							...updates,
						};
					} else {
						state.nodeConfigurations[nodeId] =
							updates as Available_AWS_Resource_Configuration;
					}
				}),

			deleteNodeConfiguration: (nodeId) =>
				set((state) => {
					delete state.nodeConfigurations[nodeId];
				}),

			setDraftConfiguration: (config) =>
				set((state) => {
					state.draftConfiguration = config;
				}),

			clearDraftConfiguration: () =>
				set((state) => {
					state.draftConfiguration = null;
				}),

			commitDraftConfiguration: (nodeId) =>
				set((state) => {
					if (state.draftConfiguration) {
						state.nodeConfigurations[nodeId] = state.draftConfiguration;
						state.draftConfiguration = null;
					}
				}),

			clearAllConfigurations: () =>
				set((state) => {
					state.nodeConfigurations = {};
					state.selectedNodeId = null;
					state.draftConfiguration = null;
				}),

			importConfigurations: (configurations) =>
				set((state) => {
					state.nodeConfigurations = {
						...state.nodeConfigurations,
						...configurations,
					};
				}),

			exportConfigurations: () => {
				return get().nodeConfigurations;
			},
		})),
		{
			name: "configuration-store",
		}
	)
);
