# Configuration System

This document covers the comprehensive configuration system that manages AWS resource configurations, including dynamic forms, validation, and auto-configuration features.

## Overview

The configuration system provides a robust interface for managing AWS resource configurations. It includes dynamic form generation, field validation, auto-configuration based on container relationships, and real-time updates.

**Main Components**:
- `components/designer/ConfigurationSidebar.tsx` - Main configuration panel
- `components/designer/configuration_sidebar/` - Individual configuration forms
- `lib/stores/configuration/` - Configuration state management

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
          <ConfigurationForm
            node={selectedNode}
            onUpdate={onNodeUpdate}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
```

### Panel States

#### Empty State
```typescript
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <Settings className="w-12 h-12 mb-4" />
      <p className="text-center">
        Select a node to configure its properties
      </p>
    </div>
  );
}
```

#### Configuration Form State
Dynamic form based on selected node type and service ID.

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

## Individual Configuration Forms

### EC2 Configuration Form

**File**: `components/designer/configuration_sidebar/EC2ConfigurationForm.tsx`

```typescript
export default function EC2ConfigurationForm({ 
  node, 
  onUpdate 
}: ConfigurationFormProps) {
  const { getNodeConfiguration, updateNodeConfiguration } = useArchitectureStore();
  const configuration = getNodeConfiguration(node.id) as EC2Configuration | null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<EC2Configuration>({
    defaultValues: configuration || defaultEC2Configuration,
    resolver: zodResolver(ec2ConfigurationSchema)
  });

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Configuration</h3>
        
        <FormField
          label="Instance Type"
          name="instanceType"
          register={register}
          error={errors.instanceType?.message}
          options={[
            { value: 't3.nano', label: 't3.nano' },
            { value: 't3.micro', label: 't3.micro' },
            { value: 't3.small', label: 't3.small' },
            // ... more instance types
          ]}
        />

        <FormField
          label="AMI ID"
          name="amiId"
          register={register}
          error={errors.amiId?.message}
          placeholder="ami-0c55b159cbfafe1d0"
        />

        <FormField
          label="Key Pair Name"
          name="keyPairName"
          register={register}
          error={errors.keyPairName?.message}
          placeholder="my-key-pair"
        />
      </div>

      {/* Network Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Network Configuration</h3>
        
        <FormField
          label="Availability Zone"
          name="availabilityZone"
          register={register}
          error={errors.availabilityZone?.message}
          disabled={isFieldDisabled('availabilityZone')}
          autoConfigured={isAutoConfigured('availabilityZone')}
        />

        <FormField
          label="Subnet ID"
          name="subnetId"
          register={register}
          error={errors.subnetId?.message}
          disabled={isFieldDisabled('subnetId')}
          autoConfigured={isAutoConfigured('subnetId')}
        />
      </div>

      {/* Storage Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Storage Configuration</h3>
        
        <FormField
          label="Root Volume Size (GB)"
          name="rootVolumeSize"
          type="number"
          register={register}
          error={errors.rootVolumeSize?.message}
        />

        <FormField
          label="Root Volume Type"
          name="rootVolumeType"
          register={register}
          error={errors.rootVolumeType?.message}
          options={[
            { value: 'gp3', label: 'gp3 (General Purpose SSD)' },
            { value: 'gp2', label: 'gp2 (General Purpose SSD)' },
            { value: 'io2', label: 'io2 (Provisioned IOPS SSD)' },
          ]}
        />
      </div>

      {/* Security Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Security Configuration</h3>
        
        <FormField
          label="Security Groups"
          name="securityGroups"
          register={register}
          error={errors.securityGroups?.message}
          multiple
          autoConfigured={isAutoConfigured('securityGroups')}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit" disabled={!isDirty}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
```

### VPC Configuration Form

**File**: `components/designer/configuration_sidebar/VPCConfigurationForm.tsx`

```typescript
export default function VPCConfigurationForm({ 
  node, 
  onUpdate 
}: ConfigurationFormProps) {
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">VPC Configuration</h3>
        
        <FormField
          label="CIDR Block"
          name="cidrBlock"
          register={register}
          error={errors.cidrBlock?.message}
          placeholder="10.0.0.0/16"
        />

        <FormField
          label="Region"
          name="region"
          register={register}
          error={errors.region?.message}
          disabled={isFieldDisabled('region')}
          autoConfigured={isAutoConfigured('region')}
          options={AWS_REGIONS}
        />
      </div>

      {/* DNS Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">DNS Configuration</h3>
        
        <FormField
          label="Enable DNS Support"
          name="enableDnsSupport"
          type="checkbox"
          register={register}
        />

        <FormField
          label="Enable DNS Hostnames"
          name="enableDnsHostnames"
          type="checkbox"
          register={register}
        />
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tags</h3>
        
        <FormField
          label="Tags"
          name="tags"
          register={register}
          error={errors.tags?.message}
          placeholder="Environment=Development,Project=MyApp"
          helpText="Enter tags as key=value pairs, separated by commas"
        />
      </div>
    </form>
  );
}
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
