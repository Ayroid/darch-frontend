# Auto-Configuration System

This document covers the intelligent auto-configuration system that automatically populates form fields based on container relationships and hierarchical structures in cloud architectures.

## Overview

The auto-configuration system is a sophisticated feature that automatically configures AWS resources based on their position within container hierarchies. When a resource is placed inside containers (like VPCs, Subnets, or Availability Zones), the system automatically inherits relevant configuration values from parent containers.

**Main File**: `lib/auto-configuration.ts`
**Integration**: Architecture Store, Configuration Forms
**Hook**: `hooks/use-auto-configuration.ts`

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
4. **Default Value**: Fallback value if no parent is found
5. **Disabled Fields**: Which fields should be disabled when auto-configured

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

### Current AWS Resource Rules

```typescript
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
        defaultValue: "default-vpc",
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
```

## Key Field Mappings

### Consistent Field Naming

All resources use consistent field names for auto-configuration:
- **Region**: `awsRegionId` (populated from parent region's `region` field)
- **Availability Zone**: `awsAvailabilityZone` (populated from parent AZ's `availabilityZone` field)
- **VPC**: `awsVpcId` (populated from parent VPC's `awsVpcId` field)
- **Subnet**: `subnetId` (populated using parent subnet's node ID)
- **Security Groups**: `securityGroups` (array populated from parent security group IDs)

```

### Multiple Parent Types

Some fields can be populated from multiple parent types. For example, EC2 instances can be placed in either public or private subnets:

```typescript
subnetId: {
  sourceParentType: "aws-private-subnet,aws-public-subnet",
  sourceField: "id",
  defaultValue: "",
}
```

The system will find the first available parent of any specified type.

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
    return serviceId && targetParentTypes.includes(serviceId);
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
    case "id":
      // For cases where we need the node/service ID itself (like VPC ID, Subnet ID)
      return parentNode.id;
    case "awsVpcId":
      // For VPC, we might need to use a generated ID or the node ID itself
      return (parentConfig as VPCConfiguration).awsVpcId;
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

**Purpose**: Extracts configuration values from parent containers with special handling for ID fields and field name mappings.

## Auto-Configuration Process

### Main Auto-Configuration Function

The core auto-configuration function processes a node and returns updated configuration with auto-populated fields:

```typescript
export function autoConfigureNode(
  nodeId: string,
  currentConfig: AWSResourceConfiguration,
  nodes: Node[],
  nodeConfigurations: Record<string, AWSResourceConfiguration>,
  resourceType?: string
): {
  updatedConfig: AWSResourceConfiguration;
  autoPopulatedFields: string[];
}
```

### Process Flow

1. **Resource Type Detection**: Get resource type from parameter or node data
2. **Rule Lookup**: Find auto-configuration rules for the resource type
3. **Field Processing**: For each auto-configurable field:
   - Find appropriate parent containers
   - Extract configuration values
   - Handle special cases (arrays, multiple parent types)
   - Apply default values if no parent found
4. **Return Results**: Return updated configuration and list of auto-populated fields

### Special Field Handling

#### Array Fields (Security Groups)
```typescript
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
}
```

#### Multiple Parent Types
```typescript
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
}
```

## Cascading Auto-Configuration

### Auto-Configure Affected Nodes

When a container's configuration changes, all child nodes that depend on that configuration need to be updated:

```typescript
export function autoConfigureAffectedNodes(
  changedNodeId: string,
  nodes: Node[],
  nodeConfigurations: Record<string, AWSResourceConfiguration>
): {
  nodeId: string;
  updatedConfig: AWSResourceConfiguration;
  autoPopulatedFields: string[];
}[]
```

**Purpose**: When a container's configuration changes, automatically update all descendant nodes that depend on that configuration.

**Process**:
1. Build parent-child relationship map
2. Find all descendants of the changed node
3. Auto-configure each descendant
4. Return only nodes that had configuration changes

## Field Disabling Logic

### Disable Auto-Configured Fields

Fields that are auto-configured should be disabled in forms to prevent manual override:

```typescript
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
```

### Get Disabled Fields List

```typescript
export function getDisabledFields(
  resourceType: string
): string[] {
  const rules = AWS_RESOURCE_FIELD_RULES[resourceType];
  if (!rules) return [];

  // All fields in disabledFields should always be disabled
  return rules.disabledFields;
}
```

## Auto-Configuration Hook

### useAutoConfiguration Hook

Configuration forms use this hook to determine field status:

```typescript
export function useAutoConfiguration({ nodeId, resourceType }: UseAutoConfigurationOptions) {
  const { convertToReactFlow } = useArchitectureStore();

  // Get field information
  const fieldInfo = useMemo(() => {
    const { nodes } = convertToReactFlow();
    const autoConfigInfo = getAutoConfigurationInfo(nodeId, resourceType, nodes);

    const result: Record<string, FieldInfo> = {};

    // Get all possible fields from auto-configuration rules
    for (const [fieldName, info] of Object.entries(autoConfigInfo)) {
      const disabled = isFieldDisabled(nodeId, fieldName, resourceType);

      result[fieldName] = {
        isDisabled: disabled,
        isAutoConfigured: info.isAutoConfigured,
        sourceType: info.sourceType,
        sourceName: info.sourceName,
      };
    }

    return result;
  }, [nodeId, resourceType, convertToReactFlow]);

  return {
    fieldInfo,
    isFieldDisabled: (fieldName: string) => fieldInfo[fieldName]?.isDisabled || false,
    getFieldInfo: (fieldName: string) => fieldInfo[fieldName] || null,
    getDisabledFields: () => Object.entries(fieldInfo)
      .filter(([, info]) => info.isDisabled)
      .map(([fieldName]) => fieldName),
    getAutoConfiguredFields: () => Object.entries(fieldInfo)
      .filter(([, info]) => info.isAutoConfigured)
      .map(([fieldName]) => fieldName),
  };
}
```

### Field Information Structure

```typescript
export interface FieldInfo {
  isDisabled: boolean;
  isAutoConfigured: boolean;
  sourceType?: string;
  sourceName?: string;
}
```

## Integration with Parent Relationship Changes

### Real-time Auto-Configuration Updates

The auto-configuration system automatically triggers when nodes are moved between containers through drag-and-drop operations. This ensures that configuration values are always synchronized with the current container hierarchy.

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
// In node movement handler (nodeUtils.tsx)
if (nodesWithChangedParents.size > 0 && architectureStore) {
  setTimeout(() => {
    for (const nodeId of nodesWithChangedParents) {
      const nodeConfig = architectureStore.getNodeConfiguration(nodeId);
      const node = updatedNodes.find(n => n.id === nodeId);
      const resourceType = node?.data?.serviceId as string;
      if (nodeConfig && resourceType) {
        const { updatedConfig } = autoConfigureNode(
          nodeId,
          nodeConfig,
          updatedNodes,
          architectureStore.nodeConfigurations,
          resourceType
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
- Relevant fields are auto-populated (e.g., `awsRegionId`, `awsVpcId`, `subnetId`)
- Fields become disabled to prevent manual override

**2. Service Moved Between Containers**
- Previous auto-configured values are cleared
- New values are inherited from the new parent container
- Configuration forms update in real-time

**3. Service Removed from Container**
- Auto-configured values revert to default values
- Fields become editable again
- Default values are applied as specified in rules

## Integration with Architecture Store

### Configuration Management

The auto-configuration system is tightly integrated with the Architecture Store:

```typescript
// In architecture-store.ts - addNode function
const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
  node.id,
  nodeConfig,
  nodesWithNew,
  state.nodeConfigurations,
  node.data?.serviceId
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

Configuration forms integrate auto-configuration using the `useAutoConfiguration` hook:

```typescript
// In configuration forms
const { isFieldDisabled, getFieldInfo } = useAutoConfiguration({
  nodeId: nodeId || "",
  resourceType: "aws-ec2",
});

// Form field rendering with auto-configuration
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Label htmlFor="region">AWS Region<span className="text-red-600">*</span></Label>
    {regionInfo?.isAutoConfigured && (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary" className="text-xs">
            Auto
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Auto-configured from {regionInfo.sourceName} ({regionInfo.sourceType})</p>
        </TooltipContent>
      </Tooltip>
    )}
  </div>
  <Input
    id="region"
    value={config.awsRegionId || ""}
    onChange={(e) => handleFieldChange("awsRegionId", e.target.value)}
    placeholder="e.g., us-east-1"
    disabled={isFieldDisabled("awsRegionId")}
  />
  {isFieldDisabled("awsRegionId") && (
    <p className="text-xs text-muted-foreground">
      This field is automatically configured based on the container hierarchy.
    </p>
  )}
</div>
```

### Visual Indicators

Auto-configured fields display:
1. **"Auto" Badge**: Shows when a field is auto-configured
2. **Tooltip**: Explains the source of auto-configuration
3. **Disabled State**: Prevents manual editing
4. **Helper Text**: Explains why the field is disabled

### Auto-Configuration Tooltip Component

```typescript
// AutoConfigurationTooltip.tsx
const AutoConfigurationTooltip = ({ parentContainer }: { parentContainer: string }) => (
  <Tooltip>
    <TooltipTrigger>
      <InfoIcon className="h-4 w-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent>
      <p>Auto-configured from {parentContainer} container</p>
    </TooltipContent>
  </Tooltip>
);
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
                ├── awsRegionId: "us-west-2" (from Region)
                ├── awsAvailabilityZone: "us-west-2a" (from AZ)
                └── subnetId: "subnet-123" (from Private Subnet)
```

### Scenario 2: Security Group Auto-Assignment

```
VPC (vpc-123)
├── Security Group (sg-web)
└── Private Subnet
    └── EC2 Instance [AUTO-CONFIGURED]
        ├── awsVpcId: "vpc-123" (from VPC)
        └── securityGroups: ["sg-web"] (from Security Group)
```

### Scenario 3: Cascading Updates

When a Region's configuration changes from "us-east-1" to "us-west-2":
1. All Availability Zones in that region update their `awsRegionId` field
2. All VPCs in those AZs update their `awsRegionId` field
3. All Subnets in those VPCs update their `awsRegionId` field
4. All EC2 instances in those subnets update their `awsRegionId` field

### Scenario 4: Multiple Parent Type Resolution

EC2 instance can be placed in either public or private subnet:
```
VPC
├── Public Subnet
│   └── EC2 Instance [AUTO-CONFIGURED]
│       └── subnetId: "public-subnet-id" (from Public Subnet)
└── Private Subnet
    └── EC2 Instance [AUTO-CONFIGURED]
        └── subnetId: "private-subnet-id" (from Private Subnet)
```

## Debugging and Troubleshooting

### Debug Logging

The auto-configuration system includes comprehensive logging for debugging:

```typescript
console.log(`[autoConfigureNode] Processing node ${nodeId} of type ${nodeResourceType}`, {
  rules: rules.autoFields,
  currentConfig
});

console.log(`[autoConfigureNode] Looking for parent of type ${parentTypes[0]} for field ${fieldName}`, {
  parentNode: parentNode?.id
});

console.log(`[getParentConfigurationValue] Getting field ${fieldName} from parent ${parentNode.id}`, {
  parentConfig,
  serviceId: parentNode.data?.serviceId
});
```

### Common Issues

1. **Field Not Auto-Populating**:
   - Check if the resource type has auto-configuration rules
   - Verify parent container exists in hierarchy
   - Ensure parent container has the required configuration field
   - Check if field name matches exactly in rules and configuration

2. **Field Not Disabled**:
   - Verify field is listed in `disabledFields` array
   - Check if `isFieldDisabled` function is called with correct parameters
   - Ensure `useAutoConfiguration` hook is used in the form

3. **Cascading Updates Not Working**:
   - Check if parent-child relationships are correctly established
   - Verify `autoConfigureAffectedNodes` is called when parent configuration changes
   - Ensure configuration store is updated with new values

## Performance Considerations

### Optimization Strategies

1. **Cached Hierarchy**: Container relationships are cached and reused
2. **Incremental Updates**: Only affected nodes are reconfigured
3. **Debounced Updates**: Configuration changes are debounced to prevent excessive updates
4. **Async Processing**: Auto-configuration updates happen asynchronously

### Memory Management

1. **Efficient Data Structures**: Parent-child relationships use Maps for O(1) lookups
2. **Cleanup**: Unused configurations are cleaned up when nodes are deleted
3. **Batch Processing**: Multiple field updates are batched together
4. **Selective Processing**: Only nodes with auto-configuration rules are processed

This comprehensive auto-configuration system provides users with an intelligent, automated way to manage complex AWS resource configurations, significantly reducing manual configuration effort while ensuring consistency across hierarchical cloud architectures.
