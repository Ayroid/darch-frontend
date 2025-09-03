# Type System and Interfaces

This document covers the comprehensive TypeScript type system that provides type safety, interface definitions, and data structures throughout the application, ensuring robust development and runtime reliability.

## Overview

The type system defines all data structures, interfaces, and type definitions used throughout the application. It provides compile-time type checking, IntelliSense support, and runtime validation when combined with Zod schemas.

**Main Types Location**: `lib/types/`

**Key Type Files**:
- Architecture types (`lib/types/architecture.ts`)
- AWS resource types (`lib/types/aws-resources.ts`)
- Canvas and UI types
- Form and validation types

## Core Architecture Types

### Architecture Data Structure

**File**: `lib/types/architecture.ts`

```typescript
/**
 * Main architecture data structure containing all design information
 */
export interface ArchitectureData {
  metadata: ArchitectureMetadata;
  nodes: ArchitectureNode[];
  connections: NodeConnection[];
  variables: Record<string, unknown>;
  outputs: Record<string, unknown>;
}

/**
 * Metadata information about the architecture
 */
export interface ArchitectureMetadata {
  /** Unique name for the architecture */
  name: string;
  
  /** Optional description */
  description?: string;
  
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last modification timestamp */
  lastModified: string;
  
  /** Cloud provider */
  provider: CloudProvider;
  
  /** Author information */
  author?: string;
  
  /** License information */
  license?: string;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Architecture complexity level */
  complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';
  
  /** Estimated monthly cost (if calculated) */
  estimatedCost?: {
    amount: number;
    currency: string;
    period: 'monthly' | 'yearly';
  };
}

/**
 * Individual node in the architecture
 */
export interface ArchitectureNode {
  /** Unique identifier for the node */
  id: string;
  
  /** Type of node (service or container) */
  nodeType: NodeType;
  
  /** AWS service type identifier */
  serviceType: string;
  
  /** Display name for the node */
  name: string;
  
  /** Icon path or URL */
  icon: string;
  
  /** Position on canvas */
  position: Position;
  
  /** Dimensions for container nodes */
  dimensions?: Dimensions;
  
  /** Service-specific configuration */
  configuration: AWSResourceConfiguration;
  
  /** Whether this node can contain other nodes */
  isContainer: boolean;
  
  /** Parent container ID (if any) */
  parentId?: string;
  
  /** Custom styling */
  style?: NodeStyle;
  
  /** Whether the node is currently selected */
  selected?: boolean;
  
  /** Whether the node is locked from editing */
  locked?: boolean;
  
  /** Custom data for extensions */
  customData?: Record<string, unknown>;
}

/**
 * Connection between two nodes
 */
export interface NodeConnection {
  /** Unique identifier for the connection */
  id: string;
  
  /** Source node ID */
  source: string;
  
  /** Target node ID */
  target: string;
  
  /** Source connection handle */
  sourceHandle?: string;
  
  /** Target connection handle */
  targetHandle?: string;
  
  /** Connection type for styling */
  type: ConnectionType;
  
  /** Connection label */
  label?: string;
  
  /** Custom styling */
  style?: ConnectionStyle;
  
  /** Whether the connection is bidirectional */
  bidirectional?: boolean;
  
  /** Connection protocol or type */
  protocol?: 'http' | 'https' | 'tcp' | 'udp' | 'icmp' | 'custom';
  
  /** Port information */
  port?: number | string;
  
  /** Custom data */
  data?: Record<string, unknown>;
}

/**
 * Basic geometric types
 */
export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Bounds extends Position, Dimensions {}

/**
 * Styling types
 */
export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  width?: number;
  height?: number;
  zIndex?: number;
}

export interface ConnectionStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  animated?: boolean;
}

/**
 * Enum-like types
 */
export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'multi-cloud';

export type NodeType = 'awsService' | 'awsContainer' | 'customService' | 'customContainer';

export type ConnectionType = 
  | 'smoothstep' 
  | 'straight' 
  | 'step' 
  | 'simplebezier'
  | 'custom';

/**
 * Export and import related types
 */
export interface ExportOptions {
  format: 'json' | 'yaml' | 'terraform' | 'cloudformation';
  includeMetadata: boolean;
  includeConfiguration: boolean;
  includePositions: boolean;
  minify: boolean;
}

export interface ImportResult {
  data: ArchitectureData;
  warnings: string[];
  errors: string[];
  compatibility: 'full' | 'partial' | 'limited';
}

/**
 * Version compatibility
 */
export interface VersionInfo {
  current: string;
  minimum: string;
  maximum: string;
  deprecated?: string[];
  breaking?: string[];
}

/**
 * Architecture statistics
 */
export interface ArchitectureStats {
  nodeCount: number;
  connectionCount: number;
  containerCount: number;
  serviceCount: number;
  depth: number;
  complexity: number;
  estimatedCost?: number;
  lastModified: string;
  size: {
    width: number;
    height: number;
  };
}
```

