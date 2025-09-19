# Complete Auto-Configuration Flow Explanation

This document explains the complete flow of how auto-configuration works for any field of any resource configuration in the Darch Architecture Designer system.

## 🔄 **Complete Auto-Configuration Flow**

### **1. Configuration Form Initialization**
```typescript
// Example: SecurityGroupConfigurationForm.tsx
const { nodeId } = useConfigurationContext();
const { isFieldDisabled } = useAutoConfiguration({
  nodeId: nodeId || "",
  resourceType: "aws-security-group",
});
```

**Purpose:** Initialize auto-configuration for a specific node and resource type.

### **2. Auto-Configuration Hook Processing**
```typescript
// hooks/use-auto-configuration.ts
export function useAutoConfiguration({ nodeId, resourceType }) {
  const { convertToReactFlow } = useArchitectureStore();

  // Get current nodes and edges from store
  const { nodes, edges } = convertToReactFlow();

  // Get auto-configuration info for all fields
  const autoConfigInfo = getAutoConfigurationInfo(nodeId, resourceType, nodes, edges);

  // Check if field is disabled based on rules
  const isFieldDisabledCheck = (fieldName: string): boolean => {
    return fieldInfo[fieldName]?.isDisabled || false;
  };
}
```

**Purpose:** Determine which fields should be auto-configured and disabled for user editing.

### **3. Auto-Configuration Rules Lookup**
```typescript
// lib/auto-configuration.ts - Rules Definition
export const AWS_RESOURCE_FIELD_RULES: ResourceFieldRules = {
  "aws-security-group": {
    autoFields: {
      awsVpcId: {
        sourceParentType: "aws-vpc",    // What type of parent to look for
        sourceField: "id",              // What field to get from parent
        // No default value - only set when actually inside VPC
      },
    },
    disabledFields: ["awsVpcId"],       // Fields that should be disabled/auto-managed
  },
  "aws-route-table": {
    autoFields: {
      awsVpcId: {
        sourceParentType: "aws-vpc",
        sourceField: "id",
      },
      awsInternetGatewayId: {
        sourceParentType: "aws-internet-gateway",
        sourceField: "id",
      },
      awsSubnetId: {
        sourceParentType: "aws-private-subnet,aws-public-subnet",
        sourceField: "id",
      },
    },
    disabledFields: ["awsVpcId", "awsInternetGatewayId", "awsSubnetId"],
  },
  // ... other resource rules
};
```

**Purpose:** Define which fields should be auto-configured and where their values come from.

### **4. Field Disability Check**
```typescript
// In the form component
{isFieldDisabled("awsVpcId") && (
  <CollapsibleSection title="Auto Configured Fields">
    <Input
      value={config.awsVpcId || ""}
      disabled={isFieldDisabled("awsVpcId")}  // Field is disabled
    />
  </CollapsibleSection>
)}

// Manual field (when not auto-configured)
{!isFieldDisabled("awsVpcId") && (
  <div className="space-y-2">
    <Label>VPC ID</Label>
    <Input
      value={config.awsVpcId || ""}
      onChange={(e) => handleFieldChange("awsVpcId", e.target.value)}
    />
  </div>
)}
```

**Purpose:** Show fields in different sections based on whether they're auto-configured or manual.

### **5. Relationship Detection & Value Population**
When a node configuration changes or relationships change, the auto-configuration engine runs:

```typescript
// lib/auto-configuration.ts - autoConfigureNode()
export function autoConfigureNode(
  nodeId: string,
  currentConfig: AWSResourceConfiguration,
  nodes: Node[],
  nodeConfigurations: Record<string, AWSResourceConfiguration>,
  resourceType: string,
  edges: Edge[] = []
) {
  // Step A: Get the rules for this resource type
  const rules = AWS_RESOURCE_FIELD_RULES[resourceType];

  // Step B: For each auto-field rule
  for (const [fieldName, rule] of Object.entries(rules.autoFields)) {
    const parentTypes = rule.sourceParentType.split(',').map(type => type.trim());

    // Step C: Find parent via container hierarchy
    const parentNode = findParentOfType(nodeId, parentTypes[0], nodes);

    // Step D: If no parent, try edge connections (for some resources)
    let foundNode = parentNode;
    if (!parentNode && edges.length > 0) {
      const connectedNodes = findConnectedNodesOfTypes(nodeId, parentTypes, nodes, edges);
      if (connectedNodes.length > 0) {
        foundNode = connectedNodes[0];
      }
    }

    // Step E: Get value from found source
    if (foundNode) {
      const value = getParentConfigurationValue(foundNode, rule.sourceField, nodeConfigurations);
      if (value !== undefined && value !== "") {
        updatedConfig[fieldName] = value;  // Auto-populate the field
        autoPopulatedFields.push(fieldName);
      }
    } else {
      // Step F: Clear field if no source found (important for cleanup)
      const currentValue = currentConfig[fieldName];
      if (currentValue !== undefined && currentValue !== "") {
        updatedConfig[fieldName] = "";
        autoPopulatedFields.push(fieldName);
      }
    }
  }
}
```

