/**
 * Resource Configuration Schemas
 *
 * Defines the form structure for each AWS resource type.
 * Used by DynamicConfigurationForm for schema-based form generation.
 */

export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'textarea'
  | 'cidr'
  | 'array';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  default?: unknown;
  options?: FieldOption[] | string[]; // For select fields
  autoConfigurable?: boolean; // Can be auto-configured from parent/connections
  autoConfigParent?: string; // Parent container type that provides this value
  min?: number; // For number fields
  max?: number; // For number fields
  section?: string; // Group fields into sections
}

export interface SectionDefinition {
  id: string;
  title: string;
  icon?: string;
  defaultOpen?: boolean;
}

export interface ResourceSchema {
  resourceType: string;
  displayName: string;
  sections: SectionDefinition[];
  fields: FieldDefinition[];
}

// Common sections used across resources
const COMMON_SECTIONS = {
  autoConfig: {
    id: 'auto-config',
    title: 'Auto Configured Fields',
    icon: 'TbSettingsSpark',
    defaultOpen: true,
  },
  basic: {
    id: 'basic',
    title: 'Basic Configuration',
    icon: 'TbSettings',
    defaultOpen: true,
  },
  network: {
    id: 'network',
    title: 'Network Configuration',
    icon: 'FiGlobe',
    defaultOpen: true,
  },
  storage: {
    id: 'storage',
    title: 'Storage Configuration',
    icon: 'FiDatabase',
    defaultOpen: false,
  },
  advanced: {
    id: 'advanced',
    title: 'Advanced Settings',
    icon: 'TbSettings',
    defaultOpen: false,
  },
  tags: {
    id: 'tags',
    title: 'Tags',
    icon: 'TbSettings',
    defaultOpen: false,
  },
};

// VPC Schema
export const VPC_SCHEMA: ResourceSchema = {
  resourceType: 'aws-vpc',
  displayName: 'VPC',
  sections: [
    COMMON_SECTIONS.autoConfig,
    COMMON_SECTIONS.network,
    COMMON_SECTIONS.tags,
  ],
  fields: [
    {
      name: 'region',
      label: 'AWS Region',
      type: 'text',
      required: true,
      placeholder: 'e.g., us-east-1',
      autoConfigurable: true,
      autoConfigParent: 'Region',
      section: 'auto-config',
    },
    {
      name: 'cidr_block',
      label: 'CIDR Block',
      type: 'cidr',
      required: true,
      placeholder: '10.0.0.0/16',
      section: 'network',
    },
    {
      name: 'enable_dns_support',
      label: 'Enable DNS Support',
      type: 'boolean',
      default: true,
      section: 'advanced',
    },
    {
      name: 'enable_dns_hostnames',
      label: 'Enable DNS Hostnames',
      type: 'boolean',
      default: false,
      section: 'advanced',
    },
    {
      name: 'instance_tenancy',
      label: 'Instance Tenancy',
      type: 'select',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'dedicated', label: 'Dedicated' },
      ],
      default: 'default',
      section: 'advanced',
    },
  ],
};

