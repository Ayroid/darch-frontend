# Configuration System

This document covers the comprehensive configuration system that manages AWS resource configurations, including dynamic forms, validation, and auto-configuration features.

## Overview

The configuration system provides a robust interface for managing AWS resource configurations. It includes dynamic form generation, field validation, auto-configuration based on container relationships, and real-time updates.

**Main Components**:
- `components/designer/ConfigurationSidebar.tsx` - Main configuration panel
- `components/designer/configuration_sidebar/` - Individual configuration forms
- `lib/stores/configuration/` - Configuration state management
- `hooks/use-auto-configuration.ts` - Auto-configuration hook

## Configuration Sidebar

### Main Component Structure

**File**: `components/designer/ConfigurationSidebar.tsx`

```typescript
export default function ConfigurationSidebar({
  selectedNode,
  isOpen,
  onToggle,
  onNodeUpdate,
}: ConfigurationSidebarProps) {
  return (
    <div className={`fixed top-16 right-0 bg-white border-l border-gray-300 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
        <button onClick={onToggle} className="absolute top-4 right-4">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedNode ? (
          <ConfigurationProvider
            nodeId={selectedNode.id}
            serviceId={selectedNode.data?.serviceId}
          >
            <ConfigurationForm
              node={selectedNode}
              onUpdate={onNodeUpdate}
            />
          </ConfigurationProvider>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
```

## Configuration Forms

### Form Directory Structure

```
components/designer/configuration_sidebar/
├── index.ts                              # Form exports
├── DefaultConfigurationForm.tsx          # Fallback form
├── AWSRegionConfigurationForm.tsx        # AWS Region form
├── AvailabilityZoneConfigurationForm.tsx # Availability Zone form
├── VPCConfigurationForm.tsx              # VPC form
├── EC2ConfigurationForm.tsx              # EC2 form
├── PrivateSubnetConfigurationForm.tsx    # Private Subnet form
├── PublicSubnetConfigurationForm.tsx     # Public Subnet form
└── SecurityGroupConfigurationForm.tsx    # Security Group form
```

### Form Selection Logic

```typescript
const getConfigurationForm = (serviceId: string) => {
  const formMap: Record<string, React.ComponentType<ConfigurationFormProps>> = {
    'aws-region': AWSRegionConfigurationForm,
    'aws-availability-zone': AvailabilityZoneConfigurationForm,
    'aws-vpc': VPCConfigurationForm,
    'aws-ec2': EC2ConfigurationForm,
    'aws-private-subnet': PrivateSubnetConfigurationForm,
    'aws-public-subnet': PublicSubnetConfigurationForm,
    'aws-security-group': SecurityGroupConfigurationForm,
  };

  return formMap[serviceId] || DefaultConfigurationForm;
};
```

## Auto-Configuration Integration

### useAutoConfiguration Hook

All forms integrate with the auto-configuration system using the `useAutoConfiguration` hook:

```typescript
const { isFieldDisabled, getFieldInfo } = useAutoConfiguration({
  nodeId: nodeId || "",
  resourceType: "aws-ec2",
});

// Get auto-configuration info for fields
const regionInfo = getFieldInfo("awsRegionId");
const availabilityZoneInfo = getFieldInfo("awsAvailabilityZone");
const subnetIdInfo = getFieldInfo("subnetId");
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

## Individual Configuration Forms

### EC2 Configuration Form

**File**: `components/designer/configuration_sidebar/EC2ConfigurationForm.tsx`

```typescript
const EC2ConfigurationForm: React.FC<EC2ConfigurationFormProps> = ({
  config,
  onChange,
}) => {
  const { nodeId } = useConfigurationContext();
  const { isFieldDisabled, getFieldInfo } = useAutoConfiguration({
    nodeId: nodeId || "",
    resourceType: "aws-ec2",
  });

  // Get auto-configuration info for fields
  const regionInfo = getFieldInfo("awsRegionId");
  const availabilityZoneInfo = getFieldInfo("awsAvailabilityZone");
  const subnetIdInfo = getFieldInfo("subnetId");

  const handleFieldChange = (field: string, value: unknown) => {
    const updatedConfig = {
      ...config,
      [field]: value,
    };
    onChange(updatedConfig);
  };

  return (
    <div className="space-y-4">
      {/* Basic Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          Basic Configuration
        </h3>

        <div className="space-y-2">
          <Label htmlFor="ec2-name">Instance Name<span className="text-red-600">*</span></Label>
          <Input
            id="ec2-name"
            value={config.awsEc2Id || ""}
            onChange={(e) => handleFieldChange("awsEc2Id", e.target.value)}
            placeholder="Enter EC2 instance name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instanceType">Instance Type<span className="text-red-600">*</span></Label>
          <Select
            value={config.instanceType || ""}
            onValueChange={(value) => handleFieldChange("instanceType", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select instance type" />
            </SelectTrigger>
            <SelectContent>
              {ec2InstanceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Instance Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          Instance Details
        </h3>

        {/* AWS Region Field with Auto-Configuration */}
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

        {/* Availability Zone Field with Auto-Configuration */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="availabilityZone">Availability Zone<span className="text-red-600">*</span></Label>
            {availabilityZoneInfo?.isAutoConfigured && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs">
                    Auto
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Auto-configured from {availabilityZoneInfo.sourceName} ({availabilityZoneInfo.sourceType})</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Input
            id="availabilityZone"
            value={config.awsAvailabilityZone || ""}
            onChange={(e) => handleFieldChange("awsAvailabilityZone", e.target.value)}
            placeholder="e.g., us-east-1a"
            disabled={isFieldDisabled("awsAvailabilityZone")}
          />
          {isFieldDisabled("awsAvailabilityZone") && (
            <p className="text-xs text-muted-foreground">
              This field is automatically configured based on the container hierarchy.
            </p>
          )}
        </div>

        {/* Subnet ID Field with Auto-Configuration */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="subnetId">Subnet ID<span className="text-red-600">*</span></Label>
            {subnetIdInfo?.isAutoConfigured && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs">
                    Auto
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Auto-configured from {subnetIdInfo.sourceName} ({subnetIdInfo.sourceType})</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Input
            id="subnetId"
            value={config.subnetId || ""}
            onChange={(e) => handleFieldChange("subnetId", e.target.value)}
            placeholder="subnet-xxxxxxxxx"
            disabled={isFieldDisabled("subnetId")}
          />
          {isFieldDisabled("subnetId") && (
            <p className="text-xs text-muted-foreground">
              This field is automatically configured based on the container hierarchy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
```

### VPC Configuration Form

**File**: `components/designer/configuration_sidebar/VPCConfigurationForm.tsx`

```typescript
const VPCConfigurationForm: React.FC<VPCConfigurationFormProps> = ({
  config,
  onChange,
}) => {
  const { nodeId } = useConfigurationContext();
  const { isFieldDisabled } = useAutoConfiguration({
    nodeId: nodeId || "",
    resourceType: "aws-vpc",
  });

  const handleFieldChange = (field: string, value: unknown) => {
    const updatedConfig = {
      ...config,
      [field]: value,
    };
    onChange(updatedConfig);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vpc-name">
          VPC Name <span className="text-red-600">*</span>
        </Label>
        <Input
          id="vpc-name"
          placeholder="Enter VPC name"
          value={config.awsVpcId || ""}
          onChange={(e) => handleFieldChange("awsVpcId", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="region">
            AWS Region <span className="text-red-600">*</span>
          </Label>
        </div>
        <div className="relative">
          <Input
            id="region"
            placeholder="Enter AWS region"
            value={config.awsRegionId || ""}
            onChange={(e) => handleFieldChange("awsRegionId", e.target.value)}
            disabled={isFieldDisabled("awsRegionId")}
          />
          {isFieldDisabled("awsRegionId") && (
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
              <AutoConfigurationTooltip parentContainer="Region" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cidr-block">
          CIDR Block <span className="text-red-600">*</span>
        </Label>
        <Input
          id="cidr-block"
          placeholder="10.0.0.0/16"
          value={config.cidrBlock || ""}
          onChange={(e) => handleFieldChange("cidrBlock", e.target.value)}
        />
      </div>
    </div>
  );
};
```

## Configuration State Management

### Configuration Store

**File**: `lib/stores/configuration/configuration-store.ts`

```typescript
interface ConfigurationState {
  // Current node being configured
  selectedNodeId: string | null;

  // Configuration data for each node (nodeId -> config)
  nodeConfigurations: Record<string, AWSResourceConfiguration>;

  // Temporary/draft state for forms
  draftConfiguration: AWSResourceConfiguration | null;
}

interface ConfigurationActions {
  // Node selection
  setSelectedNode: (nodeId: string | null) => void;

  // Configuration management
  initializeNodeConfiguration: (nodeId: string, serviceId: string) => void;
  setNodeConfiguration: (nodeId: string, config: AWSResourceConfiguration) => void;
  getNodeConfiguration: (nodeId: string) => AWSResourceConfiguration | undefined;
  updateNodeConfiguration: (nodeId: string, updates: Partial<AWSResourceConfiguration>) => void;
  deleteNodeConfiguration: (nodeId: string) => void;

  // Draft state for form editing
  setDraftConfiguration: (config: AWSResourceConfiguration) => void;
  clearDraftConfiguration: () => void;
  commitDraftConfiguration: (nodeId: string) => void;

  // Bulk operations
  clearAllConfigurations: () => void;
  importConfigurations: (configurations: Record<string, AWSResourceConfiguration>) => void;
  exportConfigurations: () => Record<string, AWSResourceConfiguration>;
}
```

### Configuration Context

**File**: `lib/stores/configuration-context.tsx`

```typescript
interface ConfigurationContextValue {
  nodeId: string | null;
  serviceId: string | null;
}

const ConfigurationContext = createContext<ConfigurationContextValue>({
  nodeId: null,
  serviceId: null,
});

export const useConfigurationContext = () => {
  return useContext(ConfigurationContext);
};

export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({
  nodeId,
  serviceId,
  children,
}) => {
  return (
    <ConfigurationContext.Provider value={{ nodeId, serviceId }}>
      {children}
    </ConfigurationContext.Provider>
  );
};
```

## Default Configurations

**File**: `lib/stores/configuration/default-configurations.ts`

```typescript
export const defaultConfigurations: Record<string, AWSResourceConfiguration> = {
  "aws-vpc": {
    awsVpcId: "VPC",
    cidrBlock: "10.0.0.0/16",
    awsRegionId: "us-east-1",
    enableDnsSupport: true,
    enableDnsHostnames: true,
    tags: "Environment=Development",
  } as VPCConfiguration,

  "aws-ec2": {
    awsEc2Id: "EC2",
    instanceType: "t3.micro",
    amiId: "ami-0c55b159cbfafe1d0",
    keyPairName: "",
    awsRegionId: "us-east-1",
    awsAvailabilityZone: "us-east-1a",
    subnetId: "",
    securityGroups: [],
    rootVolumeSize: 8,
    rootVolumeType: "gp3",
    deleteOnTermination: true,
    encrypted: false,
    detailedMonitoring: false,
    terminationProtection: false,
    autoRecovery: true,
    associatePublicIpAddress: false,
    tenancy: "default",
    tags: {},
  } as EC2Configuration,

  "aws-region": {
    awsRegionId: "AWS Region",
    region: "us-east-1",
    regionName: "US East (N. Virginia)",
    description: "",
    isEnabled: true,
    isDefault: true,
    tags: "Type=Region",
  } as AWSRegionConfiguration,

  "aws-availability-zone": {
    awsAvailabilityZoneId: "Availability Zone",
    awsRegionId: "us-east-1",
    availabilityZone: "us-east-1a",
    description: "",
    isEnabled: true,
    isPreferred: false,
    tags: "Type=AvailabilityZone",
  } as AvailabilityZoneConfiguration,

  // ... more default configurations
};
```

## Auto-Configuration System

### Auto-Configuration Logic

**File**: `lib/auto-configuration.ts`

The auto-configuration system automatically populates form fields based on container relationships:

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
  const rules = AWS_RESOURCE_FIELD_RULES[resourceType];

  if (!rules) {
    return { updatedConfig: currentConfig, autoPopulatedFields: [] };
  }

  const updatedConfig = { ...currentConfig };
  const autoPopulatedFields: string[] = [];

  // Process each auto field rule
  for (const [fieldName, rule] of Object.entries(rules.autoFields)) {
    const parentTypes = rule.sourceParentType.split(',').map(type => type.trim());

    // Find parent of specified type
    const parentNode = findParentOfType(nodeId, parentTypes[0], nodes);
    if (parentNode) {
      const value = getParentConfigurationValue(parentNode, rule.sourceField, nodeConfigurations);
      if (value !== undefined && value !== "") {
        (updatedConfig as Record<string, unknown>)[fieldName] = value;
        autoPopulatedFields.push(fieldName);
      }
    }
  }

  return { updatedConfig, autoPopulatedFields };
}
```

### Auto-Configuration Rules

```typescript
export const AWS_RESOURCE_FIELD_RULES: ResourceFieldRules = {
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
    },
    disabledFields: ["region", "availabilityZone", "subnetId"],
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
  // ... more rules
};
```

### Field Disabling Logic

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

  const fieldRule = rules.autoFields[fieldName];
  if (!fieldRule) return false;

  const parentNode = findParentOfType(nodeId, fieldRule.sourceParentType, nodes);
  return !!parentNode;
}
```

