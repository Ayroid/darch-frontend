# Auto-Configuration System

This document covers the intelligent auto-configuration system that automatically populates form fields based on container relationships and hierarchical structures in cloud architectures.

## Overview

The auto-configuration system is a sophisticated feature that automatically configures AWS resources based on their position within container hierarchies. When a resource is placed inside containers (like VPCs, Subnets, or Availability Zones), the system automatically inherits relevant configuration values from parent containers.

**Main File**: `lib/auto-configuration.ts`
**Integration**: Architecture Store, Configuration Forms

## Core Concepts

### Container Hierarchy

AWS resources follow natural hierarchical relationships:

```
AWS Region
├── Availability Zone
│   ├── VPC
│   │   ├── Public Subnet
│   │   │   ├── EC2 Instance
│   │   │   └── Load Balancer
│   │   ├── Private Subnet
│   │   │   ├── EC2 Instance
│   │   │   └── RDS Database
│   │   └── Security Group
│   └── Another VPC
└── Another Availability Zone
```

### Auto-Configuration Rules

Each AWS resource type has specific rules defining:
1. **Auto Fields**: Which fields should be automatically populated
2. **Source Parent Type**: Which parent container provides the value
3. **Source Field**: Which field in the parent configuration to use
4. **Disabled Fields**: Which fields should be disabled when auto-configured

## Auto-Configuration Rules Definition

### Rule Structure

```typescript
export interface ResourceFieldRules {
  [resourceType: string]: {
    autoFields: {
      [fieldName: string]: {
        sourceParentType: string; // Parent container type(s)
        sourceField: string;      // Field in parent configuration
        defaultValue?: unknown;   // Fallback value
      };
    };
    disabledFields: string[];     // Fields to disable when auto-configured
  };
}
```

### AWS Resource Rules

```typescript
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
        sourceField: "serviceId",
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
        sourceField: "serviceId",
        defaultValue: "",
      },
    },
    disabledFields: ["region", "availabilityZone", "vpcId"],
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
        sourceField: "serviceId",
        defaultValue: "",
      },
      securityGroups: {
        sourceParentType: "aws-security-group",
        sourceField: "serviceId",
        defaultValue: [],
      },
    },
    disabledFields: ["region", "availabilityZone", "subnetId"],
  },

  "aws-security-group": {
    autoFields: {
      vpcId: {
        sourceParentType: "aws-vpc",
        sourceField: "serviceId",
        defaultValue: "",
      },
    },
    disabledFields: ["vpcId"],
  },
};
```

## Core Functions

### Container Hierarchy Navigation

#### Get Node Container Hierarchy
```typescript
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
```

**Purpose**: Returns an array of parent containers, ordered from immediate parent to root container.

**Example**:
```typescript
// For an EC2 instance inside: Region > AZ > VPC > Subnet
const hierarchy = getNodeContainerHierarchy('ec2-instance-1', nodes);
// Returns: [SubnetNode, VPCNode, AZNode, RegionNode]
```

#### Find Parent of Specific Type
```typescript
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
```

**Purpose**: Finds the first parent container of a specific type in the hierarchy.

#### Find Parents of Multiple Types
```typescript
export function findParentsOfTypes(
  nodeId: string,
  targetParentTypes: string[],
  nodes: Node[]
): Node[] {
  const hierarchy = getNodeContainerHierarchy(nodeId, nodes);

  return hierarchy.filter((parent) => {
    const serviceId = parent.data?.serviceId as string;
    return targetParentTypes.includes(serviceId);
  });
}
```

**Purpose**: Finds all parent containers that match any of the specified types.

### Configuration Value Extraction

#### Get Parent Configuration Value
```typescript
export function getParentConfigurationValue(
  parentNode: Node,
  fieldName: string,
  nodeConfigurations: Record<string, AWSResourceConfiguration>
): unknown {
  const parentConfig = nodeConfigurations[parentNode.id];
  if (!parentConfig) return undefined;

  // Special handling for different field mappings
  switch (fieldName) {
    case "serviceId":
      // For cases where we need the node/service ID itself
      return parentNode.id;
    case "vpcId":
      // For VPC, use the node ID as VPC ID
      return parentNode.id;
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
```

**Purpose**: Extracts configuration values from parent containers with special handling for ID fields.

## Auto-Configuration Process

### Main Auto-Configuration Function

```typescript
export function autoConfigureNode(
  nodeId: string,
  currentConfig: AWSResourceConfiguration,
  nodes: Node[],
  nodeConfigurations: Record<string, AWSResourceConfiguration>
): {
  updatedConfig: AWSResourceConfiguration;
  autoPopulatedFields: string[];
} {
  const resourceType = currentConfig.resourceType;
  if (!resourceType) {
    return { updatedConfig: currentConfig, autoPopulatedFields: [] };
  }

  const rules = AWS_RESOURCE_FIELD_RULES[resourceType];
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

    // Handle multiple possible parent types
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
            break;
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
```

