/**
 * Auto-Configuration Logic for AWS Resources
 * Handles automatic field population and field disabling based on container relationships and edge connections
 */

import { Node, Edge } from "@xyflow/react";
import {
	AWSResourceConfiguration,
	AWSRegionConfiguration,
	AvailabilityZoneConfiguration,
} from "@/lib/types/aws-resources";
import { buildParentChildMap } from "./parent-child-logic";

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

// Define the auto-configuration rules for AWS resources
export const AWS_RESOURCE_FIELD_RULES: ResourceFieldRules = {
	"aws-availability-zone": {
		autoFields: {
			awsRegionId: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
		},
		disabledFields: ["awsRegionId"],
	},
	"aws-vpc": {
		autoFields: {
			awsRegionId: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
		},
		disabledFields: ["awsRegionId"],
	},
	"aws-private-subnet": {
		autoFields: {
			awsRegionId: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
			awsAvailabilityZone: {
				sourceParentType: "aws-availability-zone",
				sourceField: "availabilityZone",
				defaultValue: "us-east-1a",
			},
			awsVpcId: {
				sourceParentType: "aws-vpc",
				sourceField: "awsVpcId",
				defaultValue: "default-vpc",
			},
		},
		disabledFields: ["awsRegionId", "awsAvailabilityZone", "awsVpcId"],
	},
	"aws-public-subnet": {
		autoFields: {
			awsRegionId: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
			awsAvailabilityZone: {
				sourceParentType: "aws-availability-zone",
				sourceField: "availabilityZone",
				defaultValue: "us-east-1a",
			},
			awsVpcId: {
				sourceParentType: "aws-vpc",
				sourceField: "awsVpcId",
				defaultValue: "default-vpc",
			},
		},
		disabledFields: ["awsRegionId", "awsAvailabilityZone", "awsVpcId"],
	},
	"aws-security-group": {
		autoFields: {
			awsVpcId: {
				sourceParentType: "aws-vpc",
				sourceField: "awsVpcId",
				// No default value - only set when actually inside a VPC
			},
		},
		disabledFields: ["awsVpcId"],
	},
	"aws-ec2": {
		autoFields: {
			awsRegionId: {
				sourceParentType: "aws-region",
				sourceField: "region",
				defaultValue: "us-east-1",
			},
			awsAvailabilityZone: {
				sourceParentType: "aws-availability-zone",
				sourceField: "availabilityZone",
				defaultValue: "us-east-1a",
			},
			subnetId: {
				sourceParentType: "aws-private-subnet,aws-public-subnet",
				sourceField: "awsPrivateSubnetId,awsPublicSubnetId",
				defaultValue: "default-subnet",
			},
			securityGroups: {
				sourceParentType: "aws-security-group",
				sourceField: "awsSecurityGroupId",
				defaultValue: [],
			},
		},
		disabledFields: ["awsRegionId", "awsAvailabilityZone", "subnetId"],
		// Note: securityGroups is not disabled as it's an array and user might want to add multiple
	},
	"aws-internet-gateway": {
		autoFields: {
			awsVpcId: {
				sourceParentType: "aws-vpc",
				sourceField: "awsVpcId",
				// No default value - only set when actually connected to a VPC
			},
		},
		disabledFields: ["awsVpcId"],
	},
	"aws-route-table": {
		autoFields: {
			awsVpcId: {
				sourceParentType: "aws-vpc",
				sourceField: "awsVpcId",
				// No default value - only set when actually inside a VPC or connected via edge
			},
			awsInternetGatewayId: {
				sourceParentType: "aws-internet-gateway",
				sourceField: "awsInternetGatewayId",
				// No default value - only set when actually connected to an IGW
			},
			awsSubnetId: {
				sourceParentType: "aws-private-subnet,aws-public-subnet",
				sourceField: "awsPrivateSubnetId,awsPublicSubnetId",
				// No default value - only set when actually connected to a subnet
			},
		},
		disabledFields: ["awsVpcId", "awsInternetGatewayId", "awsSubnetId"],
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
	console.log(`[findConnectedNodesOfTypes] Searching for ${targetNodeTypes.join(', ')} connected to ${nodeId}`);

	const connectedNodes: Node[] = [];

	// Find all edges connected to this node (both incoming and outgoing)
	const connectedEdges = edges.filter(
		(edge) => edge.source === nodeId || edge.target === nodeId
	);

	console.log(`[findConnectedNodesOfTypes] Found ${connectedEdges.length} edges connected to ${nodeId}:`,
		connectedEdges.map(e => ({ id: e.id, source: e.source, target: e.target })));

	// Get the connected node IDs (excluding the current node)
	const connectedNodeIds = connectedEdges.map((edge) =>
		edge.source === nodeId ? edge.target : edge.source
	);

	console.log(`[findConnectedNodesOfTypes] Connected node IDs:`, connectedNodeIds);

	// Find the actual nodes and filter by target types
	for (const connectedNodeId of connectedNodeIds) {
		const connectedNode = nodes.find((node) => node.id === connectedNodeId);
		if (connectedNode) {
			const serviceId = connectedNode.data?.serviceId as string;
			console.log(`[findConnectedNodesOfTypes] Checking node ${connectedNodeId} with serviceId: ${serviceId}`);

			if (serviceId && targetNodeTypes.includes(serviceId)) {
				connectedNodes.push(connectedNode);
				console.log(`[findConnectedNodesOfTypes] Added matching node: ${connectedNodeId} (${serviceId})`);
			}
		}
	}

	console.log(`[findConnectedNodesOfTypes] Final result: ${connectedNodes.length} matching nodes`);
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

		case "availabilityZone":
			const azValue = (parentConfig as AvailabilityZoneConfiguration)
				.availabilityZone;
			console.log(
				`[getParentConfigurationValue] AvailabilityZone field value:`,
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
					hasValue: configValue !== undefined && configValue !== null && configValue !== "",
				}
			);

			// If config has a valid value that's not a display name, use it
			if (configValue !== undefined && configValue !== null && configValue !== "") {
				// Check if this looks like a display name (starts with "AWS " and contains the service type)
				const isDisplayName = typeof configValue === "string" && 
					configValue.startsWith("AWS ") && 
					fieldName.toLowerCase().includes('id');
				
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
			if (fieldName.toLowerCase().includes('id')) {
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
		`[autoConfigureNode] === DEBUG: Processing node ${nodeId} of type ${nodeResourceType} ===`,
		{
			currentConfig,
			autoFields: Object.keys(rules.autoFields)
		}
	);

	const updatedConfig = { ...currentConfig };
	const autoPopulatedFields: string[] = [];

	// Process each auto field rule
	for (const [fieldName, rule] of Object.entries(rules.autoFields)) {
		console.log(`[autoConfigureNode] Processing field ${fieldName}`, { rule });

		const parentTypes = rule.sourceParentType
			.split(",")
			.map((type) => type.trim());

		// Handle array fields (like security groups)
		if (fieldName === "securityGroups" && Array.isArray(rule.defaultValue)) {
			const securityGroupParents = findParentsOfTypes(
				nodeId,
				parentTypes,
				nodes
			);
			if (securityGroupParents.length > 0) {
				const securityGroupIds = securityGroupParents
					.map((parent) =>
						getParentConfigurationValue(
							parent,
							rule.sourceField,
							nodeConfigurations
						)
					)
					.filter((id) => id !== undefined && id !== "");

				if (securityGroupIds.length > 0) {
					(updatedConfig as Record<string, unknown>)[fieldName] =
						securityGroupIds;
					autoPopulatedFields.push(fieldName);
					console.log(
						`[autoConfigureNode] Auto-populated ${fieldName} with security groups:`,
						securityGroupIds
					);
				}
			}
			continue;
		}

		// Handle multiple possible parent types (like subnets for EC2) and source fields
		if (parentTypes.length > 1) {
			let foundValue = false;
			let foundNode = null;
			let source = "parent";

			// Parse source fields - could be comma-separated for different resource types
			const sourceFields = rule.sourceField
				.split(",")
				.map((field) => field.trim());

			// First try to find a parent
			for (const parentType of parentTypes) {
				const parentNode = findParentOfType(nodeId, parentType, nodes);
				if (parentNode) {
					// Try each possible source field for this parent type
					for (const sourceField of sourceFields) {
						const value = getParentConfigurationValue(
							parentNode,
							sourceField,
							nodeConfigurations
						);
						if (value !== undefined && value !== "") {
							foundNode = parentNode;
							foundValue = true;
							console.log(
								`[autoConfigureNode] Found ${fieldName} from ${parentType} parent using field ${sourceField}:`,
								value
							);
							break; // Use the first valid field found
						}
					}
					if (foundValue) break; // Use the first valid parent found
				}
			}

			// For Route Tables, also check edge connections even if parent was found
			const shouldCheckEdgesAlways = nodeResourceType === "aws-route-table" &&
				(fieldName === "awsInternetGatewayId" || fieldName === "awsSubnetId");

			if ((!foundValue || shouldCheckEdgesAlways) && edges.length > 0) {
				console.log(
					`[autoConfigureNode] ${!foundValue ? 'No parent found' : 'Also checking edges'} for ${fieldName} with multiple parent types...`,
					{
						totalEdges: edges.length,
						targetTypes: parentTypes,
						nodeId,
						shouldCheckEdgesAlways,
					}
				);

				const connectedNodes = findConnectedNodesOfTypes(
					nodeId,
					parentTypes,
					nodes,
					edges
				);
				console.log(
					`[autoConfigureNode] Found ${connectedNodes.length} connected nodes for ${fieldName}:`,
					connectedNodes.map(n => ({ id: n.id, serviceId: n.data?.serviceId }))
				);

				if (connectedNodes.length > 0) {
					// For Route Table fields, prioritize edge connections over parent-child
					if (shouldCheckEdgesAlways) {
						foundNode = connectedNodes[0];
						source = "edge";
						foundValue = true;
						console.log(
							`[autoConfigureNode] Using edge connection over parent for ${fieldName}:`,
							{
								connectedNode: foundNode.id,
								connectedNodeServiceId: foundNode.data?.serviceId,
							}
						);
					} else if (!foundValue) {
						// Only use edge if no parent was found
						foundNode = connectedNodes[0];
						source = "edge";
						foundValue = true;
						console.log(
							`[autoConfigureNode] Found connected node via edge for ${fieldName}:`,
							{
								connectedNode: foundNode.id,
								connectedNodeServiceId: foundNode.data?.serviceId,
							}
						);
					}
				}
			}

			// Apply the found value or clear if no value found
			if (foundValue && foundNode) {
				// Parse source fields again and try each one
				const sourceFields = rule.sourceField
					.split(",")
					.map((field) => field.trim());
				
				let finalValue = null;
				for (const sourceField of sourceFields) {
					const value = getParentConfigurationValue(
						foundNode,
						sourceField,
						nodeConfigurations
					);
					if (value !== undefined && value !== "") {
						finalValue = value;
						console.log(
							`[autoConfigureNode] Using source field ${sourceField} for ${fieldName}:`,
							value
						);
						break;
					}
				}

				if (finalValue !== null) {
					(updatedConfig as Record<string, unknown>)[fieldName] = finalValue;
					autoPopulatedFields.push(fieldName);
					console.log(
						`[autoConfigureNode] Auto-populated ${fieldName} from ${source}:`,
						finalValue
					);
				}
			} else {
				// Clear the field if no source found (important for cleanup when connections are removed)
				const currentValue = (currentConfig as Record<string, unknown>)[fieldName];
				console.log(
					`[autoConfigureNode] Multiple parent types - no source found for ${fieldName}:`,
					{ currentValue, willClear: currentValue !== undefined && currentValue !== "" }
				);
				if (currentValue !== undefined && currentValue !== "") {
					(updatedConfig as Record<string, unknown>)[fieldName] = "";
					autoPopulatedFields.push(fieldName);
					console.log(
						`[autoConfigureNode] Cleared ${fieldName} (was: ${currentValue}) - no source found (multiple parent types)`
					);
				}
			}

			continue; // Always continue after handling multiple parent types
		} else {
			// Standard single parent type auto-configuration
			const parentNode = findParentOfType(nodeId, parentTypes[0], nodes);
			console.log(
				`[autoConfigureNode] Looking for parent of type ${parentTypes[0]} for field ${fieldName}`,
				{
					parentNode: parentNode?.id,
					parentNodeServiceId: parentNode?.data?.serviceId,
					targetParentType: parentTypes[0],
				}
			);

			let foundNode = parentNode;
			let source = "parent";

			// For Route Tables, some fields should always check both parent-child AND edge connections
			// IGW and Subnet connections are typically via edges, VPC can be both
			const shouldCheckEdgesAlways = nodeResourceType === "aws-route-table" &&
				(fieldName === "awsInternetGatewayId" || fieldName === "awsSubnetId");

			// If no parent found, or if we should always check edges for this field, try edge connections
			if ((!parentNode || shouldCheckEdgesAlways) && edges.length > 0) {
				console.log(
					`[autoConfigureNode] ${!parentNode ? 'No parent found' : 'Always checking edges'} for ${fieldName}, searching edges...`,
					{
						totalEdges: edges.length,
						targetTypes: parentTypes,
						nodeId,
						shouldCheckEdgesAlways,
					}
				);

				const connectedNodes = findConnectedNodesOfTypes(
					nodeId,
					parentTypes,
					nodes,
					edges
				);
				console.log(
					`[autoConfigureNode] Found ${connectedNodes.length} connected nodes for ${fieldName}:`,
					connectedNodes.map(n => ({ id: n.id, serviceId: n.data?.serviceId }))
				);

				if (connectedNodes.length > 0) {
					// For Route Table IGW and Subnet fields, prioritize edge connections over parent-child
					if (shouldCheckEdgesAlways) {
						foundNode = connectedNodes[0];
						source = "edge";
						console.log(
							`[autoConfigureNode] Using edge connection over parent for ${fieldName}:`,
							{
								connectedNode: foundNode.id,
								connectedNodeServiceId: foundNode.data?.serviceId,
							}
						);
					} else if (!parentNode) {
						// Only use edge if no parent was found
						foundNode = connectedNodes[0];
						source = "edge";
						console.log(
							`[autoConfigureNode] Found connected node of type ${parentTypes[0]} via edge:`,
							{
								connectedNode: foundNode.id,
								connectedNodeServiceId: foundNode.data?.serviceId,
							}
						);
					}
				}
			}

			if (foundNode) {
				// Handle multiple source fields for single parent type
				const sourceFields = rule.sourceField
					.split(",")
					.map((field) => field.trim());

				let finalValue = null;
				let usedSourceField = null;

				for (const sourceField of sourceFields) {
					const value = getParentConfigurationValue(
						foundNode,
						sourceField,
						nodeConfigurations
					);
					console.log(
						`[autoConfigureNode] Trying source field ${sourceField} from ${source} ${foundNode.id}:`,
						{
							value,
							valueType: typeof value,
						}
					);

					if (value !== undefined && value !== "") {
						finalValue = value;
						usedSourceField = sourceField;
						break;
					}
				}

				if (finalValue !== null) {
					(updatedConfig as Record<string, unknown>)[fieldName] = finalValue;
					autoPopulatedFields.push(fieldName);
					console.log(
						`[autoConfigureNode] Auto-populated ${fieldName} from ${parentTypes[0]} ${source} using field ${usedSourceField}:`,
						finalValue
					);
					continue;
				} else {
					console.log(
						`[autoConfigureNode] All source fields (${rule.sourceField}) from ${source} were undefined or empty for field ${fieldName}`
					);
				}
			} else {
				console.log(
					`[autoConfigureNode] No parent or connected node of type ${parentTypes[0]} found for field ${fieldName}`
				);
			}
		}

		// Use default value if no parent found, or clear field if no default
		if (rule.defaultValue !== undefined) {
			(updatedConfig as Record<string, unknown>)[fieldName] = rule.defaultValue;
			autoPopulatedFields.push(fieldName);
			console.log(
				`[autoConfigureNode] Used default value for ${fieldName}:`,
				rule.defaultValue
			);
		} else {
			// Clear the field if no source found and no default value (important for cleanup)
			const currentValue = (currentConfig as Record<string, unknown>)[fieldName];
			console.log(
				`[autoConfigureNode] Single parent type - no source found for ${fieldName}:`,
				{ currentValue, willClear: currentValue !== undefined && currentValue !== "" }
			);
			if (currentValue !== undefined && currentValue !== "") {
				(updatedConfig as Record<string, unknown>)[fieldName] = "";
				autoPopulatedFields.push(fieldName);
				console.log(
					`[autoConfigureNode] Cleared ${fieldName} (was: ${currentValue}) - no source found`
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
	const allAffectedNodeIds = [
		...new Set([...descendants, ...connectedNodes.map((n) => n.id)]),
	];

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
