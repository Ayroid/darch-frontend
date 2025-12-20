import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { Node, Edge } from "@xyflow/react";
import {
	ArchitectureData,
	ArchitectureResource,
	ResourceConnection,
	ArchitectureMetadata,
} from "@/lib/types/architecture";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";
import { getDefaultConfiguration } from "../configuration/default-configurations";
import {
	autoConfigureNode,
	autoConfigureAffectedNodes,
} from "../../auto-configuration";

const DEFAULT_FILE_NAME = "architecture.json";
const AUTO_SAVE_DELAY = 1000; // 1 second debounce for auto-save

// Unified Architecture State
interface ArchitectureState {
	// Core architecture data
	currentData: ArchitectureData | null;

	// Node configurations (integrated from configuration store)
	resourceConfigurations: Record<string, AWSResourceConfiguration>;

	// UI state
	selectedResourceId: string | null;
	isLoading: boolean;

	// File management
	currentFileName: string;
	hasUnsavedChanges: boolean;

	// Auto-save management
	autoSaveTimeout: NodeJS.Timeout | null;
}

// Architecture Actions
interface ArchitectureActions {
	// Core data management
	createNew: (metadata?: Partial<ArchitectureMetadata>) => ArchitectureData;
	clear: () => void;
	getCurrentData: () => ArchitectureData | null;

	// Resource management
	addResource: (resource: Node) => string;
	removeResource: (resourceId: string) => void;
	updateResourcePosition: (
		resourceId: string,
		position: { x: number; y: number }
	) => void;
	updateFromReactFlow: (resources: Node[], edges: Edge[]) => void;

	// Configuration management
	initializeResourceConfiguration: (resourceId: string, serviceId: string) => void;
	updateResourceConfiguration: (
		resourceId: string,
		configuration: Partial<AWSResourceConfiguration>
	) => void;
	getResourceConfiguration: (resourceId: string) => AWSResourceConfiguration | null;
	deleteResourceConfiguration: (resourceId: string) => void;
	setSelectedResource: (resourceId: string | null) => void;

	// Connection management
	addConnection: (edge: Edge) => void;
	removeConnection: (connectionId: string) => void;

	// Import/Export
	loadFromJSON: (jsonData: ArchitectureData) => {
		nodes: Node[];
		edges: Edge[];
	};
	exportToJSON: () => ArchitectureData | null;
	importFromFile: (file: File) => Promise<{ nodes: Node[]; edges: Edge[] }>;
	exportToFile: (filename?: string) => void;
	saveToFile: (filename?: string) => void;
	loadFromFile: (file: File) => Promise<{ nodes: Node[]; edges: Edge[] }>;

	// Utility methods
	convertToReactFlow: () => { nodes: Node[]; edges: Edge[] };
	forceSave: () => void;
	markUnsavedChanges: () => void;
	markSaved: () => void;
}

// Helper functions
// Note: ID generation is handled by getNodeId() in nodeUtils.tsx

// Convert ReactFlow nodes to ArchitectureResource format
const convertReactFlowNodeToArchResource = (
	node: Node,
	nodeConfig?: AWSResourceConfiguration
): ArchitectureResource => {
	const data = node.data as Record<string, unknown>;
	return {
		id: node.id,
		node_type: (node.type === "awsService" ? "aws_service" : "aws_container") as "aws_service" | "aws_container",
		resource_type:
			typeof data?.serviceId === "string"
				? data.serviceId
				: typeof data?.name === "string"
				? data.name.toLowerCase()
				: "unknown",
		name: typeof data?.name === "string" ? data.name : "Unnamed Service",
		icon: typeof data?.icon === "string" ? data.icon : "",
		position: node.position,
		dimensions: node.style
			? {
					width: typeof node.style.width === "number" ? node.style.width : 80,
					height:
						typeof node.style.height === "number" ? node.style.height : 80,
			  }
			: undefined,
		configuration: nodeConfig || {},
		parent_id: node.parentId,
	};
};

