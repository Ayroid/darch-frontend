/**
 * Auto-Configuration Logic for AWS Resources
 *
 * This module handles automatic field population and validation for AWS resources
 * in the architecture designer based on their relationships with other resources.
 *
 * Key Concepts:
 * -------------
 * 1. Parent-Child Hierarchy: Resources inside containers inherit properties
 *    - Example: VPC inside Region inherits the region value
 *
 * 2. Edge Connections: Resources connected via edges can auto-configure
 *    - Example: Route Table connected to Internet Gateway gets the IGW ID
 *
 * 3. Auto-Populated Fields: Fields that are automatically filled based on context
 *    - Configured via AWS_RESOURCE_FIELD_RULES
 *    - Can have default values as fallbacks
 *
 * 4. Disabled Fields: Auto-populated fields are disabled in the UI
 *    - Users cannot edit them directly
 *    - Values update automatically when relationships change
 *
 * 5. Special Cases:
 *    - Availability Zones: AZ value auto-updates to match region's first AZ
 *    - Route Tables: Some fields prioritize edge connections over hierarchy
 *    - Security Groups: Multiple groups can be collected from hierarchy
 *
 * How It Works:
 * -------------
 * When a node is created, moved, or its parent's configuration changes:
 * 1. autoConfigureNode() runs for the node
 * 2. Each auto-field rule is processed to find source values
 * 3. Values are populated from parents, connected nodes, or defaults
 * 4. autoConfigureAffectedNodes() updates all descendant/connected nodes
 *
 * @module auto-configuration
 */

import { Node, Edge } from "@xyflow/react";
import {
	AWSResourceConfiguration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
} from "./types/aws-resources";
import { buildParentChildMap } from "./parent-child-logic";
import { AWS_REGIONS_WITH_AZS } from "./data/aws_regions";

// Define which fields should be auto-populated and disabled for each resource type
export interface ResourceFieldRules {
	[resourceType: string]: {
		autoFields: {
			[fieldName: string]: {
				sourceParentType: string; // The type of parent container that provides this value
				sourceField: string; // The field in the parent configuration
				defaultValue?: unknown; // Fallback value if parent not found
			};
		};
		disabledFields: string[]; // Fields that should be disabled when auto-populated
	};
}

/**
 * Auto-configuration rules for AWS resources
 *
 * Each resource type can define:
 * - autoFields: Fields that should be automatically populated from parent/connected nodes
 * - disabledFields: Fields that should be disabled in the UI (user cannot edit)
 *
 * Field sources can be:
 * - Parent containers (parent-child hierarchy)
 * - Connected nodes (via edges)
 * - Multiple sources (comma-separated, first match wins)
 */
export const AWS_RESOURCE_FIELD_RULES: ResourceFieldRules = {
	// === Regional Resources ===
	"aws-availability-zone": {
		autoFields: {
			region: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
			// Note: availability_zone field is auto-configured via special logic
			// based on the region value (see autoConfigureNode function)
		},
		disabledFields: ["region"],
	},

	"aws-vpc": {
		autoFields: {
			region: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
		},
		disabledFields: ["region"],
	},

	// === VPC Resources ===
	"aws-security-group": {
		autoFields: {
			vpc_id: {
				sourceParentType: "aws-vpc",
				sourceField: "vpc_id",
			},
		},
		disabledFields: ["vpc_id"],
	},

	"aws-internet-gateway": {
		autoFields: {
			vpc_id: {
				sourceParentType: "aws-vpc",
				sourceField: "vpc_id",
			},
		},
		disabledFields: ["vpc_id"],
	},

	// === Subnet Resources ===
	"aws-subnet": {
		autoFields: {
			region: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
			availability_zone: {
				sourceParentType: "aws-availability-zone",
				sourceField: "availability_zone",
				defaultValue: "us-east-1a",
			},
			vpc_id: {
				sourceParentType: "aws-vpc",
				sourceField: "vpc_id",
				defaultValue: "default-vpc",
			},
		},
		disabledFields: ["region", "availability_zone", "vpc_id"],
	},

	// === Compute Resources ===
	"aws-ec2": {
		autoFields: {
			region: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
			availability_zone: {
				sourceParentType: "aws-availability-zone",
				sourceField: "availability_zone",
				defaultValue: "us-east-1a",
			},
			subnet_id: {
				sourceParentType: "aws-subnet",
				sourceField: "subnet_id",
				defaultValue: "default-subnet",
			},
			security_groups: {
				sourceParentType: "aws-security-group",
				sourceField: "security_group_id",
				defaultValue: [],
			},
		},
		disabledFields: ["region", "availability_zone", "subnet_id"],
		// Note: security_groups is not disabled as it's an array that can have multiple values
	},

	// === Networking Resources ===
	"aws-route-table": {
		autoFields: {
			vpc_id: {
				sourceParentType: "aws-vpc",
				sourceField: "vpc_id",
			},
			internet_gateway_id: {
				sourceParentType: "aws-internet-gateway",
				sourceField: "internet_gateway_id",
			},
			subnet_id: {
				sourceParentType: "aws-subnet",
				sourceField: "subnet_id",
			},
		},
		disabledFields: ["vpc_id", "internet_gateway_id", "subnet_id"],
	},
};