**Purpose:** Core logic that determines and populates auto-configured field values.

### **6. Parent/Source Value Extraction**
```typescript
// lib/auto-configuration.ts - getParentConfigurationValue()
export function getParentConfigurationValue(parentNode: Node, fieldName: string, nodeConfigurations) {
  const parentConfig = nodeConfigurations[parentNode.id];

  // Special field mappings
  switch (fieldName) {
    case "id":
    case "awsVpcId":
    case "subnetId":
      return parentNode.id;        // Use the node ID as the resource ID

    case "region":
      return parentConfig.region;  // Get specific config field

    case "availabilityZone":
      return parentConfig.availabilityZone;

    default:
      return parentConfig[fieldName]; // Direct field access
  }
}
```

**Purpose:** Extract the correct value from parent/source node configuration.

### **7. Container Hierarchy Detection**
```typescript
// lib/auto-configuration.ts - findParentOfType()
export function findParentOfType(nodeId: string, targetParentType: string, nodes: Node[]): Node | null {
  const hierarchy = getNodeContainerHierarchy(nodeId, nodes);

  return hierarchy.find((parent) => {
    const serviceId = parent.data?.serviceId as string;
    return serviceId === targetParentType;  // Match parent type
  }) || null;
}

// Gets full parent chain: child -> parent -> grandparent -> ...
export function getNodeContainerHierarchy(nodeId: string, nodes: Node[]): Node[] {
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

**Purpose:** Navigate the container hierarchy to find parent relationships.

### **8. Edge Connection Detection** (for advanced cases)
```typescript
// lib/auto-configuration.ts - findConnectedNodesOfTypes()
export function findConnectedNodesOfTypes(nodeId: string, targetNodeTypes: string[], nodes: Node[], edges: Edge[]): Node[] {
  const connectedNodes: Node[] = [];

  // Find all edges connected to this node
  const connectedEdges = edges.filter(
    (edge) => edge.source === nodeId || edge.target === nodeId
  );

  // Get connected node IDs
  const connectedNodeIds = connectedEdges.map((edge) =>
    edge.source === nodeId ? edge.target : edge.source
  );

  // Filter by target types
  for (const connectedNodeId of connectedNodeIds) {
    const connectedNode = nodes.find((node) => node.id === connectedNodeId);
    if (connectedNode) {
      const serviceId = connectedNode.data?.serviceId as string;
      if (serviceId && targetNodeTypes.includes(serviceId)) {
        connectedNodes.push(connectedNode);
      }
    }
  }

  return connectedNodes;
}
```

**Purpose:** Find relationships through edge connections (for resources like Route Tables that connect via edges to IGWs).

### **9. Triggers for Auto-Configuration**

Auto-configuration runs when:

**A. Node Added:**
```typescript
// architecture-store.ts - addNode()
const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
  node.id, nodeConfig, [...allNodes, node], nodeConfigurations, resourceType, allEdges
);
```

**B. Node Position Changed (parent-child relationship change):**
```typescript
// architecture-store.ts - updateNodePosition()
const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
  nodeId, nodeConfig, nodes, nodeConfigurations, resourceType, edges
);
```

**C. Configuration Updated:**
```typescript
// architecture-store.ts - updateNodeConfiguration()
const affectedUpdates = autoConfigureAffectedNodes(
  nodeId, nodes, nodeConfigurations, edges
);
```

**D. Edge Added/Removed:**
```typescript
// architecture-store.ts - addConnection() / removeConnection()
const { updatedConfig, autoPopulatedFields } = autoConfigureNode(
  nodeId, nodeConfig, nodes, nodeConfigurations, resourceType, updatedEdges
);
```

## 🔧 **Specific Example: Security Group in VPC**

### **Scenario:** Security Group placed inside VPC container

1. **User drags Security Group into VPC container**
2. **Position change triggers auto-configuration**
3. **System looks up rules:** `aws-security-group` → `awsVpcId` field
4. **Rule specifies:** `sourceParentType: "aws-vpc"`, `sourceField: "id"`
5. **Hierarchy search:** Finds VPC as immediate parent
6. **Value extraction:** `getParentConfigurationValue(vpcNode, "id")` → returns `vpcNode.id`
7. **Field population:** `securityGroup.awsVpcId = "vpc-123abc"`
8. **Field disabled:** User cannot edit this field (it's auto-managed)
9. **UI updates:** Field shows in "Auto Configured Fields" section

### **The Fix Applied:**
```typescript
// BEFORE (broken):
sourceField: "awsVpcId"  // Would look for parent config.awsVpcId