## AWS Resource Types

### AWS Configuration Types

**File**: `lib/types/aws-resources.ts`

```typescript
/**
 * Base configuration interface for all AWS resources
 */
export interface AWSResourceConfiguration {
  /** Service name/identifier */
  serviceName: string;
  
  /** AWS service ID */
  serviceId: string;
  
  /** Resource type */
  resourceType: string;
  
  /** AWS region */
  region?: string;
  
  /** Resource tags */
  tags?: Record<string, string>;
  
  /** Resource description */
  description?: string;
  
  /** Whether the resource is enabled */
  enabled?: boolean;
  
  /** Custom configuration data */
  [key: string]: unknown;
}

/**
 * AWS Region configuration
 */
export interface AWSRegionConfiguration extends AWSResourceConfiguration {
  resourceType: 'aws-region';
  
  /** AWS region code */
  region: AWSRegion;
  
  /** Human-readable region name */
  regionName: string;
  
  /** Whether this is the default region */
  isDefault?: boolean;
}

/**
 * VPC configuration
 */
export interface VPCConfiguration extends AWSResourceConfiguration {
  resourceType: 'aws-vpc';
  
  /** VPC CIDR block */
  cidrBlock: string;
  
  /** Enable DNS support */
  enableDnsSupport: boolean;
  
  /** Enable DNS hostnames */
  enableDnsHostnames: boolean;
  
  /** Instance tenancy */
  tenancy: 'default' | 'dedicated';
  
  /** VPC ID (if existing) */
  vpcId?: string;
  
  /** Associated DHCP options set */
  dhcpOptionsId?: string;
  
  /** VPC endpoints */
  endpoints?: VPCEndpoint[];
}

/**
 * Subnet configuration
 */
export interface SubnetConfiguration extends AWSResourceConfiguration {
  resourceType: 'aws-subnet';
  
  /** Subnet CIDR block */
  cidrBlock: string;
  
  /** Availability zone */
  availabilityZone: string;
  
  /** Parent VPC ID */
  vpcId: string;
  
  /** Whether subnet is public */
  isPublic: boolean;
  
  /** Map public IP on launch */
  mapPublicIpOnLaunch: boolean;
  
  /** Associated route table */
  routeTableId?: string;
  
  /** Associated network ACL */
  networkAclId?: string;
}

/**
 * EC2 Instance configuration
 */
export interface EC2Configuration extends AWSResourceConfiguration {
  resourceType: 'aws-ec2';
  
  /** Instance type */
  instanceType: EC2InstanceType;
  
  /** AMI ID */
  amiId: string;
  
  /** Key pair name */
  keyName: string;
  
  /** Subnet ID */
  subnetId: string;
  
  /** Security group IDs */
  securityGroupIds: string[];
  
  /** User data script */
  userData?: string;
  
  /** IAM instance profile */
  iamInstanceProfile?: string;
  
  /** Monitoring enabled */
  monitoring: boolean;
  
  /** Termination protection */
  terminationProtection: boolean;
  
  /** EBS optimized */
  ebsOptimized: boolean;
  
  /** Root volume configuration */
  rootVolume: EBSVolumeConfiguration;
  
  /** Additional EBS volumes */
  additionalVolumes?: EBSVolumeConfiguration[];
  
  /** Network interfaces */
  networkInterfaces?: NetworkInterface[];
  
  /** Auto-recovery enabled */
  autoRecovery?: boolean;
  
  /** Placement configuration */
  placement?: PlacementConfiguration;
}

/**
 * Security Group configuration
 */
export interface SecurityGroupConfiguration extends AWSResourceConfiguration {
  resourceType: 'aws-security-group';
  
  /** VPC ID */
  vpcId: string;
  
  /** Ingress rules */
  ingressRules: SecurityGroupRule[];
  
  /** Egress rules */
  egressRules: SecurityGroupRule[];
  
  /** Security group ID (if existing) */
  securityGroupId?: string;
}

/**
 * Security Group rule
 */
export interface SecurityGroupRule {
  /** Protocol */
  protocol: 'tcp' | 'udp' | 'icmp' | 'all';
  
  /** Port number (for single port) */
  port?: number;
  
  /** Port range */
  portRange?: {
    from: number;
    to: number;
  };
  
  /** Source/destination type */
  sourceType: 'cidr' | 'securityGroup' | 'prefixList';
  
  /** Source/destination value */
  source: string;
  
  /** Rule description */
  description?: string;
}

/**
 * EBS Volume configuration
 */
export interface EBSVolumeConfiguration {
  /** Volume type */
  volumeType: 'gp2' | 'gp3' | 'io1' | 'io2' | 'st1' | 'sc1';
  
  /** Volume size in GB */
  size: number;
  
  /** IOPS (for provisioned IOPS volumes) */
  iops?: number;
  
  /** Throughput (for gp3 volumes) */
  throughput?: number;
  
  /** Encryption enabled */
  encrypted: boolean;
  
  /** KMS key ID for encryption */
  kmsKeyId?: string;
  
  /** Delete on termination */
  deleteOnTermination: boolean;
  
  /** Device name */
  deviceName?: string;
  
  /** Snapshot ID (for restore) */
  snapshotId?: string;
}

/**
 * Network Interface configuration
 */
export interface NetworkInterface {
  /** Device index */
  deviceIndex: number;
  
  /** Subnet ID */
  subnetId: string;
  
  /** Security group IDs */
  securityGroupIds: string[];
  
  /** Private IP address */
  privateIpAddress?: string;
  
  /** Associate public IP */
  associatePublicIp: boolean;
  
  /** Delete on termination */
  deleteOnTermination: boolean;
  
  /** Description */
  description?: string;
}

/**
 * Placement configuration
 */
export interface PlacementConfiguration {
  /** Availability zone */
  availabilityZone?: string;
  
  /** Placement group */
  groupName?: string;
  
  /** Host ID (for dedicated hosts) */
  hostId?: string;
  
  /** Tenancy */
  tenancy?: 'default' | 'dedicated' | 'host';
  
  /** Spread domain */
  spreadDomain?: string;
  
  /** Host resource group ARN */
  hostResourceGroupArn?: string;
  
  /** Partition number */
  partitionNumber?: number;
}

/**
 * VPC Endpoint configuration
 */
export interface VPCEndpoint {
  /** Service name */
  serviceName: string;
  
  /** Endpoint type */
  type: 'Gateway' | 'Interface';
  
  /** Associated subnets (for interface endpoints) */
  subnetIds?: string[];
  
  /** Security group IDs (for interface endpoints) */
  securityGroupIds?: string[];
  
  /** Route table IDs (for gateway endpoints) */
  routeTableIds?: string[];
  
  /** Policy document */
  policyDocument?: string;
  
  /** Private DNS enabled */
  privateDnsEnabled?: boolean;
}

/**
 * RDS configuration
 */
export interface RDSConfiguration extends AWSResourceConfiguration {
  resourceType: 'aws-rds';
  
  /** Database engine */
  engine: 'mysql' | 'postgres' | 'oracle' | 'sqlserver' | 'aurora' | 'aurora-mysql' | 'aurora-postgresql';
  
  /** Engine version */
  engineVersion: string;
  
  /** Instance class */
  instanceClass: RDSInstanceClass;
  
  /** Database name */
  databaseName: string;
  
  /** Master username */
  masterUsername: string;
  
  /** Master password */
  masterPassword?: string;
  
  /** Allocated storage (GB) */
  allocatedStorage: number;
  
  /** Storage type */
  storageType: 'gp2' | 'gp3' | 'io1' | 'io2';
  
  /** Storage encrypted */
  storageEncrypted: boolean;
  
  /** KMS key ID */
  kmsKeyId?: string;
  
  /** VPC security group IDs */
  vpcSecurityGroupIds: string[];
  
  /** Subnet group name */
  subnetGroupName?: string;
  
  /** Parameter group name */
  parameterGroupName?: string;
  
  /** Option group name */
  optionGroupName?: string;
  
  /** Backup retention period */
  backupRetentionPeriod: number;
  
  /** Backup window */
  backupWindow?: string;
  
  /** Maintenance window */
  maintenanceWindow?: string;
  
  /** Multi-AZ deployment */
  multiAZ: boolean;
  
  /** Auto minor version upgrade */
  autoMinorVersionUpgrade: boolean;
  
  /** Deletion protection */
  deletionProtection: boolean;
  
  /** Performance Insights enabled */
  performanceInsightsEnabled?: boolean;
  
  /** Monitoring configuration */
  monitoring?: {
    enabled: boolean;
    interval: number;
    roleArn?: string;
  };
}

/**
 * Load Balancer configuration
 */
export interface LoadBalancerConfiguration extends AWSResourceConfiguration {
  resourceType: 'aws-load-balancer';
  
  /** Load balancer type */
  type: 'application' | 'network' | 'gateway' | 'classic';
  
  /** Scheme */
  scheme: 'internet-facing' | 'internal';
  
  /** Subnet IDs */
  subnetIds: string[];
  
  /** Security group IDs */
  securityGroupIds?: string[];
  
  /** IP address type */
  ipAddressType?: 'ipv4' | 'dualstack';
  
  /** Deletion protection */
  deletionProtection: boolean;
  
  /** Access logs */
  accessLogs?: {
    enabled: boolean;
    bucket?: string;
    prefix?: string;
  };
  
  /** Listeners */
  listeners: LoadBalancerListener[];
  
  /** Target groups */
  targetGroups?: TargetGroup[];
}

/**
 * Load Balancer Listener
 */
export interface LoadBalancerListener {
  /** Port */
  port: number;
  
  /** Protocol */
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'TLS' | 'UDP' | 'TCP_UDP';
  
  /** SSL policy */
  sslPolicy?: string;
  
  /** Certificate ARN */
  certificateArn?: string;
  
  /** Default actions */
  defaultActions: ListenerAction[];
  
  /** Rules */
  rules?: ListenerRule[];
}

/**
 * Listener Action
 */
export interface ListenerAction {
  /** Action type */
  type: 'forward' | 'redirect' | 'fixed-response' | 'authenticate-oidc' | 'authenticate-cognito';
  
  /** Target group ARN (for forward action) */
  targetGroupArn?: string;
  
  /** Forward configuration */
  forwardConfig?: {
    targetGroups: { targetGroupArn: string; weight: number; }[];
  };
  
  /** Redirect configuration */
  redirectConfig?: {
    host?: string;
    path?: string;
    port?: string;
    protocol?: string;
    query?: string;
    statusCode: 'HTTP_301' | 'HTTP_302';
  };
  
  /** Fixed response configuration */
  fixedResponseConfig?: {
    statusCode: string;
    contentType?: string;
    messageBody?: string;
  };
}

/**
 * Listener Rule
 */
export interface ListenerRule {
  /** Priority */
  priority: number;
  
  /** Conditions */
  conditions: ListenerRuleCondition[];
  
  /** Actions */
  actions: ListenerAction[];
}

/**
 * Listener Rule Condition
 */
export interface ListenerRuleCondition {
  /** Field */
  field: 'host-header' | 'path-pattern' | 'http-header' | 'http-request-method' | 'query-string' | 'source-ip';
  
  /** Values */
  values: string[];
  
  /** HTTP header configuration */
  httpHeaderConfig?: {
    httpHeaderName: string;
  };
  
  /** Query string configuration */
  queryStringConfig?: {
    key?: string;
    value: string;
  }[];
}

/**
 * Target Group
 */
export interface TargetGroup {
  /** Name */
  name: string;
  
  /** Protocol */
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'TLS' | 'UDP' | 'TCP_UDP';
  
  /** Port */
  port: number;
  
  /** VPC ID */
  vpcId: string;
  
  /** Target type */
  targetType: 'instance' | 'ip' | 'lambda' | 'alb';
  
  /** Health check configuration */
  healthCheck: {
    enabled: boolean;
    healthyThresholdCount: number;
    unhealthyThresholdCount: number;
    timeout: number;
    interval: number;
    protocol: 'HTTP' | 'HTTPS' | 'TCP';
    port?: string;
    path?: string;
    matcher?: string;
  };
  
  /** Targets */
  targets?: {
    id: string;
    port?: number;
    availabilityZone?: string;
  }[];
  
  /** Attributes */
  attributes?: Record<string, string>;
}

/**
 * AWS service type enums
 */
export type AWSRegion = 
  | 'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2'
  | 'eu-west-1' | 'eu-west-2' | 'eu-west-3' | 'eu-central-1' | 'eu-north-1'
  | 'ap-southeast-1' | 'ap-southeast-2' | 'ap-northeast-1' | 'ap-northeast-2' | 'ap-south-1'
  | 'sa-east-1' | 'ca-central-1' | 'af-south-1' | 'me-south-1';

export type EC2InstanceType = 
  | 't3.micro' | 't3.small' | 't3.medium' | 't3.large' | 't3.xlarge' | 't3.2xlarge'
  | 'm5.large' | 'm5.xlarge' | 'm5.2xlarge' | 'm5.4xlarge' | 'm5.8xlarge' | 'm5.12xlarge' | 'm5.16xlarge' | 'm5.24xlarge'
  | 'c5.large' | 'c5.xlarge' | 'c5.2xlarge' | 'c5.4xlarge' | 'c5.9xlarge' | 'c5.12xlarge' | 'c5.18xlarge' | 'c5.24xlarge'
  | 'r5.large' | 'r5.xlarge' | 'r5.2xlarge' | 'r5.4xlarge' | 'r5.8xlarge' | 'r5.12xlarge' | 'r5.16xlarge' | 'r5.24xlarge'
  | 'i3.large' | 'i3.xlarge' | 'i3.2xlarge' | 'i3.4xlarge' | 'i3.8xlarge' | 'i3.16xlarge';

export type RDSInstanceClass = 
  | 'db.t3.micro' | 'db.t3.small' | 'db.t3.medium' | 'db.t3.large' | 'db.t3.xlarge' | 'db.t3.2xlarge'
  | 'db.m5.large' | 'db.m5.xlarge' | 'db.m5.2xlarge' | 'db.m5.4xlarge' | 'db.m5.8xlarge' | 'db.m5.12xlarge' | 'db.m5.16xlarge' | 'db.m5.24xlarge'
  | 'db.r5.large' | 'db.r5.xlarge' | 'db.r5.2xlarge' | 'db.r5.4xlarge' | 'db.r5.8xlarge' | 'db.r5.12xlarge' | 'db.r5.16xlarge' | 'db.r5.24xlarge';

/**
 * Type guards for AWS resources
 */
export function isVPCConfiguration(config: AWSResourceConfiguration): config is VPCConfiguration {
  return config.resourceType === 'aws-vpc';
}

export function isSubnetConfiguration(config: AWSResourceConfiguration): config is SubnetConfiguration {
  return config.resourceType === 'aws-subnet';
}

export function isEC2Configuration(config: AWSResourceConfiguration): config is EC2Configuration {
  return config.resourceType === 'aws-ec2';
}

export function isSecurityGroupConfiguration(config: AWSResourceConfiguration): config is SecurityGroupConfiguration {
  return config.resourceType === 'aws-security-group';
}

export function isRDSConfiguration(config: AWSResourceConfiguration): config is RDSConfiguration {
  return config.resourceType === 'aws-rds';
}

export function isLoadBalancerConfiguration(config: AWSResourceConfiguration): config is LoadBalancerConfiguration {
  return config.resourceType === 'aws-load-balancer';
}

/**
 * Utility types for configuration management
 */
export type ConfigurationByType<T extends string> = 
  T extends 'aws-vpc' ? VPCConfiguration :
  T extends 'aws-subnet' ? SubnetConfiguration :
  T extends 'aws-ec2' ? EC2Configuration :
  T extends 'aws-security-group' ? SecurityGroupConfiguration :
  T extends 'aws-rds' ? RDSConfiguration :
  T extends 'aws-load-balancer' ? LoadBalancerConfiguration :
  AWSResourceConfiguration;

/**
 * Configuration validation types
 */
export interface ConfigurationValidationResult {
  isValid: boolean;
  errors: ConfigurationError[];
  warnings: ConfigurationWarning[];
  suggestions: ConfigurationSuggestion[];
}

export interface ConfigurationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ConfigurationWarning extends ConfigurationError {
  severity: 'warning';
}

export interface ConfigurationSuggestion extends ConfigurationError {
  severity: 'info';
  suggestedValue?: unknown;
}

/**
 * Resource dependencies
 */
export interface ResourceDependency {
  /** Dependent resource ID */
  resourceId: string;
  
  /** Dependency type */
  type: 'required' | 'optional' | 'conditional';
  
  /** Dependency field */
  field: string;
  
  /** Target resource ID */
  targetResourceId: string;
  
  /** Target field */
  targetField: string;
  
  /** Condition for conditional dependencies */
  condition?: (config: AWSResourceConfiguration) => boolean;
}

/**
 * Cost estimation types
 */
export interface CostEstimate {
  /** Resource ID */
  resourceId: string;
  
  /** Service type */
  serviceType: string;
  
  /** Monthly cost estimate */
  monthlyCost: number;
  
  /** Currency */
  currency: string;
  
  /** Cost breakdown */
  breakdown: CostBreakdown[];
  
  /** Estimation confidence */
  confidence: 'low' | 'medium' | 'high';
  
  /** Assumptions made */
  assumptions: string[];
}

export interface CostBreakdown {
  /** Cost component name */
  component: string;
  
  /** Cost amount */
  amount: number;
  
  /** Unit of measurement */
  unit: string;
  
  /** Quantity */
  quantity: number;
  
  /** Rate per unit */
  rate: number;
}
```