// Convert ReactFlow edges to ResourceConnection format
const convertReactFlowEdgeToConnection = (edge: Edge): ResourceConnection => {
	return {
		id: edge.id,
		source: edge.source,
		target: edge.target,
		source_handle: edge.sourceHandle || undefined,
		target_handle: edge.targetHandle || undefined,
		type: edge.type || "smoothstep",
	};
};

// Convert ArchitectureResource to ReactFlow node format
const convertArchResourceToReactFlowNode = (archResource: ArchitectureResource): Node => {
	return {
		id: archResource.id,
		// Convert from snake_case (JSON format) to camelCase (ReactFlow format)
		type: archResource.node_type === "aws_service" ? "awsService" : "awsContainer",
		position: archResource.position,
		data: {
			icon: archResource.icon,
			name: archResource.name,
			serviceId: archResource.resource_type,
			configuration: archResource.configuration,
		},
		style: archResource.dimensions
			? {
					width: archResource.dimensions.width,
					height: archResource.dimensions.height,
			  }
			: undefined,
		parentId: archResource.parent_id,
	};
};

// Convert ResourceConnection to ReactFlow edge format
const convertConnectionToReactFlowEdge = (connection: ResourceConnection): Edge => {
	return {
		id: connection.id,
		source: connection.source,
		target: connection.target,
		sourceHandle: connection.source_handle,
		targetHandle: connection.target_handle,
		type: connection.type || "smoothstep",
	};
};

// Create the unified architecture store
export const useArchitectureStore = create<
	ArchitectureState & ArchitectureActions