### Process Flow

1. **Rule Lookup**: Find auto-configuration rules for resource type
2. **Parent Discovery**: Locate parent containers in hierarchy
3. **Value Extraction**: Extract configuration values from parents
4. **Field Population**: Update configuration with auto-configured values
5. **Return Results**: Return updated configuration and list of auto-populated fields

## Cascading Auto-Configuration

### Auto-Configure Affected Nodes

```typescript
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

    const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
      descendantId,
      config,
      nodes,
      nodeConfigurations
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
```

**Purpose**: When a container's configuration changes, automatically update all child nodes that depend on that configuration.

## Field Disabling Logic

### Disable Auto-Configured Fields

```typescript
export function getDisabledFields(
  resourceType: string,
  autoPopulatedFields: string[]
): string[] {
  const rules = AWS_RESOURCE_FIELD_RULES[resourceType];
  if (!rules) return [];

  // Only disable fields that were actually auto-populated
  return rules.disabledFields.filter((field) => autoPopulatedFields.includes(field));
}
```

### Check Field Disabled State

```typescript
export function isFieldDisabled(
  nodeId: string,
  fieldName: string,
  resourceType: string,
  nodes: Node[]
): boolean {
  const rules = AWS_RESOURCE_FIELD_RULES[resourceType];
  if (!rules || !rules.disabledFields.includes(fieldName)) {
    return false;
  }

  // Check if the field would be auto-populated
  const fieldRule = rules.autoFields[fieldName];
  if (!fieldRule) return false;

  // Special handling for EC2 subnetId
  if (resourceType === "aws-ec2" && fieldName === "subnetId") {
    const privateSubnet = findParentOfType(nodeId, "aws-private-subnet", nodes);
    const publicSubnet = findParentOfType(nodeId, "aws-public-subnet", nodes);
    return !!(privateSubnet || publicSubnet);
  }

  // Standard check
  const parentNode = findParentOfType(nodeId, fieldRule.sourceParentType, nodes);
  return !!parentNode;
}
```

## Integration with Parent Relationship Changes

### Real-time Auto-Configuration Updates

The auto-configuration system has been enhanced to automatically trigger when nodes are moved between containers through drag-and-drop operations. This ensures that configuration values are always synchronized with the current container hierarchy.

#### Parent Relationship Change Detection

```typescript
// Enhanced container logic with auto-configuration tracking
export function updateNodeParentRelationshipsWithTracking(
  nodes: Node[],
  forceUpdate: boolean = false,
  isDragEnd: boolean = false
): { 
  updatedNodes: Node[], 
  nodesWithChangedParents: Set<string> 
} {
  // ... parent relationship logic ...
  
  // Track nodes whose parent relationships changed
  if (node.parentId !== newParentId) {
    updatedNode = updateNodeParentRelationship(updatedNode, newParentId, nodeMap);
    nodesWithChangedParents.add(node.id);
  }
  
  return { updatedNodes, nodesWithChangedParents };
}
```

#### Automatic Configuration Updates

When nodes are moved between containers, the system automatically:

1. **Detects Parent Changes**: Tracks which nodes had their parent relationships modified
2. **Triggers Auto-Configuration**: Calls `autoConfigureNode` for each affected node
3. **Updates Store**: Synchronizes the new configuration with the architecture store
4. **Real-time Updates**: Configuration forms immediately reflect the changes

```typescript
// In node movement handler
if (nodesWithChangedParents.size > 0 && architectureStore) {
  setTimeout(() => {
    for (const nodeId of nodesWithChangedParents) {
      const nodeConfig = architectureStore.getNodeConfiguration(nodeId);
      if (nodeConfig) {
        const { updatedConfig } = autoConfigureNode(
          nodeId,
          nodeConfig,
          updatedNodes,
          architectureStore.nodeConfigurations
        );
        architectureStore.updateNodeConfiguration(nodeId, updatedConfig);
      }
    }
  }, 0);
}
```

#### Movement Scenarios

**1. Service Placed in Container**
- Service inherits configuration values from the container
- Relevant fields are auto-populated (e.g., region, VPC ID, subnet ID)
- Fields become disabled to prevent manual override

**2. Service Moved Between Containers**
- Previous auto-configured values are cleared
- New values are inherited from the new parent container
- Configuration forms update in real-time

**3. Service Removed from Container**
- Auto-configured values are cleared
- Fields become editable again
- Default values may be applied if specified in rules