## UI and Form Types

### Form and Validation Types

```typescript
/**
 * Form field types
 */
export interface FormField<T = unknown> {
  /** Field name */
  name: string;
  
  /** Field label */
  label: string;
  
  /** Field type */
  type: FormFieldType;
  
  /** Field value */
  value: T;
  
  /** Default value */
  defaultValue?: T;
  
  /** Whether field is required */
  required: boolean;
  
  /** Whether field is disabled */
  disabled: boolean;
  
  /** Field placeholder */
  placeholder?: string;
  
  /** Field description */
  description?: string;
  
  /** Validation rules */
  validation?: ValidationRule[];
  
  /** Field options (for select/radio) */
  options?: FieldOption[];
  
  /** Field dependencies */
  dependencies?: FieldDependency[];
  
  /** Custom field data */
  data?: Record<string, unknown>;
}

export type FormFieldType = 
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'switch'
  | 'textarea' | 'date' | 'time' | 'datetime'
  | 'file' | 'color' | 'range' | 'hidden'
  | 'custom';

export interface FieldOption {
  /** Option value */
  value: string | number;
  
  /** Option label */
  label: string;
  
  /** Option description */
  description?: string;
  
  /** Whether option is disabled */
  disabled?: boolean;
  
  /** Option icon */
  icon?: string;
  
  /** Option group */
  group?: string;
}

export interface FieldDependency {
  /** Field name that this field depends on */
  dependsOn: string;
  
  /** Condition for dependency */
  condition: DependencyCondition;
  
  /** Action when condition is met */
  action: DependencyAction;
}

export interface DependencyCondition {
  /** Comparison operator */
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than';
  
  /** Value to compare against */
  value: unknown;
}

export interface DependencyAction {
  /** Action type */
  type: 'show' | 'hide' | 'enable' | 'disable' | 'set-value' | 'set-options';
  
  /** Action value */
  value?: unknown;
}

/**
 * Validation types
 */
export interface ValidationRule {
  /** Rule type */
  type: ValidationRuleType;
  
  /** Rule parameters */
  params?: Record<string, unknown>;
  
  /** Error message */
  message: string;
  
  /** Whether rule is conditional */
  conditional?: ValidationCondition;
}

export type ValidationRuleType = 
  | 'required' | 'min-length' | 'max-length' | 'pattern' | 'email' | 'url'
  | 'min' | 'max' | 'integer' | 'decimal'
  | 'date' | 'time' | 'datetime'
  | 'file-size' | 'file-type'
  | 'custom';

export interface ValidationCondition {
  /** Field to check */
  field: string;
  
  /** Comparison operator */
  operator: string;
  
  /** Value to compare */
  value: unknown;
}

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  
  /** Field-specific errors */
  fieldErrors: Record<string, string[]>;
  
  /** General form errors */
  formErrors: string[];
  
  /** Validation warnings */
  warnings: Record<string, string[]>;
  
  /** Validation timestamp */
  timestamp: number;
}

/**
 * Canvas and ReactFlow types
 */
export interface CanvasState {
  /** Canvas zoom level */
  zoom: number;
  
  /** Canvas viewport position */
  viewport: Position;
  
  /** Canvas bounds */
  bounds: Bounds;
  
  /** Whether grid is visible */
  showGrid: boolean;
  
  /** Grid size */
  gridSize: number;
  
  /** Whether minimap is visible */
  showMinimap: boolean;
  
  /** Canvas background pattern */
  backgroundPattern: 'dots' | 'lines' | 'cross' | 'none';
  
  /** Snap to grid enabled */
  snapToGrid: boolean;
  
  /** Pan on scroll enabled */
  panOnScroll: boolean;
  
  /** Zoom on scroll enabled */
  zoomOnScroll: boolean;
  
  /** Selection mode */
  selectionMode: 'single' | 'multiple' | 'box';
  
  /** Connection mode */
  connectionMode: 'loose' | 'strict' | 'smart';
}

export interface NodeHandleConfig {
  /** Handle ID */
  id: string;
  
  /** Handle type */
  type: 'source' | 'target';
  
  /** Handle position */
  position: 'top' | 'right' | 'bottom' | 'left';
  
  /** Handle style */
  style?: React.CSSProperties;
  
  /** Whether handle is connectable */
  isConnectable: boolean;
  
  /** Connection limit */
  connectionLimit?: number;
  
  /** Valid connection types */
  validConnectionTypes?: string[];
}

/**
 * Store types
 */
export interface StoreState {
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Last action timestamp */
  lastAction: number;
  
  /** Undo/redo history */
  history: HistoryEntry[];
  
  /** Current history index */
  historyIndex: number;
  
  /** Maximum history size */
  maxHistorySize: number;
}

export interface HistoryEntry {
  /** Action name */
  action: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** State snapshot */
  state: unknown;
  
  /** Action description */
  description?: string;
}

/**
 * Event types
 */
export interface CustomEventData {
  /** Event type */
  type: string;
  
  /** Event data */
  data: Record<string, unknown>;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Event source */
  source: string;
}

export interface DragDropEventData {
  /** Dragged item type */
  itemType: string;
  
  /** Dragged item data */
  itemData: unknown;
  
  /** Drop position */
  position?: Position;
  
  /** Drop target */
  target?: string;
  
  /** Modifier keys */
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
  };
}

/**
 * API types
 */
export interface APIResponse<T = unknown> {
  /** Response data */
  data: T;
  
  /** Success status */
  success: boolean;
  
  /** Error message */
  error?: string;
  
  /** Response metadata */
  meta?: {
    timestamp: number;
    version: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T = unknown> extends APIResponse<T[]> {
  /** Pagination info */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Generic utility types
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & Pick<Required<T>, K>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};

/**
 * Branded types for type safety
 */
export type NodeId = string & { __brand: 'NodeId' };
export type ConnectionId = string & { __brand: 'ConnectionId' };
export type ConfigurationId = string & { __brand: 'ConfigurationId' };

/**
 * Type assertion functions
 */
export function assertIsNodeId(value: string): asserts value is NodeId {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid NodeId');
  }
}

export function assertIsConnectionId(value: string): asserts value is ConnectionId {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid ConnectionId');
  }
}
```