/**
 * Gets the container hierarchy for a node, starting from the most specific (immediate parent)
 * to the most general (root container)
 */
export function getNodeContainerHierarchy(
	nodeId: string,
	nodes: Node[]
): Node[] {
	const nodeMap = new Map(nodes.map((node) => [node.id, node]));
	const hierarchy: Node[] = [];

	let currentNode = nodeMap.get(nodeId);

	while (currentNode?.parentId) {
		const parent = nodeMap.get(currentNode.parentId);
		if (parent) {
			hierarchy.push(parent);
			currentNode = parent;
		} else {
			break;
		}
	}

	return hierarchy;
}

/**
 * Finds a parent container of a specific type in the node's hierarchy
 */
export function findParentOfType(
	nodeId: string,
	targetParentType: string,
	nodes: Node[]
): Node | null {
	const hierarchy = getNodeContainerHierarchy(nodeId, nodes);

	return (
		hierarchy.find((parent) => {
			const serviceId = parent.data?.serviceId as string;
			return serviceId === targetParentType;
		}) || null
	);
}

/**
 * Finds all parent containers of specific types in the node's hierarchy
 */
export function findParentsOfTypes(
	nodeId: string,
	targetParentTypes: string[],
	nodes: Node[]
): Node[] {
	const hierarchy = getNodeContainerHierarchy(nodeId, nodes);

	return hierarchy.filter((parent) => {
		const serviceId = parent.data?.serviceId as string;
		return serviceId && targetParentTypes.includes(serviceId);
	});
}

/**
 * Finds connected nodes via edges for a given node ID and target types
 */
export function findConnectedNodesOfTypes(
	nodeId: string,
	targetNodeTypes: string[],
	nodes: Node[],
	edges: Edge[]
): Node[] {
	console.log(
		`[findConnectedNodesOfTypes] Searching for ${targetNodeTypes.join(
			", "
		)} connected to ${nodeId}`
	);

	const connectedNodes: Node[] = [];

	// Find all edges connected to this node (both incoming and outgoing)
	const connectedEdges = edges.filter(
		(edge) => edge.source === nodeId || edge.target === nodeId
	);

	console.log(
		`[findConnectedNodesOfTypes] Found ${connectedEdges.length} edges connected to ${nodeId}:`,
		connectedEdges.map((e) => ({
			id: e.id,
			source: e.source,
			target: e.target,
		}))
	);

	// Get the connected node IDs (excluding the current node)
	const connectedNodeIds = connectedEdges.map((edge) =>
		edge.source === nodeId ? edge.target : edge.source
	);

	console.log(
		`[findConnectedNodesOfTypes] Connected node IDs:`,
		connectedNodeIds
	);

	// Find the actual nodes and filter by target types
	for (const connectedNodeId of connectedNodeIds) {
		const connectedNode = nodes.find((node) => node.id === connectedNodeId);
		if (connectedNode) {
			const serviceId = connectedNode.data?.serviceId as string;
			console.log(
				`[findConnectedNodesOfTypes] Checking node ${connectedNodeId} with serviceId: ${serviceId}`
			);

			if (serviceId && targetNodeTypes.includes(serviceId)) {
				connectedNodes.push(connectedNode);
				console.log(
					`[findConnectedNodesOfTypes] Added matching node: ${connectedNodeId} (${serviceId})`
				);
			}
		}
	}

	console.log(
		`[findConnectedNodesOfTypes] Final result: ${connectedNodes.length} matching nodes`
	);
	return connectedNodes;
}