#### Enhanced Movement Freedom

The integration works seamlessly with the enhanced container movement system:

- **75% Overlap Threshold**: Auto-configuration only triggers when nodes are well-contained
- **Liberal Movement**: Nodes can be moved freely without unwanted configuration changes
- **Batch Processing**: Multiple node movements are handled efficiently
- **Debounced Updates**: Configuration updates are debounced to prevent excessive calls

#### Performance Optimizations

- **Async Updates**: Configuration updates happen asynchronously to avoid blocking UI
- **Change Detection**: Only nodes with actual parent changes trigger auto-configuration
- **Batch Operations**: Multiple related updates are processed together
- **Cache Invalidation**: Relevant caches are cleared when parent relationships change

## Integration with Architecture Store

### Configuration Management

### Store Integration

The auto-configuration system is tightly integrated with the Architecture Store:

```typescript
// In architecture-store.ts - addNode function
const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
  node.id,
  nodeConfig,
  nodesWithNew,
  state.nodeConfigurations
);

// Apply auto-configuration if any fields were populated
if (autoPopulatedFields.length > 0) {
  state.nodeConfigurations[node.id] = updatedConfig;
  archNode.configuration = updatedConfig;

  console.log(`Auto-configured new node ${node.id} with fields:`, autoPopulatedFields);
}
```

### Cascading Updates

```typescript
// In architecture-store.ts - updateNodeConfiguration function
const affectedUpdates = autoConfigureAffectedNodes(
  nodeId,
  nodes,
  state.nodeConfigurations
);

// Apply auto-configuration updates
for (const { nodeId: affectedNodeId, updatedConfig } of affectedUpdates) {
  state.nodeConfigurations[affectedNodeId] = updatedConfig;

  // Update the corresponding node in architecture data
  const affectedNode = state.currentData.nodes.find((n) => n.id === affectedNodeId);
  if (affectedNode) {
    affectedNode.configuration = updatedConfig;
  }
}
```

## UI Integration

### Configuration Forms

Configuration forms integrate auto-configuration indicators:

```typescript
// In configuration forms
const isAutoConfigured = (fieldName: string) => {
  const info = getAutoConfigurationInfo(node.id, resourceType, nodes);
  return info[fieldName]?.isAutoConfigured || false;
};

const isFieldDisabled = (fieldName: string) => {
  return isFieldDisabled(node.id, fieldName, resourceType, nodes);
};

// Form field rendering
<FormField
  label="Region"
  name="region"
  register={register}
  disabled={isFieldDisabled('region')}
  autoConfigured={isAutoConfigured('region')}
/>
```

### Visual Indicators

```typescript
{autoConfigured && (
  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
    Auto-configured
  </span>
)}
```

## Configuration Information Display

### Get Auto-Configuration Info

```typescript
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
```

## Example Scenarios

### Scenario 1: EC2 in Private Subnet

```
AWS Region (us-west-2)
└── Availability Zone (us-west-2a)
    └── VPC (10.0.0.0/16)
        └── Private Subnet (10.0.1.0/24)
            └── EC2 Instance [AUTO-CONFIGURED]
                ├── region: "us-west-2" (from Region)
                ├── availabilityZone: "us-west-2a" (from AZ)
                └── subnetId: "subnet-123" (from Private Subnet)
```

### Scenario 2: Security Group Auto-Assignment

```
VPC (vpc-123)
├── Security Group (sg-web)
└── Private Subnet
    └── EC2 Instance [AUTO-CONFIGURED]
        ├── vpcId: "vpc-123" (from VPC)
        └── securityGroups: ["sg-web"] (from Security Group)
```

### Scenario 3: Cascading Updates

When a Region's configuration changes from "us-east-1" to "us-west-2":
1. All Availability Zones in that region update their region field
2. All VPCs in those AZs update their region field
3. All Subnets in those VPCs update their region field
4. All EC2 instances in those subnets update their region field

## Performance Considerations

### Optimization Strategies

1. **Cached Hierarchy**: Container relationships are cached for performance
2. **Incremental Updates**: Only affected nodes are reconfigured
3. **Debounced Updates**: Configuration changes are debounced to prevent excessive updates
4. **Selective Processing**: Only nodes with auto-configuration rules are processed

### Memory Management

1. **Weak References**: Parent-child relationships use efficient data structures
2. **Cleanup**: Unused configurations are cleaned up when nodes are deleted
3. **Batch Processing**: Multiple field updates are batched together

This comprehensive auto-configuration system provides users with an intelligent, automated way to manage complex AWS resource configurations, significantly reducing manual configuration effort while ensuring consistency across hierarchical cloud architectures.