## Form Components

### FormField Component

```typescript
interface FormFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'checkbox' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  autoConfigured?: boolean;
  multiple?: boolean;
  helpText?: string;
}

export function FormField({
  label,
  name,
  register,
  error,
  type = 'text',
  placeholder,
  options,
  disabled = false,
  autoConfigured = false,
  multiple = false,
  helpText
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {autoConfigured && (
          <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            Auto-configured
          </span>
        )}
      </label>

      {type === 'select' ? (
        <select
          {...register(name)}
          disabled={disabled}
          className={`w-full p-2 border rounded-md ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
          multiple={multiple}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <input
          type="checkbox"
          {...register(name)}
          disabled={disabled}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-2 border rounded-md ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
```

## Validation System

### Zod Schema Validation

**File**: `lib/types/aws-resources.ts`

```typescript
import { z } from 'zod';

export const ec2ConfigurationSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  instanceType: z.string().min(1, "Instance type is required"),
  amiId: z.string().regex(/^ami-[a-z0-9]+$/, "Invalid AMI ID format"),
  keyPairName: z.string().optional(),
  availabilityZone: z.string().min(1, "Availability zone is required"),
  subnetId: z.string().optional(),
  securityGroups: z.array(z.string()).optional(),
  rootVolumeSize: z.number().min(1, "Volume size must be at least 1 GB").max(16384, "Volume size cannot exceed 16 TB"),
  rootVolumeType: z.enum(['gp3', 'gp2', 'io2', 'io1', 'st1', 'sc1']),
  deleteOnTermination: z.boolean(),
  encrypted: z.boolean(),
  detailedMonitoring: z.boolean(),
  terminationProtection: z.boolean(),
  autoRecovery: z.boolean(),
  associatePublicIpAddress: z.boolean(),
  tenancy: z.enum(['default', 'dedicated', 'host']),
  tags: z.record(z.string()).optional(),
});

