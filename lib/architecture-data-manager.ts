/**
 * Architecture Data Manager
 * Handles saving, loading, and updating architecture JSON data
 */

import { Node, Edge } from "@xyflow/react";
import {
	ArchitectureData,
	ArchitectureNode,
	NodeConnection,
	ArchitectureMetadata,
} from "./types/architecture";
import { AWSResourceConfiguration } from "./types/aws-resources";

const DEFAULT_FILE_NAME = "architecture.json";
const AUTO_SAVE_DELAY = 1000; // 1 second debounce for auto-save

export class ArchitectureDataManager {
	private currentData: ArchitectureData | null = null;
	private autoSaveTimeout: NodeJS.Timeout | null = null;
	private listeners: Set<(data: ArchitectureData) => void> = new Set();
	private currentFileName: string = DEFAULT_FILE_NAME;

	constructor() {
		this.initializeData();
	}

	/**
	 * Subscribe to data changes
	 */
	subscribe(callback: (data: ArchitectureData) => void): () => void {
		this.listeners.add(callback);
		return () => {
			this.listeners.delete(callback);
		};
	}

	/**
	 * Notify all listeners of data changes
	 */
	private notifyListeners() {
		if (this.currentData) {
			this.listeners.forEach((callback) => callback(this.currentData!));
		}
	}

	/**
	 * Generate unique ID for nodes
	 */
	private generateUniqueId(): string {
		return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Get default configuration for a service type
	 */
	private getDefaultConfigurationForService(serviceType: string): Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>> {
		const defaultConfigurations: Record<string, Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>>> = {
			'aws-vpc': {
				name: 'vpc-main',
				cidrBlock: '10.0.0.0/16',
				region: 'us-east-1',
				enableDnsSupport: true,
				enableDnsHostnames: true,
				tags: {},
			},
			'aws-ec2': {
				name: 'ec2-instance',
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
			},
			'aws-region': {
				name: 'us-east-1',
				displayName: 'US East (N. Virginia)',
				description: '',
			},
			'aws-availability-zone': {
				name: 'us-east-1a',
				region: 'us-east-1',
				state: 'available',
			},
			'aws-private-subnet': {
				name: 'private-subnet',
				cidrBlock: '10.0.1.0/24',
				availabilityZone: 'us-east-1a',
				vpcId: '',
				routeTableId: '',
				tags: {},
			},
			'aws-public-subnet': {
				name: 'public-subnet',
				cidrBlock: '10.0.0.0/24',
				availabilityZone: 'us-east-1a',
				vpcId: '',
				routeTableId: '',
				internetGatewayId: '',
				tags: {},
			},
		};

		return defaultConfigurations[serviceType] || {};
	}

	/**
	 * Initialize data - create new architecture if none exists
	 */
	private initializeData() {
		this.createNew();
	}

	/**
	 * Create a new architecture
	 */
	createNew(metadata: Partial<ArchitectureMetadata> = {}): ArchitectureData {
		const now = new Date().toISOString();

		this.currentData = {
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

		this.autoSave();
		this.notifyListeners();
		return this.currentData;
	}

	/**
	 * Save architecture data to file (manual export)
	 */
	saveToFile(filename?: string) {
		if (this.currentData) {
			try {
				const dataStr = JSON.stringify(this.currentData, null, 2);
				const blob = new Blob([dataStr], { type: 'application/json' });
				const url = URL.createObjectURL(blob);

				// Create a temporary link to download the file
				const link = document.createElement('a');
				link.href = url;
				link.download = filename || this.currentFileName;
				link.style.display = 'none';

				// Trigger the download
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				URL.revokeObjectURL(url);

				console.log('Architecture data saved to file:', filename || this.currentFileName);
			} catch (error) {
				console.error("Failed to save architecture data to file:", error);
			}
		}
	}

	/**
	 * Auto-save data (internal persistence)
	 */
	private autoSave() {
		// For now, we'll just log the save - in a real app, you might save to a backend
		// or use a more sophisticated local storage solution
		console.log('Architecture data auto-saved');
	}

	/**
	 * Load architecture data from file
	 */
	async loadFromFile(file: File): Promise<void> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const jsonData = JSON.parse(e.target?.result as string);
					this.currentData = jsonData;
					this.currentFileName = file.name;
					this.notifyListeners();
					resolve();
				} catch (error) {
					reject(new Error('Invalid JSON file: ' + (error instanceof Error ? error.message : 'Unknown error')));
				}
			};

