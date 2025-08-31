import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";
import { getDefaultConfiguration } from "./default-configurations";
import { filterValidFields } from "./configuration-utils";

// Configuration state
interface ConfigurationState {
	// Current node being configured
	selectedNodeId: string | null;

	// Configuration data for each node (nodeId -> config)
	nodeConfigurations: Record<string, AWSResourceConfiguration>;

	// Temporary/draft state for forms
	draftConfiguration: AWSResourceConfiguration | null;
}

// Configuration actions
interface ConfigurationActions {
	// Node selection
	setSelectedNode: (nodeId: string | null) => void;

	// Configuration management
	initializeNodeConfiguration: (
		nodeId: string,
		serviceId: string
	) => void;
	setNodeConfiguration: (
		nodeId: string,
		config: AWSResourceConfiguration
	) => void;
	getNodeConfiguration: (
		nodeId: string
	) => AWSResourceConfiguration | undefined;
	updateNodeConfiguration: (
		nodeId: string,
		updates: Partial<AWSResourceConfiguration>
	) => void;
	deleteNodeConfiguration: (nodeId: string) => void;

	// Draft state for form editing
	setDraftConfiguration: (config: AWSResourceConfiguration) => void;
	clearDraftConfiguration: () => void;
	commitDraftConfiguration: (nodeId: string) => void;

	// Bulk operations
	clearAllConfigurations: () => void;
	importConfigurations: (
		configurations: Record<string, AWSResourceConfiguration>
	) => void;
	exportConfigurations: () => Record<
		string,
		AWSResourceConfiguration
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

			initializeNodeConfiguration: (nodeId, serviceId) =>
				set((state) => {
					console.log("[initializeNodeConfiguration]", { nodeId, serviceId });
					// Only initialize if the node doesn't already have a configuration
					if (!state.nodeConfigurations[nodeId]) {
						const defaultConfig = getDefaultConfiguration(serviceId);
						state.nodeConfigurations[nodeId] = {
							...defaultConfig,
							resourceType: serviceId,
						} as AWSResourceConfiguration;
					}
				}),

			setNodeConfiguration: (nodeId, config) =>
				set((state) => {
					console.log("[setNodeConfiguration]", { nodeId, config });
					state.nodeConfigurations[nodeId] = config;
				}),

			getNodeConfiguration: (nodeId) => {
				const config = get().nodeConfigurations[nodeId];
				console.log("[getNodeConfiguration]", { nodeId, config });
				return config;
			},

	updateNodeConfiguration: (nodeId, updates) =>
		set((state) => {
			console.log("[updateNodeConfiguration]", { nodeId, updates });
			const existingConfig = state.nodeConfigurations[nodeId] || {};

			// Get the resource type from existing config or updates
			const resourceType = existingConfig.resourceType ||
							   (updates as Record<string, unknown>).resourceType as string;

			if (!resourceType) {
				console.warn(`No resourceType found for node ${nodeId}. Updates will not be filtered.`);
				state.nodeConfigurations[nodeId] = {
					...existingConfig,
					...updates,
				} as AWSResourceConfiguration;
				return;
			}

			// Filter updates to only include valid fields for this resource type
			const filteredUpdates = filterValidFields(resourceType, updates);

			const updatedConfig = {
				...existingConfig,
				...filteredUpdates,
				resourceType, // Ensure resource type is preserved
			} as AWSResourceConfiguration;

			state.nodeConfigurations[nodeId] = updatedConfig;
		}),			deleteNodeConfiguration: (nodeId) =>
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