export const vpcConfigurationSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  cidrBlock: z.string().regex(
    /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,
    "Invalid CIDR block format"
  ),
  region: z.string().min(1, "Region is required"),
  enableDnsSupport: z.boolean(),
  enableDnsHostnames: z.boolean(),
  tags: z.string().optional(),
});
```

### Real-time Validation

```typescript
const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: { errors, isDirty, isValid }
} = useForm<ConfigurationType>({
  defaultValues: configuration || defaultConfiguration,
  resolver: zodResolver(configurationSchema),
  mode: 'onChange' // Enable real-time validation
});
```

## Configuration Store Integration

### Store Updates

```typescript
const handleFormSubmit = useCallback((data: ConfigurationType) => {
  try {
    updateNodeConfiguration(node.id, data);
    onUpdate?.(node.id, data);

    // Show success notification
    toast.success('Configuration updated successfully');
  } catch (error) {
    console.error('Failed to update configuration:', error);
    toast.error('Failed to update configuration');
  }
}, [node.id, updateNodeConfiguration, onUpdate]);
```

### Configuration Persistence

The configuration system automatically persists changes to:
1. **Architecture Store**: For architecture data
2. **Local Storage**: Via Zustand persistence
3. **Real-time Updates**: Canvas reflects changes immediately

## Visual Indicators

### Auto-configured Fields

```typescript
{autoConfigured && (
  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
    Auto-configured
  </span>
)}
```

### Disabled Fields

```typescript
className={`w-full p-2 border rounded-md ${
  disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
} ${error ? 'border-red-500' : 'border-gray-300'}`}
```

### Validation Errors

```typescript
{error && (
  <p className="text-sm text-red-600">{error}</p>
)}
```

## Configuration Data Types

### AWS Resource Configuration Types

```typescript
// Base configuration interface
export interface AWSResourceConfiguration {
  serviceName: string;
  serviceId: string;
  resourceType: string;
  [key: string]: unknown;
}

// Specific configuration types
export interface EC2Configuration extends AWSResourceConfiguration {
  instanceType: string;
  amiId: string;
  keyPairName?: string;
  availabilityZone: string;
  subnetId?: string;
  securityGroups?: string[];
  rootVolumeSize: number;
  rootVolumeType: string;
  // ... additional fields
}

export interface VPCConfiguration extends AWSResourceConfiguration {
  cidrBlock: string;
  region: string;
  enableDnsSupport: boolean;
  enableDnsHostnames: boolean;
  tags?: string;
}
```

## Performance Optimizations

### Form Optimization

1. **Memoized Components**: Form components use React.memo
2. **Debounced Validation**: Real-time validation with debouncing
3. **Selective Updates**: Only update changed fields
4. **Lazy Loading**: Forms load only when needed

### Store Optimization

1. **Selective Subscriptions**: Components subscribe only to needed configuration data
2. **Batched Updates**: Multiple field updates batched together
3. **Normalized State**: Configuration state stored in normalized form

This comprehensive configuration system provides users with a powerful, intuitive interface for managing AWS resource configurations with automatic field population, real-time validation, and seamless integration with the canvas system.