			reader.onerror = () => reject(new Error('Failed to read file'));
			reader.readAsText(file);
		});
	}

	/**
	 * Get current architecture data
	 */
	getCurrentData(): ArchitectureData | null {
		return this.currentData;
	}

	/**
	 * Convert ReactFlow nodes to ArchitectureNode format
	 */
	private convertReactFlowNodeToArchNode(node: Node): ArchitectureNode {
		const data = node.data as Record<string, unknown>;
		return {
			id: node.id,
			type: node.type as "awsService" | "awsContainer",
			serviceType:
				(typeof data?.serviceId === 'string' ? data.serviceId :
				 typeof data?.name === 'string' ? data.name.toLowerCase() : "unknown"),
			name: (typeof data?.name === 'string' ? data.name : "Unnamed Service"),
			icon: (typeof data?.icon === 'string' ? data.icon : ""),
			position: node.position,
			dimensions: node.style
				? {
						width: typeof node.style.width === "number" ? node.style.width : 80,
						height:
							typeof node.style.height === "number" ? node.style.height : 80,
				  }
				: undefined,
			configuration: (data?.configuration && typeof data.configuration === 'object') ? data.configuration as Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>> : {},
			isContainer: Boolean(data?.isContainer),
			parentId: node.parentId,
		};
	}

	/**
	 * Convert ReactFlow edges to NodeConnection format
	 */
	private convertReactFlowEdgeToConnection(edge: Edge): NodeConnection {
		return {
			id: edge.id,
			source: edge.source,
			target: edge.target,
			sourceHandle: edge.sourceHandle || undefined,
			targetHandle: edge.targetHandle || undefined,
			type: edge.type || "smoothstep",
		};
	}

	/**
	 * Convert ArchitectureNode to ReactFlow node format
	 */
	convertArchNodeToReactFlowNode(archNode: ArchitectureNode): Node {
		return {
			id: archNode.id,
			type: archNode.type,
			position: archNode.position,
			data: {
				icon: archNode.icon,
				name: archNode.name,
				serviceId: archNode.serviceType,
				isContainer: archNode.isContainer,
				configuration: archNode.configuration,
			},
			style: archNode.dimensions
				? {
						width: archNode.dimensions.width,
						height: archNode.dimensions.height,
				  }
				: undefined,
			parentId: archNode.parentId,
		};
	}

	/**
	 * Convert NodeConnection to ReactFlow edge format
	 */
	convertConnectionToReactFlowEdge(connection: NodeConnection): Edge {
		return {
			id: connection.id,
			source: connection.source,
			target: connection.target,
			sourceHandle: connection.sourceHandle,
			targetHandle: connection.targetHandle,
			type: connection.type || "smoothstep",
		};
	}

	/**
	 * Update architecture with current ReactFlow state
	 */
	updateFromReactFlow(nodes: Node[], edges: Edge[]) {
		if (!this.currentData) {
			this.createNew();
		}

		if (this.currentData) {
			this.currentData.nodes = nodes.map((node) =>
				this.convertReactFlowNodeToArchNode(node)
			);
			this.currentData.connections = edges.map((edge) =>
				this.convertReactFlowEdgeToConnection(edge)
			);
			this.currentData.metadata.lastModified = new Date().toISOString();

			// Debounced auto-save
			if (this.autoSaveTimeout) {
				clearTimeout(this.autoSaveTimeout);
			}

			this.autoSaveTimeout = setTimeout(() => {
				this.autoSave();
				this.notifyListeners();
			}, AUTO_SAVE_DELAY);
		}
	}

	/**
	 * Add a new node
	 */
	addNode(node: Node): string {
		if (!this.currentData) {
			this.createNew();
		}

		// Ensure unique ID
		if (!node.id || this.currentData!.nodes.some((n) => n.id === node.id)) {
			node.id = this.generateUniqueId();
		}

		// Get service type for default configuration
		const data = node.data as Record<string, unknown>;
		const serviceType = (data?.serviceId as string) || "unknown";

		// Set default configuration if none exists
		if (!data?.configuration) {
			const defaultConfig = this.getDefaultConfigurationForService(serviceType);
			node.data = {
				...node.data,
				configuration: defaultConfig
			};
		}

		const archNode = this.convertReactFlowNodeToArchNode(node);
		this.currentData!.nodes.push(archNode);
		this.currentData!.metadata.lastModified = new Date().toISOString();

		this.autoSave();
		this.notifyListeners();

		return node.id;
	}

	/**
	 * Remove a node
	 */
	removeNode(nodeId: string) {
		if (this.currentData) {
			this.currentData.nodes = this.currentData.nodes.filter(
				(node) => node.id !== nodeId
			);
			this.currentData.connections = this.currentData.connections.filter(
				(conn) => conn.source !== nodeId && conn.target !== nodeId
			);
			this.currentData.metadata.lastModified = new Date().toISOString();

			this.autoSave();
			this.notifyListeners();
		}
	}

	/**
	 * Update node configuration
	 */
	updateNodeConfiguration(
		nodeId: string,
		configuration: Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>>
	) {
		if (this.currentData) {
			const node = this.currentData.nodes.find((n) => n.id === nodeId);
			if (node) {
				node.configuration = { ...node.configuration, ...configuration };
				this.currentData.metadata.lastModified = new Date().toISOString();

				this.autoSave();
				this.notifyListeners();
			}
		}
	}

	/**
	 * Get node configuration by node ID
	 */
	getNodeConfiguration(nodeId: string): AWSResourceConfiguration | null {
		if (this.currentData) {
			const node = this.currentData.nodes.find((n) => n.id === nodeId);
			return node ? node.configuration : null;
		}
		return null;
	}

	/**
	 * Force save current data (for manual save button)
	 */
	forceSave() {
		if (this.autoSaveTimeout) {
			clearTimeout(this.autoSaveTimeout);
		}
		this.autoSave();
		this.notifyListeners();
	}

	/**
	 * Update node position
	 */
	updateNodePosition(nodeId: string, position: { x: number; y: number }) {
		if (this.currentData) {
			const node = this.currentData.nodes.find((n) => n.id === nodeId);
			if (node) {
				node.position = position;
				this.currentData.metadata.lastModified = new Date().toISOString();

				this.autoSave();
				this.notifyListeners();
			}
		}
	}

	/**
	 * Add a connection
	 */
	addConnection(edge: Edge) {
		if (!this.currentData) {
			this.createNew();
		}

		const connection = this.convertReactFlowEdgeToConnection(edge);
		this.currentData!.connections.push(connection);
		this.currentData!.metadata.lastModified = new Date().toISOString();

		this.autoSave();
		this.notifyListeners();
	}

	/**
	 * Remove a connection
	 */
	removeConnection(connectionId: string) {
		if (this.currentData) {
			this.currentData.connections = this.currentData.connections.filter(
				(conn) => conn.id !== connectionId
			);
			this.currentData.metadata.lastModified = new Date().toISOString();

			this.autoSave();
			this.notifyListeners();
		}
	}

	/**
	 * Load architecture from JSON
	 */
	loadFromJSON(jsonData: ArchitectureData): { nodes: Node[]; edges: Edge[] } {
		this.currentData = {
			...jsonData,
			metadata: {
				...jsonData.metadata,
				lastModified: new Date().toISOString(),
			},
		};

		const nodes = this.currentData.nodes.map((node) =>
			this.convertArchNodeToReactFlowNode(node)
		);
		const edges = this.currentData.connections.map((conn) =>
			this.convertConnectionToReactFlowEdge(conn)
		);

		this.autoSave();
		this.notifyListeners();

		return { nodes, edges };
	}

	/**
	 * Export current architecture as JSON
	 */
	exportToJSON(): ArchitectureData | null {
		return this.currentData ? { ...this.currentData } : null;
	}

	/**
	 * Import from file
	 */
	async importFromFile(file: File): Promise<{ nodes: Node[]; edges: Edge[] }> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const jsonData = JSON.parse(e.target?.result as string);
					const result = this.loadFromJSON(jsonData);
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
	}

	/**
	 * Export to file
	 */
	exportToFile(filename?: string) {
		if (!this.currentData) return;

		const dataStr = JSON.stringify(this.currentData, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download =
			filename || `${this.currentData.metadata.name.replace(/\s+/g, "_")}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}

	/**
	 * Clear all data
	 */
	clear() {
		this.currentData = null;
		this.currentFileName = DEFAULT_FILE_NAME;
		this.createNew();
	}
}

// Singleton instance
export const architectureDataManager = new ArchitectureDataManager();