>()(
	devtools(
		persist(
			immer((set, get) => ({
				// Initial state
				currentData: null,
				resourceConfigurations: {},
				selectedResourceId: null,
				isLoading: false,
				currentFileName: DEFAULT_FILE_NAME,
				hasUnsavedChanges: false,
				autoSaveTimeout: null,

				// Core data management
				createNew: (metadata = {}) => {
					const now = new Date().toISOString();
					const newData: ArchitectureData = {					format_version: "2.0.0",						metadata: {
							name: metadata.name || "Untitled Architecture",
							description: metadata.description || "",
							version: "1.0.0",
							created_at: now,
							last_modified: now,
							provider: metadata.provider || "aws",
						},
						resources: [],
						connections: [],
						variables: {},
						outputs: {},
					};

					set((state) => {
						state.currentData = newData;
						state.resourceConfigurations = {};
						state.selectedResourceId = null;
						state.hasUnsavedChanges = false;
						state.currentFileName = DEFAULT_FILE_NAME;
					});

					return newData;
				},

				clear: () => {
					set((state) => {
						state.currentData = null;
						state.resourceConfigurations = {};
						state.selectedResourceId = null;
						state.hasUnsavedChanges = false;
						state.currentFileName = DEFAULT_FILE_NAME;
						if (state.autoSaveTimeout) {
							clearTimeout(state.autoSaveTimeout);
							state.autoSaveTimeout = null;
						}
					});

					// Create new after clearing
					get().createNew();
				},

				getCurrentData: () => {
					return get().currentData;
				},

				// Node management
				addResource: (node) => {
					set((state) => {
						if (!state.currentData) {
							state.currentData = get().createNew();
						}

						// Note: Node ID should be generated before calling addNode
						// ID generation is handled by getNodeId() in nodeUtils.tsx
						if (!node.id) {
							console.warn(
								"Node ID not provided to addNode - this should be generated beforehand"
							);
							return node.id || "";
						}

						// Get resource type for configuration
						const data = node.data as Record<string, unknown>;
						const resourceType = (data?.serviceId as string) || "unknown";

						// Check if node already has configuration (e.g., from copy-paste)
						let nodeConfig: AWSResourceConfiguration;
						if (data?.configuration && typeof data.configuration === "object") {
							// Use existing configuration from copied node
							nodeConfig = data.configuration as AWSResourceConfiguration;
							console.log(
								"Using existing configuration for copied node:",
								node.id,
								nodeConfig
							);
						} else {
							// Initialize with default configuration for new nodes
							nodeConfig = getDefaultConfiguration(resourceType);
							console.log(
								"Initializing default configuration for new node:",
								node.id,
								nodeConfig
							);
						}

						// Store configuration in the unified store
						state.resourceConfigurations[node.id] = nodeConfig;

						// Convert and add to architecture data
						const archResource = convertReactFlowNodeToArchResource(node, nodeConfig);
						state.currentData!.resources.push(archResource);
						state.currentData!.metadata.last_modified = new Date().toISOString();
						state.hasUnsavedChanges = true;

						// Auto-configure using current store state to get all nodes for hierarchy
						const { nodes: allNodes, edges: allEdges } = get().convertToReactFlow();
						const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
							node.id,
							nodeConfig,
							[...allNodes, node], // Include the new node in the hierarchy
							state.resourceConfigurations,
							resourceType,
							allEdges
						);

						// Apply auto-configuration if any fields were populated
						if (autoPopulatedFields.length > 0) {
							state.resourceConfigurations[node.id] = updatedConfig;
							archResource.configuration = updatedConfig;

							console.log(
								`Auto-configured new node ${node.id} with fields:`,
								autoPopulatedFields
							);
						}
					});

					get().forceSave();
					return node.id;
				},

				removeResource: (nodeId) => {
					set((state) => {
						if (state.currentData) {
							state.currentData.resources = state.currentData.resources.filter(
								(node) => node.id !== nodeId
							);
							state.currentData.connections =
								state.currentData.connections.filter(
									(conn) => conn.source !== nodeId && conn.target !== nodeId
								);
							state.currentData.metadata.last_modified =
								new Date().toISOString();

							// Remove configuration
							delete state.resourceConfigurations[nodeId];

							// Clear selection if this node was selected
							if (state.selectedResourceId === nodeId) {
								state.selectedResourceId = null;
							}

							state.hasUnsavedChanges = true;
						}
					});

					get().forceSave();
				},

				updateResourcePosition: (nodeId, position) => {
					set((state) => {
						if (state.currentData) {
							const node = state.currentData.resources.find((n) => n.id === nodeId);
							if (node) {
								node.position = position;
								state.currentData.metadata.last_modified =
									new Date().toISOString();
								state.hasUnsavedChanges = true;
							}
						}
					});

					// Auto-configure affected nodes after position change (parent-child relationships may have changed)
					const { nodes, edges } = get().convertToReactFlow();
					const nodeConfig = get().resourceConfigurations[nodeId];
					if (nodeConfig) {
						const movedNode = nodes.find(n => n.id === nodeId);
						const resourceType = movedNode?.data?.serviceId as string;
						if (resourceType) {
							const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
								nodeId,
								nodeConfig,
								nodes,
								get().resourceConfigurations,
								resourceType,
								edges
							);

							// Apply auto-configuration if any fields were populated
							if (autoPopulatedFields.length > 0) {
								set((state) => {
									state.resourceConfigurations[nodeId] = updatedConfig;
									// Update the corresponding node in architecture data
									if (state.currentData) {
										const archResource = state.currentData.resources.find(n => n.id === nodeId);
										if (archResource) {
											archResource.configuration = updatedConfig;
										}
									}
								});
								console.log(`Auto-configured node ${nodeId} after position change:`, autoPopulatedFields);
							}
						}
					}
				},

				updateFromReactFlow: (nodes, edges) => {
					set((state) => {
						if (!state.currentData) {
							state.currentData = get().createNew();
						}

						// Convert and update nodes
						state.currentData!.resources = nodes.map((node) => {
							const config = state.resourceConfigurations[node.id];
							return convertReactFlowNodeToArchResource(node, config);
						});

						// Convert and update connections
						state.currentData!.connections = edges.map((edge) =>
							convertReactFlowEdgeToConnection(edge)
						);

						state.currentData!.metadata.last_modified = new Date().toISOString();
						state.hasUnsavedChanges = true;
					});

					// Debounced auto-save
					const currentTimeout = get().autoSaveTimeout;
					if (currentTimeout) {
						clearTimeout(currentTimeout);
					}

					const timeout = setTimeout(() => {
						get().forceSave();
					}, AUTO_SAVE_DELAY);

					set((state) => {
						state.autoSaveTimeout = timeout;
					});
				},

				// Configuration management
				initializeResourceConfiguration: (nodeId, serviceId) => {
					set((state) => {
						if (!state.resourceConfigurations[nodeId]) {
							const defaultConfig = getDefaultConfiguration(serviceId);
							state.resourceConfigurations[nodeId] = defaultConfig;

							// Update architecture data
							if (state.currentData) {
								const node = state.currentData.resources.find(
									(n) => n.id === nodeId
								);
								if (node) {
									node.configuration = state.resourceConfigurations[nodeId];
									state.currentData.metadata.last_modified =
										new Date().toISOString();
									state.hasUnsavedChanges = true;
								}
							}
						}
					});
				},

				updateResourceConfiguration: (nodeId, updates) => {
					set((state) => {
						const existingConfig = state.resourceConfigurations[nodeId] || {};

						// Simply merge the updates without filtering since resourceType is no longer in config
						const updatedConfig = {
							...existingConfig,
							...updates,
						} as AWSResourceConfiguration;

						state.resourceConfigurations[nodeId] = updatedConfig;

						// Update architecture data
						if (state.currentData) {
							const node = state.currentData.resources.find((n) => n.id === nodeId);
							if (node) {
								node.configuration = state.resourceConfigurations[nodeId];
								state.currentData.metadata.last_modified =
									new Date().toISOString();
								state.hasUnsavedChanges = true;
							}

							// Auto-configure affected child nodes and edge-connected nodes
							const { nodes, edges } = get().convertToReactFlow();
							const affectedUpdates = autoConfigureAffectedNodes(
								nodeId,
								nodes,
								state.resourceConfigurations,
								edges
							);

							// Apply auto-configuration updates
							for (const {
								nodeId: affectedNodeId,
								updatedConfig,
							} of affectedUpdates) {
								state.resourceConfigurations[affectedNodeId] = updatedConfig;

								// Update the corresponding node in architecture data
								const affectedNode = state.currentData.resources.find(
									(n) => n.id === affectedNodeId
								);
								if (affectedNode) {
									affectedNode.configuration = updatedConfig;
								}
							}

							// Log auto-configuration results
							if (affectedUpdates.length > 0) {
								console.log(
									`Auto-configured ${affectedUpdates.length} nodes after updating ${nodeId}:`,
									affectedUpdates.map((u) => ({
										nodeId: u.nodeId,
										fields: u.autoPopulatedFields,
									}))
								);
							}
						}
					});

					get().forceSave();
				},

				getResourceConfiguration: (nodeId) => {
					const config = get().resourceConfigurations[nodeId];
					return config || null;
				},

				deleteResourceConfiguration: (nodeId) => {
					set((state) => {
						delete state.resourceConfigurations[nodeId];

						// Update architecture data
						if (state.currentData) {
							const node = state.currentData.resources.find((n) => n.id === nodeId);
							if (node) {
								node.configuration = {};
								state.currentData.metadata.last_modified =
									new Date().toISOString();
								state.hasUnsavedChanges = true;
							}
						}
					});
				},

				setSelectedResource: (nodeId) => {
					set((state) => {
						state.selectedResourceId = nodeId;
					});
				},

				// Connection management
				addConnection: (edge) => {
					set((state) => {
						if (!state.currentData) {
							state.currentData = get().createNew();
						}

						const connection = convertReactFlowEdgeToConnection(edge);
						state.currentData!.connections.push(connection);
						state.currentData!.metadata.last_modified = new Date().toISOString();
						state.hasUnsavedChanges = true;

						// Auto-configure nodes affected by the new connection
						const { nodes, edges } = get().convertToReactFlow();
						const updatedEdges = [...edges, edge]; // Include the new edge

						// Check both source and target nodes for auto-configuration
						for (const nodeId of [edge.source, edge.target]) {
							const nodeConfig = state.resourceConfigurations[nodeId];
							if (!nodeConfig) continue;

							const node = nodes.find(n => n.id === nodeId);
							const resourceType = node?.data?.serviceId as string;
							if (!resourceType) continue;

							const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
								nodeId,
								nodeConfig,
								nodes,
								state.resourceConfigurations,
								resourceType,
								updatedEdges
							);

							// Apply auto-configuration if any fields were populated
							if (autoPopulatedFields.length > 0) {
								state.resourceConfigurations[nodeId] = updatedConfig;

								// Update the corresponding node in architecture data
								const archResource = state.currentData.resources.find(n => n.id === nodeId);
								if (archResource) {
									archResource.configuration = updatedConfig;
								}

								console.log(
									`Auto-configured node ${nodeId} after edge connection with fields:`,
									autoPopulatedFields
								);
							}
						}
					});

					get().forceSave();
				},

				removeConnection: (connectionId) => {
					let removedConnection: ResourceConnection | null = null;

					set((state) => {
						if (state.currentData) {
							// Find the connection being removed to get source and target
							removedConnection = state.currentData.connections.find(
								conn => conn.id === connectionId
							) || null;

							state.currentData.connections =
								state.currentData.connections.filter(
									(conn) => conn.id !== connectionId
								);
							state.currentData.metadata.last_modified =
								new Date().toISOString();
							state.hasUnsavedChanges = true;

							// Auto-configure nodes affected by the removed connection
							if (removedConnection) {
								const { nodes, edges } = get().convertToReactFlow();
								console.log(`[removeConnection] Processing removed connection:`, {
									connectionId,
									source: removedConnection.source,
									target: removedConnection.target,
									remainingEdges: edges.length
								});

								// Check both source and target nodes for auto-configuration
								for (const nodeId of [removedConnection.source, removedConnection.target]) {
									const nodeConfig = state.resourceConfigurations[nodeId];
									if (!nodeConfig) continue;

									const node = nodes.find(n => n.id === nodeId);
									const resourceType = node?.data?.serviceId as string;
									if (!resourceType) continue;

									console.log(`[removeConnection] Auto-configuring node ${nodeId} (${resourceType}) after edge removal...`);

									const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
										nodeId,
										nodeConfig,
										nodes,
										state.resourceConfigurations,
										resourceType,
										edges // Use current edges (after removal)
									);

									console.log(`[removeConnection] Auto-config result for ${nodeId}:`, {
										autoPopulatedFields,
										hasChanges: autoPopulatedFields.length > 0
									});

									// Apply auto-configuration if any fields were changed
									if (autoPopulatedFields.length > 0) {
										state.resourceConfigurations[nodeId] = updatedConfig;

										// Update the corresponding node in architecture data
										const archResource = state.currentData.resources.find(n => n.id === nodeId);
										if (archResource) {
											archResource.configuration = updatedConfig;
										}

										console.log(
											`Auto-configured node ${nodeId} after edge removal with fields:`,
											autoPopulatedFields
										);
									} else {
										console.log(`[removeConnection] No auto-config changes needed for ${nodeId}`);
									}
								}
							}
						}
					});

					get().forceSave();
				},

				// Import/Export
				loadFromJSON: (jsonData) => {
					set((state) => {
						state.currentData = {
							...jsonData,
							metadata: {
								...jsonData.metadata,
								last_modified: new Date().toISOString(),
							},
						};

						// Import configurations from resources
						const configs: Record<string, AWSResourceConfiguration> = {};
						jsonData.resources.forEach((resource) => {
							if (
								resource.configuration &&
								typeof resource.configuration === "object"
							) {
								configs[resource.id] =
									resource.configuration as AWSResourceConfiguration;
							}
						});
						state.resourceConfigurations = configs;
						state.hasUnsavedChanges = false;
					});

					const currentData = get().currentData!;
					const nodes = currentData.resources.map((node) =>
						convertArchResourceToReactFlowNode(node)
					);
					const edges = currentData.connections.map((conn) =>
						convertConnectionToReactFlowEdge(conn)
					);

					get().forceSave();
					return { nodes, edges };
				},

				exportToJSON: () => {
					const state = get();
					return state.currentData ? { ...state.currentData } : null;
				},

				importFromFile: async (file) => {
					return new Promise((resolve, reject) => {
						const reader = new FileReader();

						reader.onload = (e) => {
							try {
								const jsonData = JSON.parse(e.target?.result as string);
								const result = get().loadFromJSON(jsonData);

								set((state) => {
									state.currentFileName = file.name;
								});

								resolve(result);
							} catch (error: unknown) {
								reject(
									new Error(
										"Invalid JSON file: " +
											(error instanceof Error ? error.message : "Unknown error")
									)
								);
							}
						};

						reader.onerror = () => reject(new Error("Failed to read file"));
						reader.readAsText(file);
					});
				},

				exportToFile: (filename) => {
					const state = get();
					if (!state.currentData) return;

					const dataStr = JSON.stringify(state.currentData, null, 2);
					const blob = new Blob([dataStr], { type: "application/json" });
					const url = URL.createObjectURL(blob);

					const link = document.createElement("a");
					link.href = url;
					link.download =
						filename ||
						`${state.currentData.metadata.name.replace(/\s+/g, "_")}.json`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

					URL.revokeObjectURL(url);

					set((state) => {
						state.hasUnsavedChanges = false;
					});
				},

				saveToFile: (filename) => {
					get().exportToFile(filename);
				},

				loadFromFile: async (file) => {
					return get().importFromFile(file);
				},

				// Utility methods
				convertToReactFlow: () => {
					const state = get();
					if (!state.currentData) {
						return { nodes: [], edges: [] };
					}

					const nodes = state.currentData.resources.map((node) =>
						convertArchResourceToReactFlowNode(node)
					);
					const edges = state.currentData.connections.map((conn) =>
						convertConnectionToReactFlowEdge(conn)
					);

					return { nodes, edges };
				},

				forceSave: () => {
					// Auto-save logic (in a real app, this might save to backend)
					console.log("Architecture data auto-saved");

					set((state) => {
						if (state.autoSaveTimeout) {
							clearTimeout(state.autoSaveTimeout);
							state.autoSaveTimeout = null;
						}
					});
				},

				markUnsavedChanges: () => {
					set((state) => {
						state.hasUnsavedChanges = true;
					});
				},

				markSaved: () => {
					set((state) => {
						state.hasUnsavedChanges = false;
					});
				},
			})),
			{
				name: "architecture-data",
				// Only persist essential data
				partialize: (state) => ({
					currentData: state.currentData,
					resourceConfigurations: state.resourceConfigurations,
					currentFileName: state.currentFileName,
				}),
			}
		),
		{
			name: "architecture-store",
		}
	)
);