// AFTER (fixed):
sourceField: "id"        // Gets parentNode.id consistently
```

## 🔧 **Another Example: Route Table with IGW Connection**

### **Scenario:** Route Table connected to Internet Gateway via edge

1. **User draws edge from Route Table to Internet Gateway**
2. **Edge addition triggers auto-configuration**
3. **System looks up rules:** `aws-route-table` → `awsInternetGatewayId` field
4. **Rule specifies:** `sourceParentType: "aws-internet-gateway"`, `sourceField: "id"`
5. **Edge search:** Finds IGW connected via edge (since no parent-child relationship)
6. **Value extraction:** `getParentConfigurationValue(igwNode, "id")` → returns `igwNode.id`
7. **Field population:** `routeTable.awsInternetGatewayId = "igw-456def"`
8. **Field disabled:** User cannot edit this field (it's auto-managed)
9. **UI updates:** Field shows in "Auto Configured Fields" section

### **Priority System:**
For Route Tables, edge connections take priority over parent-child for IGW and Subnet fields:
```typescript
// For Route Table IGW and Subnet fields, prioritize edge connections
const shouldCheckEdgesAlways = nodeResourceType === "aws-route-table" &&
  (fieldName === "awsInternetGatewayId" || fieldName === "awsSubnetId");

if (shouldCheckEdgesAlways) {
  foundNode = connectedNodes[0];  // Use edge connection
  source = "edge";
}
```

## 🎯 **Key Design Principles:**

### **1. Two-Phase System**
- **Phase 1:** Field disability determination (UI rendering)
- **Phase 2:** Value population (data management)

### **2. Multiple Relationship Types**
- **Parent-child containers:** Physical containment (Security Group in VPC)
- **Edge connections:** Logical connections (Route Table to Internet Gateway)

### **3. Automatic Triggers**
- **Position changes:** When nodes are moved into/out of containers
- **Configuration updates:** When parent configurations change
- **Connection changes:** When edges are added/removed

### **4. Consistent Field Mapping**
- **Resource IDs:** Use `sourceField: "id"` → maps to `parentNode.id`
- **Config fields:** Use actual field name → maps to `parentConfig[fieldName]`
- **Special cases:** Handle in `getParentConfigurationValue()` switch statement

### **5. Value Cleanup**
- **No default values:** Prevents sticky/incorrect values
- **Active clearing:** When relationships are removed, clear auto-configured values
- **Immediate updates:** Real-time UI reflection of changes

### **6. Debugging Support**
```typescript
console.log(`[autoConfigureNode] Processing field ${fieldName}`, { rule });
console.log(`[findConnectedNodesOfTypes] Found ${connectedNodes.length} connected nodes`);
```
Extensive logging helps troubleshoot auto-configuration issues.

## 🚀 **Benefits:**

1. **User Experience:** Automatic field population reduces manual configuration errors
2. **Consistency:** Ensures architectural relationships are properly reflected in configurations
3. **Real-time:** Immediate feedback when relationships change
4. **Flexibility:** Supports both container hierarchy and edge-based relationships
5. **Maintainability:** Centralized rules make it easy to add new resource types
6. **Validation:** Auto-configured values are always valid based on actual relationships

This system ensures that AWS resources automatically receive the correct configuration values based on their architectural relationships, making the design process seamless and error-free!

## 📝 **Adding New Resources:**

To add auto-configuration for a new resource:

1. **Define rules** in `AWS_RESOURCE_FIELD_RULES`
2. **Update form** to use `useAutoConfiguration` hook
3. **Add field mapping** in `getParentConfigurationValue()` if needed
4. **Test** parent-child and edge relationships
5. **Update documentation**

Example for new resource:
```typescript
"aws-new-service": {
  autoFields: {
    fieldToAutoConfig: {
      sourceParentType: "aws-parent-service",
      sourceField: "id", // or specific field name
    },
  },
  disabledFields: ["fieldToAutoConfig"],
},
```