/**
 * Gets the configuration value from a parent node
 */
export function getParentConfigurationValue(
	parentNode: Node,
	fieldName: string,
	nodeConfigurations: Record<string, AWSResourceConfiguration>
): unknown {
	const parentConfig = nodeConfigurations[parentNode.id];
	if (!parentConfig) {
		console.log(
			`[getParentConfigurationValue] No config found for parent ${parentNode.id}`
		);
		return undefined;
	}

	console.log(
		`[getParentConfigurationValue] Getting field ${fieldName} from parent ${parentNode.id}`,
		{
			parentConfig,
			serviceId: parentNode.data?.serviceId,
		}
	);

	// Special handling for different field mappings
	// Now we properly check the configuration field first, then fallback to node ID for legacy cases
	switch (fieldName) {
		case "id":
			// Legacy case - return node ID directly
			console.log(
				`[getParentConfigurationValue] Using node ID for legacy 'id' field:`,
				parentNode.id
			);
			return parentNode.id;

		case "region":
			const regionValue = (parentConfig as AWSRegionConfiguration).region;
			console.log(
				`[getParentConfigurationValue] Region field value:`,
				regionValue
			);
			return regionValue;

		case "availability_zone":
			const azValue = (parentConfig as AvailabilityZoneConfiguration)
				.availability_zone;
			console.log(
				`[getParentConfigurationValue] Availability Zone field value:`,
				azValue
			);
			return azValue;

		default:
			// First try to get the value from configuration
			const configValue = (parentConfig as Record<string, unknown>)[fieldName];
			console.log(
				`[getParentConfigurationValue] Looking for field ${fieldName} in config:`,
				{
					configValue,
					configValueType: typeof configValue,
					hasValue:
						configValue !== undefined &&
						configValue !== null &&
						configValue !== "",
				}
			);

			// If config has a valid value that's not a display name, use it
			if (
				configValue !== undefined &&
				configValue !== null &&
				configValue !== ""
			) {
				// Check if this looks like a display name (starts with "AWS " and contains the service type)
				const isDisplayName =
					typeof configValue === "string" &&
					configValue.startsWith("AWS ") &&
					fieldName.toLowerCase().includes("id");

				if (!isDisplayName) {
					console.log(
						`[getParentConfigurationValue] Found valid config field ${fieldName}:`,
						configValue
					);
					return configValue;
				} else {
					console.log(
						`[getParentConfigurationValue] Field ${fieldName} contains display name "${configValue}", using node ID instead:`,
						parentNode.id
					);
					return parentNode.id;
				}
			}

			// Fallback: If this is an ID-like field and config is empty,
			// we might want to use node ID (but only if the field name suggests it's an ID field)
			if (fieldName.toLowerCase().includes("id")) {
				console.log(
					`[getParentConfigurationValue] Field ${fieldName} is empty in config, using node ID as fallback:`,
					parentNode.id
				);
				return parentNode.id;
			}

			// Otherwise return undefined to indicate no value found
			console.log(
				`[getParentConfigurationValue] No value found for field ${fieldName}, returning undefined`
			);
			return undefined;
	}
}

/**
 * Helper: Find a source node (parent or connected) for a field
 */