## Type Utilities and Helpers

### Type Guard Functions

```typescript
/**
 * Type guard utilities
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Complex type guards
 */
export function hasProperty<T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return isObject(obj) && prop in obj;
}

export function hasRequiredProperties<T extends Record<string, unknown>>(
  obj: unknown,
  props: (keyof T)[]
): obj is T {
  if (!isObject(obj)) return false;
  return props.every(prop => prop in obj);
}

export function isArchitectureNode(value: unknown): value is ArchitectureNode {
  return hasRequiredProperties(value, [
    'id', 'nodeType', 'serviceType', 'name', 'position', 'configuration', 'isContainer'
  ]);
}

export function isNodeConnection(value: unknown): value is NodeConnection {
  return hasRequiredProperties(value, ['id', 'source', 'target', 'type']);
}

export function isArchitectureData(value: unknown): value is ArchitectureData {
  return hasRequiredProperties(value, ['metadata', 'nodes', 'connections']);
}

/**
 * Runtime type conversion utilities
 */
export function toNumber(value: unknown): number | null {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }
  return null;
}

export function toString(value: unknown): string {
  if (isString(value)) return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

export function toBoolean(value: unknown): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (isNumber(value)) return value !== 0;
  return Boolean(value);
}

export function toArray<T>(value: unknown): T[] {
  if (isArray<T>(value)) return value;
  if (value === null || value === undefined) return [];
  return [value as T];
}

/**
 * Type-safe configuration helpers
 */
export function getConfigurationValue<T>(
  config: AWSResourceConfiguration,
  key: string,
  defaultValue: T
): T {
  const value = config[key];
  return value !== undefined ? (value as T) : defaultValue;
}

export function setConfigurationValue<T>(
  config: AWSResourceConfiguration,
  key: string,
  value: T
): AWSResourceConfiguration {
  return {
    ...config,
    [key]: value,
  };
}

export function validateConfigurationType<T extends AWSResourceConfiguration>(
  config: unknown,
  validator: (config: unknown) => config is T
): T | null {
  return validator(config) ? config : null;
}

/**
 * Type-safe event handlers
 */
export type EventHandler<T = unknown> = (event: CustomEventData & { data: T }) => void;

export type TypedEventHandler<T extends Record<string, unknown>> = {
  [K in keyof T]: EventHandler<T[K]>;
};

export function createTypedEventHandler<T extends Record<string, unknown>>(
  handlers: Partial<TypedEventHandler<T>>
): (event: CustomEventData) => void {
  return (event) => {
    const handler = handlers[event.type as keyof T];
    if (handler) {
      handler(event as any);
    }
  };
}

/**
 * Type-safe store selectors
 */
export type Selector<TState, TResult> = (state: TState) => TResult;

export type TypedSelectors<TState, TSelectors extends Record<string, unknown>> = {
  [K in keyof TSelectors]: Selector<TState, TSelectors[K]>;
};

export function createTypedSelectors<TState, TSelectors extends Record<string, unknown>>(
  selectors: TypedSelectors<TState, TSelectors>
) {
  return selectors;
}
```

This comprehensive type system provides strong typing throughout the application, ensuring type safety, better developer experience, and runtime reliability through proper interface definitions and type guards.
