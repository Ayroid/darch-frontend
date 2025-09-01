import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';
import {
	ArchitectureData,
	ArchitectureNode,
	NodeConnection,
	ArchitectureMetadata,
} from '@/lib/types/architecture';
import { 
	AWSResourceConfiguration,
	VPCConfiguration,
	EC2Configuration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
	PrivateSubnetConfiguration,
	PublicSubnetConfiguration,
} from '@/lib/types/aws-resources';
import { getDefaultConfiguration } from '../configuration/default-configurations';
import { filterValidFields } from '../configuration/configuration-utils';

const DEFAULT_FILE_NAME = 'architecture.json';
const AUTO_SAVE_DELAY = 1000; // 1 second debounce for auto-save

// Unified Architecture State
interface ArchitectureState {
	// Core architecture data
	currentData: ArchitectureData | null;
	
	// Node configurations (integrated from configuration store)
	nodeConfigurations: Record<string, AWSResourceConfiguration>;
	
	// UI state
	selectedNodeId: string | null;
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
	
	// Node management
	addNode: (node: Node) => string;
	removeNode: (nodeId: string) => void;
	updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
	updateFromReactFlow: (nodes: Node[], edges: Edge[]) => void;
	
	// Configuration management
	initializeNodeConfiguration: (nodeId: string, serviceId: string) => void;
	updateNodeConfiguration: (
		nodeId: string,
		configuration: Partial<AWSResourceConfiguration>
	) => void;
	getNodeConfiguration: (nodeId: string) => AWSResourceConfiguration | null;
	deleteNodeConfiguration: (nodeId: string) => void;
	setSelectedNode: (nodeId: string | null) => void;
	
	// Connection management
	addConnection: (edge: Edge) => void;
	removeConnection: (connectionId: string) => void;
	