function findSourceNode(
	nodeId: string,
	parentTypes: string[],
	nodes: Node[],
	edges: Edge[],
	shouldCheckEdgesAlways: boolean
): { node: Node | null; source: "parent" | "edge" } {
	// First try to find a parent
	let sourceNode: Node | null = null;
	for (const parentType of parentTypes) {
		sourceNode = findParentOfType(nodeId, parentType, nodes);
		if (sourceNode) break;
	}

	// Check edges if no parent found or if edges should always be checked
	if ((!sourceNode || shouldCheckEdgesAlways) && edges.length > 0) {
		const connectedNodes = findConnectedNodesOfTypes(
			nodeId,
			parentTypes,
			nodes,
			edges
		);
		if (connectedNodes.length > 0) {
			// For fields that should always check edges, prioritize edge connections
			if (shouldCheckEdgesAlways) {
				return { node: connectedNodes[0], source: "edge" };
			} else if (!sourceNode) {
				return { node: connectedNodes[0], source: "edge" };
			}
		}
	}

	return { node: sourceNode, source: "parent" };
}

/**
 * Helper: Get value from source node trying multiple source fields
 */
function getValueFromSourceNode(
	sourceNode: Node,
	sourceFields: string[],
	nodeConfigurations: Record<string, AWSResourceConfiguration>
): unknown {
	for (const sourceField of sourceFields) {
		const value = getParentConfigurationValue(
			sourceNode,
			sourceField,
			nodeConfigurations
		);
		if (value !== undefined && value !== "") {
			return value;
		}
	}
	return null;
}

/**
 * Helper: Handle security groups array field (special case for EC2)
 */
function handleSecurityGroupsField(
	nodeId: string,
	rule: {
		sourceParentType: string;
		sourceField: string;
		defaultValue?: unknown;
	},
	nodes: Node[],
	nodeConfigurations: Record<string, AWSResourceConfiguration>
): string[] | null {
	const parentTypes = rule.sourceParentType.split(",").map((t) => t.trim());
	const securityGroupParents = findParentsOfTypes(nodeId, parentTypes, nodes);

	if (securityGroupParents.length > 0) {
		const securityGroupIds = securityGroupParents
			.map((parent) =>
				getParentConfigurationValue(
					parent,
					rule.sourceField,
					nodeConfigurations
				)
			)
			.filter((id) => id !== undefined && id !== "") as string[];

		return securityGroupIds.length > 0 ? securityGroupIds : null;
	}
	return null;
}

/**
 * Auto-configures a node based on its container hierarchy and edge connections
 */
