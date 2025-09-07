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
        defaultValue: "",
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
        sourceField: "id",
        defaultValue: "default-subnet",
      },
      securityGroups: {
        sourceParentType: "aws-security-group",
        sourceField: "id",
        defaultValue: [],
      },
    },
    disabledFields: ["awsRegionId", "awsAvailabilityZone", "subnetId"],
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
  if (!parentConfig) {
    console.log(`[getParentConfigurationValue] No config found for parent ${parentNode.id}`);
    return undefined;
  }

  console.log(`[getParentConfigurationValue] Getting field ${fieldName} from parent ${parentNode.id}`, {
    parentConfig,
    serviceId: parentNode.data?.serviceId
  });

  // Special handling for different field mappings
  switch (fieldName) {
    case "id":
      // For cases where we need the node/service ID itself (like VPC ID, Subnet ID)
      return parentNode.id;
    case "awsVpcId":
      // For VPC, we need to return the VPC's identifier from its configuration
      return parentNode.id;
    case "subnetId":
      // For subnets, use the node ID as subnet ID
      return parentNode.id;
    case "region":
      const regionValue = (parentConfig as AWSRegionConfiguration).region;
      console.log(`[getParentConfigurationValue] Region field value:`, regionValue);
      return regionValue;
    case "availabilityZone":
      const azValue = (parentConfig as AvailabilityZoneConfiguration).availabilityZone;
      console.log(`[getParentConfigurationValue] AvailabilityZone field value:`, azValue);
      return azValue;
    default:
      const defaultValue = (parentConfig as Record<string, unknown>)[fieldName];
      console.log(`[getParentConfigurationValue] Default field ${fieldName} value:`, defaultValue);
      return defaultValue;
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
    console.log(`[autoConfigureNode] No resource type found for node ${nodeId}`);
    return { updatedConfig: currentConfig, autoPopulatedFields: [] };
  }

  const rules = AWS_RESOURCE_FIELD_RULES[nodeResourceType];
  if (!rules) {
    console.log(`[autoConfigureNode] No rules found for resource type ${nodeResourceType}`);
    return { updatedConfig: currentConfig, autoPopulatedFields: [] };
  }

  console.log(`[autoConfigureNode] === DEBUG: Processing node ${nodeId} of type ${nodeResourceType} ===`, {
    rules: rules.autoFields,
    currentConfig,
    nodeConfigurationsKeys: Object.keys(nodeConfigurations),
    nodeConfigurationsValues: nodeConfigurations
  });

  const updatedConfig = { ...currentConfig };
  const autoPopulatedFields: string[] = [];

  // Process each auto field rule
  for (const [fieldName, rule] of Object.entries(rules.autoFields)) {
    console.log(`[autoConfigureNode] Processing field ${fieldName}`, { rule });

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
          console.log(`[autoConfigureNode] Auto-populated ${fieldName} with security groups:`, securityGroupIds);
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
            console.log(`[autoConfigureNode] Auto-populated ${fieldName} from ${parentType} parent:`, value);
            break; // Use the first valid parent found
          }
        }
      }
      if (foundValue) continue;
    } else {
      // Standard single parent type auto-configuration
      const parentNode = findParentOfType(nodeId, parentTypes[0], nodes);
      console.log(`[autoConfigureNode] Looking for parent of type ${parentTypes[0]} for field ${fieldName}`, {
        parentNode: parentNode?.id,
        parentNodeServiceId: parentNode?.data?.serviceId,
        targetParentType: parentTypes[0]
      });

      if (parentNode) {
        const value = getParentConfigurationValue(parentNode, rule.sourceField, nodeConfigurations);
        console.log(`[autoConfigureNode] Got value from parent ${parentNode.id}:`, {
          sourceField: rule.sourceField,
          value,
          valueType: typeof value
        });

        if (value !== undefined && value !== "") {
          (updatedConfig as Record<string, unknown>)[fieldName] = value;
          autoPopulatedFields.push(fieldName);
          console.log(`[autoConfigureNode] Auto-populated ${fieldName} from ${parentTypes[0]} parent:`, value);
          continue;
        } else {
          console.log(`[autoConfigureNode] Value from parent was undefined or empty for field ${fieldName}`);
        }
      } else {
        console.log(`[autoConfigureNode] No parent of type ${parentTypes[0]} found for field ${fieldName}`);
      }
    }

    // Use default value if no parent found
    if (rule.defaultValue !== undefined) {
      (updatedConfig as Record<string, unknown>)[fieldName] = rule.defaultValue;
      autoPopulatedFields.push(fieldName);
      console.log(`[autoConfigureNode] Used default value for ${fieldName}:`, rule.defaultValue);
    }
  }

  console.log(`[autoConfigureNode] Final result for ${nodeId}:`, {
    autoPopulatedFields,
    updatedConfig
  });

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