	// Import/Export
	loadFromJSON: (jsonData: ArchitectureData) => { nodes: Node[]; edges: Edge[] };
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
const generateUniqueId = (): string => {
	return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getDefaultConfigurationForService = (serviceType: string): AWSResourceConfiguration => {
	const defaultConfigurations: Record<string, AWSResourceConfiguration> = {
		'aws-vpc': {
			serviceName: 'VPC',
			serviceId: 'aws-vpc',
			resourceType: 'aws-vpc',
			cidrBlock: '10.0.0.0/16',
			region: 'us-east-1',
			enableDnsSupport: true,
			enableDnsHostnames: true,
			tags: 'Environment=Development',
		} as VPCConfiguration,
		'aws-ec2': {
			serviceName: 'EC2',
			serviceId: 'aws-ec2',
			resourceType: 'aws-ec2',
			instanceType: 't3.micro',
			amiId: 'ami-0c55b159cbfafe1d0',
			keyPairName: '',
			availabilityZone: 'us-east-1a',
			subnetId: '',
			securityGroups: [],
			rootVolumeSize: 8,
			rootVolumeType: 'gp3',
			deleteOnTermination: true,
			encrypted: false,
			detailedMonitoring: false,
			terminationProtection: false,
			autoRecovery: true,
			associatePublicIpAddress: false,
			tenancy: 'default',
			tags: {},
		} as EC2Configuration,
		'aws-region': {
			serviceName: 'AWS Region',
			serviceId: 'aws-region',
			resourceType: 'aws-region',
			region: 'us-east-1',
			regionName: 'US East (N. Virginia)',
			description: '',
			isEnabled: true,
			isDefault: true,
			tags: 'Type=Region',
		} as AWSRegionConfiguration,
		'aws-availability-zone': {
			serviceName: 'Availability Zone',
			serviceId: 'aws-availability-zone',
			resourceType: 'aws-availability-zone',
			region: 'us-east-1',
			availabilityZone: 'us-east-1a',
			description: '',
			isEnabled: true,
			isPreferred: false,
			tags: 'Type=AvailabilityZone',
		} as AvailabilityZoneConfiguration,
		'aws-private-subnet': {
			serviceName: 'Private Subnet',
			serviceId: 'aws-private-subnet',
			resourceType: 'aws-private-subnet',
			cidrBlock: '10.0.1.0/24',
			availabilityZone: 'us-east-1a',
			vpcId: '',
			region: 'us-east-1',
			description: '',
			mapPublicIpOnLaunch: false,
			enableNatGateway: false,
			tags: 'Type=Private',
		} as PrivateSubnetConfiguration,
		'aws-public-subnet': {
			serviceName: 'Public Subnet',
			serviceId: 'aws-public-subnet',
			resourceType: 'aws-public-subnet',
			cidrBlock: '10.0.0.0/24',
			availabilityZone: 'us-east-1a',
			vpcId: '',
			region: 'us-east-1',
			description: '',
			mapPublicIpOnLaunch: true,
			tags: 'Type=Public',
		} as PublicSubnetConfiguration,
	};

	return defaultConfigurations[serviceType] || { 
		serviceName: 'Unknown Service',
		serviceId: serviceType,
		resourceType: serviceType 
	} as AWSResourceConfiguration;
};

// Convert ReactFlow nodes to ArchitectureNode format
const convertReactFlowNodeToArchNode = (node: Node, nodeConfig?: AWSResourceConfiguration): ArchitectureNode => {
	const data = node.data as Record<string, unknown>;
	return {
		id: node.id,
		nodeType: node.type as "awsService" | "awsContainer",
		serviceType: (typeof data?.serviceId === 'string' ? data.serviceId : 
					 typeof data?.name === 'string' ? data.name.toLowerCase() : "unknown"),
		name: (typeof data?.name === 'string' ? data.name : "Unnamed Service"),
		icon: (typeof data?.icon === 'string' ? data.icon : ""),
		position: node.position,
		dimensions: node.style ? {
			width: typeof node.style.width === "number" ? node.style.width : 80,
			height: typeof node.style.height === "number" ? node.style.height : 80,
		} : undefined,
		configuration: nodeConfig || {},
		isContainer: Boolean(data?.isContainer),
		parentId: node.parentId,
	};
};

// Convert ReactFlow edges to NodeConnection format
const convertReactFlowEdgeToConnection = (edge: Edge): NodeConnection => {
	return {
		id: edge.id,
		source: edge.source,
		target: edge.target,
		sourceHandle: edge.sourceHandle || undefined,
		targetHandle: edge.targetHandle || undefined,
		type: edge.type || "smoothstep",
	};
};

// Convert ArchitectureNode to ReactFlow node format
const convertArchNodeToReactFlowNode = (archNode: ArchitectureNode): Node => {
	return {
		id: archNode.id,
		type: archNode.nodeType,
		position: archNode.position,
		data: {
			icon: archNode.icon,
			name: archNode.name,
			serviceId: archNode.serviceType,
			isContainer: archNode.isContainer,
			configuration: archNode.configuration,
		},
		style: archNode.dimensions ? {
			width: archNode.dimensions.width,
			height: archNode.dimensions.height,
		} : undefined,
		parentId: archNode.parentId,
	};
};

// Convert NodeConnection to ReactFlow edge format
const convertConnectionToReactFlowEdge = (connection: NodeConnection): Edge => {
	return {
		id: connection.id,
		source: connection.source,
		target: connection.target,
		sourceHandle: connection.sourceHandle,
		targetHandle: connection.targetHandle,
		type: connection.type || "smoothstep",
	};
};

// Create the unified architecture store
export const useArchitectureStore = create<ArchitectureState & ArchitectureActions>()(
	devtools(
		persist(
			immer((set, get) => ({
				// Initial state
				currentData: null,
				nodeConfigurations: {},
				selectedNodeId: null,
				isLoading: false,
				currentFileName: DEFAULT_FILE_NAME,
				hasUnsavedChanges: false,
				autoSaveTimeout: null,

				// Core data management
				createNew: (metadata = {}) => {
					const now = new Date().toISOString();
					const newData: ArchitectureData = {
						metadata: {
							name: metadata.name || "Untitled Architecture",
							description: metadata.description || "",
							version: "1.0.0",
							createdAt: now,
							lastModified: now,
							provider: metadata.provider || "aws",
						},
						nodes: [],
						connections: [],
						variables: {},
						outputs: {},
					};

					set((state) => {
						state.currentData = newData;
						state.nodeConfigurations = {};
						state.selectedNodeId = null;
						state.hasUnsavedChanges = false;
						state.currentFileName = DEFAULT_FILE_NAME;
					});

					return newData;
				},

				clear: () => {
					set((state) => {
						state.currentData = null;
						state.nodeConfigurations = {};
						state.selectedNodeId = null;
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
				addNode: (node) => {
					set((state) => {
						if (!state.currentData) {
							state.currentData = get().createNew();
						}

						// Ensure unique ID
						if (!node.id || state.currentData!.nodes.some((n) => n.id === node.id)) {
							node.id = generateUniqueId();
						}

						// Get service type for configuration
						const data = node.data as Record<string, unknown>;
						const serviceType = (data?.serviceId as string) || "unknown";

						// Check if node already has configuration (e.g., from copy-paste)
						let nodeConfig: AWSResourceConfiguration;
						if (data?.configuration && typeof data.configuration === 'object') {
							// Use existing configuration from copied node
							nodeConfig = data.configuration as AWSResourceConfiguration;
							console.log("Using existing configuration for copied node:", node.id, nodeConfig);
						} else {
							// Initialize with default configuration for new nodes
							nodeConfig = getDefaultConfigurationForService(serviceType);
							console.log("Initializing default configuration for new node:", node.id, nodeConfig);
						}

						// Store configuration in the unified store
						state.nodeConfigurations[node.id] = nodeConfig;

						// Convert and add to architecture data
						const archNode = convertReactFlowNodeToArchNode(node, nodeConfig);
						state.currentData!.nodes.push(archNode);
						state.currentData!.metadata.lastModified = new Date().toISOString();
						state.hasUnsavedChanges = true;
					});

					get().forceSave();
					return node.id;
				},

				removeNode: (nodeId) => {
					set((state) => {
						if (state.currentData) {
							state.currentData.nodes = state.currentData.nodes.filter(
								(node) => node.id !== nodeId
							);
							state.currentData.connections = state.currentData.connections.filter(
								(conn) => conn.source !== nodeId && conn.target !== nodeId
							);
							state.currentData.metadata.lastModified = new Date().toISOString();
							
							// Remove configuration
							delete state.nodeConfigurations[nodeId];
							
							// Clear selection if this node was selected
							if (state.selectedNodeId === nodeId) {
								state.selectedNodeId = null;
							}
							
							state.hasUnsavedChanges = true;
						}
					});

					get().forceSave();
				},

				updateNodePosition: (nodeId, position) => {
					set((state) => {
						if (state.currentData) {
							const node = state.currentData.nodes.find((n) => n.id === nodeId);
							if (node) {
								node.position = position;
								state.currentData.metadata.lastModified = new Date().toISOString();
								state.hasUnsavedChanges = true;
							}
						}
					});
				},

				updateFromReactFlow: (nodes, edges) => {
					set((state) => {
						if (!state.currentData) {
							state.currentData = get().createNew();
						}

						// Convert and update nodes
						state.currentData!.nodes = nodes.map((node) => {
							const config = state.nodeConfigurations[node.id];
							return convertReactFlowNodeToArchNode(node, config);
						});

						// Convert and update connections
						state.currentData!.connections = edges.map((edge) =>
							convertReactFlowEdgeToConnection(edge)
						);

						state.currentData!.metadata.lastModified = new Date().toISOString();
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
				initializeNodeConfiguration: (nodeId, serviceId) => {
					set((state) => {
						if (!state.nodeConfigurations[nodeId]) {
							const defaultConfig = getDefaultConfiguration(serviceId);
							state.nodeConfigurations[nodeId] = {
								...defaultConfig,
								resourceType: serviceId,
							} as AWSResourceConfiguration;

							// Update architecture data
							if (state.currentData) {
								const node = state.currentData.nodes.find((n) => n.id === nodeId);
								if (node) {
									node.configuration = state.nodeConfigurations[nodeId];
									state.currentData.metadata.lastModified = new Date().toISOString();
									state.hasUnsavedChanges = true;
								}
							}
						}
					});
				},

				updateNodeConfiguration: (nodeId, updates) => {
					set((state) => {
						const existingConfig = state.nodeConfigurations[nodeId] || {};
						const resourceType = existingConfig.resourceType || 
							((updates as Record<string, unknown>).resourceType as string);

						if (!resourceType) {
							console.warn(`No resourceType found for node ${nodeId}. Updates will not be filtered.`);
							state.nodeConfigurations[nodeId] = {
								...existingConfig,
								...updates,
							} as AWSResourceConfiguration;
						} else {
							// Filter updates to only include valid fields for this resource type
							const filteredUpdates = filterValidFields(resourceType, updates);
							const updatedConfig = {
								...existingConfig,
								...filteredUpdates,
								resourceType, // Ensure resource type is preserved
							} as AWSResourceConfiguration;

							state.nodeConfigurations[nodeId] = updatedConfig;
						}

						// Update architecture data
						if (state.currentData) {
							const node = state.currentData.nodes.find((n) => n.id === nodeId);
							if (node) {
								node.configuration = state.nodeConfigurations[nodeId];
								state.currentData.metadata.lastModified = new Date().toISOString();
								state.hasUnsavedChanges = true;
							}
						}
					});

					get().forceSave();
				},

				getNodeConfiguration: (nodeId) => {
					const config = get().nodeConfigurations[nodeId];
					return config || null;
				},

				deleteNodeConfiguration: (nodeId) => {
					set((state) => {
						delete state.nodeConfigurations[nodeId];
						
						// Update architecture data
						if (state.currentData) {
							const node = state.currentData.nodes.find((n) => n.id === nodeId);
							if (node) {
								node.configuration = {};
								state.currentData.metadata.lastModified = new Date().toISOString();
								state.hasUnsavedChanges = true;
							}
						}
					});
				},

				setSelectedNode: (nodeId) => {
					set((state) => {
						state.selectedNodeId = nodeId;
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
						state.currentData!.metadata.lastModified = new Date().toISOString();
						state.hasUnsavedChanges = true;
					});

					get().forceSave();
				},

				removeConnection: (connectionId) => {
					set((state) => {
						if (state.currentData) {
							state.currentData.connections = state.currentData.connections.filter(
								(conn) => conn.id !== connectionId
							);
							state.currentData.metadata.lastModified = new Date().toISOString();
							state.hasUnsavedChanges = true;
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
								lastModified: new Date().toISOString(),
							},
						};

						// Import configurations from nodes
						const configs: Record<string, AWSResourceConfiguration> = {};
						jsonData.nodes.forEach((node) => {
							if (node.configuration && typeof node.configuration === 'object') {
								configs[node.id] = node.configuration as AWSResourceConfiguration;
							}
						});
						state.nodeConfigurations = configs;
						state.hasUnsavedChanges = false;
					});

					const currentData = get().currentData!;
					const nodes = currentData.nodes.map((node) => convertArchNodeToReactFlowNode(node));
					const edges = currentData.connections.map((conn) => convertConnectionToReactFlowEdge(conn));

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
					link.download = filename || `${state.currentData.metadata.name.replace(/\s+/g, "_")}.json`;
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

					const nodes = state.currentData.nodes.map((node) => convertArchNodeToReactFlowNode(node));
					const edges = state.currentData.connections.map((conn) => convertConnectionToReactFlowEdge(conn));

					return { nodes, edges };
				},

				forceSave: () => {
					// Auto-save logic (in a real app, this might save to backend)
					console.log('Architecture data auto-saved');
					
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
				name: 'architecture-data',
				// Only persist essential data
				partialize: (state) => ({
					currentData: state.currentData,
					nodeConfigurations: state.nodeConfigurations,
					currentFileName: state.currentFileName,
				}),
			}
		),
		{
			name: 'architecture-store',
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
		addNode: state.addNode,
		removeNode: state.removeNode,
		updateNodeConfiguration: state.updateNodeConfiguration,
		updateNodePosition: state.updateNodePosition,
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

export const useNodeConfiguration = () => {
	return useArchitectureStore((state) => ({
		selectedNodeId: state.selectedNodeId,
		nodeConfigurations: state.nodeConfigurations,
		setSelectedNode: state.setSelectedNode,
		initializeNodeConfiguration: state.initializeNodeConfiguration,
		updateNodeConfiguration: state.updateNodeConfiguration,
		getNodeConfiguration: state.getNodeConfiguration,
		deleteNodeConfiguration: state.deleteNodeConfiguration,
	}));
};