export function autoConfigureNode(
	nodeId: string,
	currentConfig: AWSResourceConfiguration,
	nodes: Node[],
	nodeConfigurations: Record<string, AWSResourceConfiguration>,
	resourceType?: string,
	edges: Edge[] = []
): {
	updatedConfig: AWSResourceConfiguration;
	autoPopulatedFields: string[];
} {
	// Get resourceType from parameter or from node data
	let nodeResourceType = resourceType;
	if (!nodeResourceType) {
		const node = nodes.find((n) => n.id === nodeId);
		nodeResourceType = node?.data?.serviceId as string;
	}

	if (!nodeResourceType) {
		console.log(
			`[autoConfigureNode] No resource type found for node ${nodeId}`
		);
		return { updatedConfig: currentConfig, autoPopulatedFields: [] };
	}

	const rules = AWS_RESOURCE_FIELD_RULES[nodeResourceType];
	if (!rules) {
		console.log(
			`[autoConfigureNode] No rules found for resource type ${nodeResourceType}`
		);
		return { updatedConfig: currentConfig, autoPopulatedFields: [] };
	}

	console.log(
		`[autoConfigureNode] Processing node ${nodeId} of type ${nodeResourceType}`,
		{ autoFields: Object.keys(rules.autoFields) }
	);

	const updatedConfig = { ...currentConfig };
	const autoPopulatedFields: string[] = [];

	// Process each auto field rule
	for (const [fieldName, rule] of Object.entries(rules.autoFields)) {
		const parentTypes = rule.sourceParentType.split(",").map((t) => t.trim());
		const sourceFields = rule.sourceField.split(",").map((f) => f.trim());

		// Special case: Handle array fields (like security groups for EC2)
		if (fieldName === "securityGroups" && Array.isArray(rule.defaultValue)) {
			const securityGroupIds = handleSecurityGroupsField(
				nodeId,
				rule,
				nodes,
				nodeConfigurations
			);
			if (securityGroupIds) {
				(updatedConfig as Record<string, unknown>)[fieldName] =
					securityGroupIds;
				autoPopulatedFields.push(fieldName);
				console.log(
					`[autoConfigureNode] Auto-populated ${fieldName}:`,
					securityGroupIds
				);
			}
			continue;
		}

		// Determine if this field should always check edges (Route Table specific logic)
		const shouldCheckEdgesAlways =
			nodeResourceType === "aws-route-table" &&
			(fieldName === "internet_gateway_id" || fieldName === "subnet_id");

		// Find the source node (parent or connected via edge)
		const { node: sourceNode, source } = findSourceNode(
			nodeId,
			parentTypes,
			nodes,
			edges,
			shouldCheckEdgesAlways
		);

		// Try to get value from source node
		let fieldValue: unknown = null;
		if (sourceNode) {
			fieldValue = getValueFromSourceNode(
				sourceNode,
				sourceFields,
				nodeConfigurations
			);
			if (fieldValue !== null) {
				(updatedConfig as Record<string, unknown>)[fieldName] = fieldValue;
				autoPopulatedFields.push(fieldName);
				console.log(
					`[autoConfigureNode] Auto-populated ${fieldName} from ${source}:`,
					fieldValue
				);
				continue;
			}
		}

		// No source found - use default value or clear the field
		if (rule.defaultValue !== undefined) {
			(updatedConfig as Record<string, unknown>)[fieldName] = rule.defaultValue;
			autoPopulatedFields.push(fieldName);
			console.log(
				`[autoConfigureNode] Used default value for ${fieldName}:`,
				rule.defaultValue
			);
		} else {
			// Clear the field if no source found and no default (important for cleanup)
			const currentValue = (currentConfig as Record<string, unknown>)[
				fieldName
			];
			if (currentValue !== undefined && currentValue !== "") {
				(updatedConfig as Record<string, unknown>)[fieldName] = "";
				autoPopulatedFields.push(fieldName);
				console.log(
					`[autoConfigureNode] Cleared ${fieldName} - no source found`
				);
			}
		}
	}

	// Special handling for Availability Zone nodes: auto-configure availability_zone field
	// when region is set or changes
	if (nodeResourceType === "aws-availability-zone") {
		const azConfig = updatedConfig as AvailabilityZoneConfiguration;
		const regionId = azConfig.region;

		// If we have a region ID, auto-configure the availability_zone to the first AZ of that region
		if (regionId) {
			const availableAZs =
				AWS_REGIONS_WITH_AZS[regionId as keyof typeof AWS_REGIONS_WITH_AZS];

			if (availableAZs && availableAZs.length > 0) {
				const firstAZ = availableAZs[0];

				// Only update if the current AZ is not valid for the region or is empty
				const currentAZ = azConfig.availability_zone;
				const isCurrentAZValid = currentAZ && availableAZs.includes(currentAZ);

				if (!isCurrentAZValid) {
					azConfig.availability_zone = firstAZ;
					if (!autoPopulatedFields.includes("availability_zone")) {
						autoPopulatedFields.push("availability_zone");
					}
					console.log(
						`[autoConfigureNode] Auto-configured availability_zone to first AZ of region ${regionId}:`,
						firstAZ
					);
				}
			} else {
				console.log(
					`[autoConfigureNode] No availability zones found for region ${regionId}`
				);
			}
		}
	}

	console.log(`[autoConfigureNode] Final result for ${nodeId}:`, {
		autoPopulatedFields,
		updatedConfig,
	});

	return { updatedConfig, autoPopulatedFields };
}

/**
 * Gets the list of fields that should be disabled for a resource type
 * These fields are always disabled as they are managed automatically
 */
export function getDisabledFields(resourceType: string): string[] {
	const rules = AWS_RESOURCE_FIELD_RULES[resourceType];
	if (!rules) return [];

	// All fields in disabledFields should always be disabled
	return rules.disabledFields;
}

