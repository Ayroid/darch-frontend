/**
 * Auto-Configuration Logic for AWS Resources
 * Handles automatic field population and field disabling based on container relationships
 */

import { Node } from "@xyflow/react";
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
      region: {
        sourceParentType: "aws-region",
        sourceField: "region",
        defaultValue: "us-east-1",
      },
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
  "aws-private-subnet": {
    autoFields: {
      region: {
        sourceParentType: "aws-region",
        sourceField: "region",
        defaultValue: "us-east-1",
      },
      availabilityZone: {
        sourceParentType: "aws-availability-zone",
        sourceField: "availabilityZone",
        defaultValue: "us-east-1a",
      },
      vpcId: {
        sourceParentType: "aws-vpc",
        sourceField: "id",
        defaultValue: "",
      },
    },
    disabledFields: ["region", "availabilityZone", "vpcId"],
  },
  "aws-public-subnet": {
    autoFields: {
      region: {
        sourceParentType: "aws-region",
        sourceField: "region",
        defaultValue: "us-east-1",
      },
      availabilityZone: {
        sourceParentType: "aws-availability-zone",
        sourceField: "availabilityZone",
        defaultValue: "us-east-1a",
      },
      vpcId: {
        sourceParentType: "aws-vpc",
        sourceField: "id",
        defaultValue: "",
      },
    },
    disabledFields: ["region", "availabilityZone", "vpcId"],
  },
  "aws-security-group": {
    autoFields: {
      vpcId: {
        sourceParentType: "aws-vpc",
        sourceField: "id",
        defaultValue: "",
      },
    },
    disabledFields: ["vpcId"],
  },
  "aws-ec2": {
    autoFields: {
      region: {
        sourceParentType: "aws-region",
        sourceField: "region",
        defaultValue: "us-east-1",
      },
      availabilityZone: {
        sourceParentType: "aws-availability-zone",
        sourceField: "availabilityZone",
        defaultValue: "us-east-1a",
      },
      subnetId: {
        sourceParentType: "aws-private-subnet,aws-public-subnet",
        sourceField: "id",
        defaultValue: "",
      },
      securityGroups: {
        sourceParentType: "aws-security-group",
        sourceField: "id",
        defaultValue: [],
      },
    },
    disabledFields: ["region", "availabilityZone", "subnetId"],
    // Note: securityGroups is not disabled as it's an array and user might want to add multiple
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

  return hierarchy.find((parent) => {
    const serviceId = parent.data?.serviceId as string;
    return serviceId === targetParentType;
  }) || null;
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
 * Gets the configuration value from a parent node
 */
export function getParentConfigurationValue(
  parentNode: Node,
  fieldName: string,
  nodeConfigurations: Record<string, AWSResourceConfiguration>
): unknown {
  const parentConfig = nodeConfigurations[parentNode.id];
  if (!parentConfig) return undefined;

  // Special handling for different field mappings
  switch (fieldName) {
    case "id":
      // For cases where we need the node/service ID itself (like VPC ID, Subnet ID)
      return parentNode.id;
    case "vpcId":
      // For VPC, we might need to use a generated ID or the node ID itself
      return parentNode.id; // Use node ID as VPC ID for now
    case "subnetId":
      // For subnets, use the node ID as subnet ID
      return parentNode.id;
    case "region":
      return (parentConfig as AWSRegionConfiguration).region;
    case "availabilityZone":
      return (parentConfig as AvailabilityZoneConfiguration).availabilityZone;
    default:
      return (parentConfig as Record<string, unknown>)[fieldName];
  }
}

/**
 * Auto-configures a node based on its container hierarchy
 */
export function autoConfigureNode(
  nodeId: string,
  currentConfig: AWSResourceConfiguration,
  nodes: Node[],
  nodeConfigurations: Record<string, AWSResourceConfiguration>,
  resourceType?: string
): {
  updatedConfig: AWSResourceConfiguration;
  autoPopulatedFields: string[];
} {
  // Get resourceType from parameter or from node data
  let nodeResourceType = resourceType;
  if (!nodeResourceType) {
    const node = nodes.find(n => n.id === nodeId);
    nodeResourceType = node?.data?.serviceId as string;
  }

  if (!nodeResourceType) {
    return { updatedConfig: currentConfig, autoPopulatedFields: [] };
  }

  const rules = AWS_RESOURCE_FIELD_RULES[nodeResourceType];
  if (!rules) {
    return { updatedConfig: currentConfig, autoPopulatedFields: [] };
  }

  const updatedConfig = { ...currentConfig };
  const autoPopulatedFields: string[] = [];

  // Process each auto field rule
  for (const [fieldName, rule] of Object.entries(rules.autoFields)) {
    const parentTypes = rule.sourceParentType.split(',').map(type => type.trim());

    // Handle array fields (like security groups)
    if (fieldName === "securityGroups" && Array.isArray(rule.defaultValue)) {
      const securityGroupParents = findParentsOfTypes(nodeId, parentTypes, nodes);
      if (securityGroupParents.length > 0) {
        const securityGroupIds = securityGroupParents.map(parent =>
          getParentConfigurationValue(parent, rule.sourceField, nodeConfigurations)
        ).filter(id => id !== undefined && id !== "");

        if (securityGroupIds.length > 0) {
          (updatedConfig as Record<string, unknown>)[fieldName] = securityGroupIds;
          autoPopulatedFields.push(fieldName);
        }
      }
      continue;
    }

    // Handle multiple possible parent types (like subnets for EC2)
    if (parentTypes.length > 1) {
      let foundValue = false;
      for (const parentType of parentTypes) {
        const parentNode = findParentOfType(nodeId, parentType, nodes);
        if (parentNode) {
          const value = getParentConfigurationValue(parentNode, rule.sourceField, nodeConfigurations);
          if (value !== undefined && value !== "") {
            (updatedConfig as Record<string, unknown>)[fieldName] = value;
            autoPopulatedFields.push(fieldName);
            foundValue = true;
            break; // Use the first valid parent found
          }
        }
      }
      if (foundValue) continue;
    } else {
      // Standard single parent type auto-configuration
      const parentNode = findParentOfType(nodeId, parentTypes[0], nodes);
      if (parentNode) {
        const value = getParentConfigurationValue(parentNode, rule.sourceField, nodeConfigurations);
        if (value !== undefined && value !== "") {
          (updatedConfig as Record<string, unknown>)[fieldName] = value;
          autoPopulatedFields.push(fieldName);
          continue;
        }
      }
    }

    // Use default value if no parent found
    if (rule.defaultValue !== undefined) {
      (updatedConfig as Record<string, unknown>)[fieldName] = rule.defaultValue;
      autoPopulatedFields.push(fieldName);
    }
  }

  return { updatedConfig, autoPopulatedFields };
}

/**
 * Gets the list of fields that should be disabled for a resource type
 * These fields are always disabled as they are managed automatically
 */
export function getDisabledFields(
  resourceType: string
): string[] {
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
  nodeConfigurations: Record<string, AWSResourceConfiguration>
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

  // Auto-configure each descendant
  for (const descendantId of descendants) {
    const config = nodeConfigurations[descendantId];
    if (!config) continue;

    const descendantNode = nodes.find(n => n.id === descendantId);
    const resourceType = descendantNode?.data?.serviceId as string;
    if (!resourceType) continue;

    const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
      descendantId,
      config,
      nodes,
      nodeConfigurations,
      resourceType
    );

    // Only include if there were changes
    if (autoPopulatedFields.length > 0) {
      affectedUpdates.push({
        nodeId: descendantId,
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
  nodes: Node[]
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
    const parentNode = findParentOfType(nodeId, rule.sourceParentType, nodes);

    info[fieldName] = {
      isAutoConfigured: !!parentNode,
      sourceType: rule.sourceParentType,
      sourceName: parentNode?.data?.name as string,
    };
  }

  return info;
}