// Convenience hooks for specific state slices
export const useArchitectureData = () => {
	return useArchitectureStore((state) => ({
		currentData: state.currentData,
		isLoading: state.isLoading,
		hasUnsavedChanges: state.hasUnsavedChanges,
		getCurrentData: state.getCurrentData,
		createNew: state.createNew,
		clear: state.clear,
	}));
};

export const useArchitectureActions = () => {
	return useArchitectureStore((state) => ({
		updateFromReactFlow: state.updateFromReactFlow,
		addResource: state.addResource,
		removeResource: state.removeResource,
		updateResourceConfiguration: state.updateResourceConfiguration,
		updateResourcePosition: state.updateResourcePosition,
		addConnection: state.addConnection,
		removeConnection: state.removeConnection,
		loadFromJSON: state.loadFromJSON,
		exportToJSON: state.exportToJSON,
		importFromFile: state.importFromFile,
		exportToFile: state.exportToFile,
		saveToFile: state.saveToFile,
		loadFromFile: state.loadFromFile,
		convertToReactFlow: state.convertToReactFlow,
		forceSave: state.forceSave,
	}));
};

export const useResourceConfiguration = () => {
	return useArchitectureStore((state) => ({
		selectedResourceId: state.selectedResourceId,
		resourceConfigurations: state.resourceConfigurations,
		setSelectedResource: state.setSelectedResource,
		initializeResourceConfiguration: state.initializeResourceConfiguration,
		updateResourceConfiguration: state.updateResourceConfiguration,
		getResourceConfiguration: state.getResourceConfiguration,
		deleteResourceConfiguration: state.deleteResourceConfiguration,
	}));
};