/**
 * Checks if a field should be disabled for a specific node
 * These fields should always be disabled as they are managed automatically based on parent-child relationships
 */
export function isFieldDisabled(
	nodeId: string,
	fieldName: string,
	resourceType: string
): boolean {
	const rules = AWS_RESOURCE_FIELD_RULES[resourceType];
	if (!rules || !rules.disabledFields.includes(fieldName)) {
		return false;
	}

	// These fields should always be disabled - they are managed automatically
	// based on parent-child relationships and should never be user-editable
	return true;
}

/**
 * Auto-configures all nodes that are affected when a container configuration changes
 */
export function autoConfigureAffectedNodes(
	changedNodeId: string,
	nodes: Node[],
	nodeConfigurations: Record<string, AWSResourceConfiguration>,
	edges: Edge[] = []
): {
	nodeId: string;
	updatedConfig: AWSResourceConfiguration;
	autoPopulatedFields: string[];
}[] {
	const { parentToChildren } = buildParentChildMap(nodes);
	const affectedUpdates: {
		nodeId: string;
		updatedConfig: AWSResourceConfiguration;
		autoPopulatedFields: string[];
	}[] = [];

	// Get all descendant nodes (children, grandchildren, etc.)
	const getDescendants = (nodeId: string): string[] => {
		const descendants: string[] = [];
		const children = parentToChildren.get(nodeId) || [];

		for (const childId of children) {
			descendants.push(childId);
			descendants.push(...getDescendants(childId));
		}

		return descendants;
	};

	const descendants = getDescendants(changedNodeId);

	// Also check for edge-connected nodes that might be affected
	const connectedNodes = findConnectedNodesOfTypes(
		changedNodeId,
		Object.keys(AWS_RESOURCE_FIELD_RULES),
		nodes,
		edges
	);
	const allAffectedNodeIds = Array.from(
		new Set([...descendants, ...connectedNodes.map((n) => n.id)])
	);

	// Auto-configure each affected node
	for (const affectedNodeId of allAffectedNodeIds) {
		const config = nodeConfigurations[affectedNodeId];
		if (!config) continue;

		const affectedNode = nodes.find((n) => n.id === affectedNodeId);
		const resourceType = affectedNode?.data?.serviceId as string;
		if (!resourceType) continue;

		const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
			affectedNodeId,
			config,
			nodes,
			nodeConfigurations,
			resourceType,
			edges
		);

		// Only include if there were changes
		if (autoPopulatedFields.length > 0) {
			affectedUpdates.push({
				nodeId: affectedNodeId,
				updatedConfig,
				autoPopulatedFields,
			});
		}
	}

	return affectedUpdates;
}

/**
 * Gets the display information for auto-configured fields
 */
export function getAutoConfigurationInfo(
	nodeId: string,
	resourceType: string,
	nodes: Node[],
	edges: Edge[] = []
): {
	[fieldName: string]: {
		isAutoConfigured: boolean;
		sourceType?: string;
		sourceName?: string;
	};
} {
	const rules = AWS_RESOURCE_FIELD_RULES[resourceType];
	if (!rules) return {};

	const info: {
		[fieldName: string]: {
			isAutoConfigured: boolean;
			sourceType?: string;
			sourceName?: string;
		};
	} = {};

	for (const [fieldName, rule] of Object.entries(rules.autoFields)) {
		const parentTypes = rule.sourceParentType
			.split(",")
			.map((type) => type.trim());

		// First try to find parent
		let sourceNode = findParentOfType(nodeId, parentTypes[0], nodes);

		// If no parent found, try edge-connected nodes
		if (!sourceNode && edges.length > 0) {
			const connectedNodes = findConnectedNodesOfTypes(
				nodeId,
				parentTypes,
				nodes,
				edges
			);
			if (connectedNodes.length > 0) {
				sourceNode = connectedNodes[0];
			}
		}

		info[fieldName] = {
			isAutoConfigured: !!sourceNode,
			sourceType: rule.sourceParentType,
			sourceName: sourceNode?.data?.name as string,
		};
	}

	return info;
}