// EC2 Schema
export const EC2_SCHEMA: ResourceSchema = {
  resourceType: 'aws-ec2',
  displayName: 'EC2 Instance',
  sections: [
    COMMON_SECTIONS.autoConfig,
    COMMON_SECTIONS.basic,
    { id: 'instance', title: 'Instance Details', icon: 'FiCpu', defaultOpen: true },
    COMMON_SECTIONS.storage,
    COMMON_SECTIONS.tags,
  ],
  fields: [
    // Auto-configured fields
    {
      name: 'region',
      label: 'AWS Region',
      type: 'text',
      required: true,
      autoConfigurable: true,
      autoConfigParent: 'Region',
      section: 'auto-config',
    },
    {
      name: 'availability_zone',
      label: 'Availability Zone',
      type: 'text',
      required: true,
      autoConfigurable: true,
      autoConfigParent: 'Availability Zone',
      section: 'auto-config',
    },
    {
      name: 'subnet_id',
      label: 'Subnet ID',
      type: 'text',
      required: true,
      placeholder: 'e.g., subnet-12345678',
      autoConfigurable: true,
      autoConfigParent: 'Subnet',
      section: 'auto-config',
    },
    {
      name: 'security_groups',
      label: 'Security Groups',
      type: 'array',
      required: true,
      placeholder: 'sg-12345678, sg-87654321',
      autoConfigurable: true,
      autoConfigParent: 'Security Group',
      section: 'auto-config',
    },
    // Basic configuration
    {
      name: 'instance_type',
      label: 'Instance Type',
      type: 'select',
      required: true,
      placeholder: 'Select instance type',
      options: [
        't2.micro', 't2.small', 't2.medium', 't2.large',
        't3.micro', 't3.small', 't3.medium', 't3.large',
        'm5.large', 'm5.xlarge', 'm5.2xlarge',
        'c5.large', 'c5.xlarge', 'c5.2xlarge',
      ],
      section: 'basic',
    },
    {
      name: 'ami_id',
      label: 'AMI ID',
      type: 'text',
      required: true,
      placeholder: 'e.g., ami-0abcdef1234567890',
      section: 'basic',
    },
    {
      name: 'key_pair_name',
      label: 'Key Pair Name',
      type: 'text',
      placeholder: 'e.g., my-key-pair',
      section: 'basic',
    },
    // Instance details
    {
      name: 'iam_instance_profile',
      label: 'IAM Instance Profile',
      type: 'text',
      required: true,
      placeholder: 'e.g., EC2-Instance-Profile',
      section: 'instance',
    },
    // Storage
    {
      name: 'root_volume_size',
      label: 'Root Volume Size (GB)',
      type: 'number',
      required: true,
      default: 8,
      min: 8,
      max: 16384,
      section: 'storage',
    },
    {
      name: 'root_volume_type',
      label: 'Root Volume Type',
      type: 'select',
      required: true,
      options: [
        { value: 'gp3', label: 'GP3' },
        { value: 'gp2', label: 'GP2' },
        { value: 'io1', label: 'IO1' },
        { value: 'io2', label: 'IO2' },
        { value: 'st1', label: 'ST1' },
        { value: 'sc1', label: 'SC1' },
        { value: 'standard', label: 'Standard' },
      ],
      default: 'gp3',
      section: 'storage',
    },
  ],
};

// Subnet Schema
export const SUBNET_SCHEMA: ResourceSchema = {
  resourceType: 'aws-subnet',
  displayName: 'Subnet',
  sections: [
    COMMON_SECTIONS.autoConfig,
    COMMON_SECTIONS.network,
    COMMON_SECTIONS.tags,
  ],
  fields: [
    {
      name: 'region',
      label: 'AWS Region',
      type: 'text',
      required: true,
      autoConfigurable: true,
      autoConfigParent: 'Region',
      section: 'auto-config',
    },
    {
      name: 'vpc_id',
      label: 'VPC ID',
      type: 'text',
      required: true,
      autoConfigurable: true,
      autoConfigParent: 'VPC',
      section: 'auto-config',
    },
    {
      name: 'availability_zone',
      label: 'Availability Zone',
      type: 'text',
      required: true,
      autoConfigurable: true,
      autoConfigParent: 'Availability Zone',
      section: 'auto-config',
    },
    {
      name: 'subnet_type',
      label: 'Subnet Type',
      type: 'select',
      required: true,
      options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
      ],
      section: 'network',
    },
    {
      name: 'cidr_block',
      label: 'CIDR Block',
      type: 'cidr',
      required: true,
      placeholder: '10.0.1.0/24',
      section: 'network',
    },
    {
      name: 'map_public_ip_on_launch',
      label: 'Auto-assign Public IP',
      type: 'boolean',
      default: false,
      description: 'Automatically assign public IP addresses to instances launched in this subnet',
      section: 'network',
    },
  ],
};

// Security Group Schema
export const SECURITY_GROUP_SCHEMA: ResourceSchema = {
  resourceType: 'aws-security-group',
  displayName: 'Security Group',
  sections: [
    COMMON_SECTIONS.autoConfig,
    COMMON_SECTIONS.basic,
    { id: 'rules', title: 'Security Rules', icon: 'FiShield', defaultOpen: true },
    COMMON_SECTIONS.tags,
  ],
  fields: [
    {
      name: 'vpc_id',
      label: 'VPC ID',
      type: 'text',
      required: true,
      autoConfigurable: true,
      autoConfigParent: 'VPC',
      section: 'auto-config',
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., web-server-sg',
      section: 'basic',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Security group description',
      section: 'basic',
    },
  ],
};

// Internet Gateway Schema
export const INTERNET_GATEWAY_SCHEMA: ResourceSchema = {
  resourceType: 'aws-internet-gateway',
  displayName: 'Internet Gateway',
  sections: [
    COMMON_SECTIONS.autoConfig,
    COMMON_SECTIONS.basic,
    COMMON_SECTIONS.tags,
  ],
  fields: [
    {
      name: 'vpc_id',
      label: 'VPC ID',
      type: 'text',
      autoConfigurable: true,
      autoConfigParent: 'VPC',
      section: 'auto-config',
    },
  ],
};

// NAT Gateway Schema
export const NAT_GATEWAY_SCHEMA: ResourceSchema = {
  resourceType: 'aws-nat-gateway',
  displayName: 'NAT Gateway',
  sections: [
    COMMON_SECTIONS.autoConfig,
    COMMON_SECTIONS.basic,
    COMMON_SECTIONS.tags,
  ],
  fields: [
    {
      name: 'subnet_id',
      label: 'Subnet ID',
      type: 'text',
      required: true,
      placeholder: 'e.g., subnet-12345678',
      autoConfigurable: true,
      autoConfigParent: 'Public Subnet',
      section: 'auto-config',
    },
    {
      name: 'connectivity_type',
      label: 'Connectivity Type',
      type: 'select',
      options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
      ],
      default: 'public',
      section: 'basic',
    },
    {
      name: 'allocation_id',
      label: 'Elastic IP Allocation ID',
      type: 'text',
      placeholder: 'e.g., eipalloc-12345678',
      description: 'Required for public NAT Gateway',
      section: 'basic',
    },
    {
      name: 'create_eip',
      label: 'Create Elastic IP',
      type: 'boolean',
      default: true,
      description: 'Automatically create an Elastic IP for the NAT Gateway',
      section: 'basic',
    },
  ],
};

// Route Table Schema
export const ROUTE_TABLE_SCHEMA: ResourceSchema = {
  resourceType: 'aws-route-table',
  displayName: 'Route Table',
  sections: [
    COMMON_SECTIONS.autoConfig,
    COMMON_SECTIONS.basic,
    { id: 'routes', title: 'Routes', icon: 'FiGitBranch', defaultOpen: true },
    COMMON_SECTIONS.tags,
  ],
  fields: [
    {
      name: 'vpc_id',
      label: 'VPC ID',
      type: 'text',
      required: true,
      autoConfigurable: true,
      autoConfigParent: 'VPC',
      section: 'auto-config',
    },
    {
      name: 'subnet_id',
      label: 'Associated Subnet',
      type: 'text',
      placeholder: 'e.g., subnet-12345678',
      section: 'basic',
    },
    {
      name: 'internet_gateway_id',
      label: 'Internet Gateway',
      type: 'text',
      placeholder: 'e.g., igw-12345678',
      description: 'For public route tables',
      section: 'basic',
    },
  ],
};

// Default Schema for unknown resources
export const DEFAULT_SCHEMA: ResourceSchema = {
  resourceType: 'default',
  displayName: 'Resource',
  sections: [
    COMMON_SECTIONS.basic,
    COMMON_SECTIONS.tags,
  ],
  fields: [
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter description',
      section: 'basic',
    },
  ],
};

// Schema registry
export const RESOURCE_SCHEMAS: Record<string, ResourceSchema> = {
  'aws-vpc': VPC_SCHEMA,
  'aws-ec2': EC2_SCHEMA,
  'aws-subnet': SUBNET_SCHEMA,
  'aws-public-subnet': SUBNET_SCHEMA,
  'aws-private-subnet': SUBNET_SCHEMA,
  'aws-security-group': SECURITY_GROUP_SCHEMA,
  'aws-internet-gateway': INTERNET_GATEWAY_SCHEMA,
  'aws-nat-gateway': NAT_GATEWAY_SCHEMA,
  'aws-route-table': ROUTE_TABLE_SCHEMA,
};

/**
 * Get schema for a resource type
 */
export function getResourceSchema(resourceType: string): ResourceSchema {
  const normalizedType = resourceType.toLowerCase().startsWith('aws-')
    ? resourceType.toLowerCase()
    : `aws-${resourceType.toLowerCase()}`;

  return RESOURCE_SCHEMAS[normalizedType] || DEFAULT_SCHEMA;
}

/**
 * Get fields for a specific section
 */
export function getFieldsForSection(schema: ResourceSchema, sectionId: string): FieldDefinition[] {
  return schema.fields.filter(field => field.section === sectionId);
}

/**
 * Check if a resource has auto-configurable fields
 */
export function hasAutoConfigurableFields(schema: ResourceSchema): boolean {
  return schema.fields.some(field => field.autoConfigurable);
}
