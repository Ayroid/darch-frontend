/**
 * AWS Resource Types
 * Comprehensive type definitions for all AWS resources used in the architecture designer
 */

// Base interfaces
export interface BaseAWSResource {
  name: string;
  description?: string;
  tags?: Record<string, string>;
}

export interface ConfigurationFormProps<T = Record<string, unknown>> {
  config: T;
  onChange: (config: T) => void;
}

// VPC Configuration
export interface VPCConfiguration extends Omit<BaseAWSResource, 'tags'> {
  cidrBlock: string;
  region: string;
  enableDnsSupport: boolean;
  enableDnsHostnames: boolean;
  instanceTenancy?: 'default' | 'dedicated';
  tags: string; // comma-separated key=value pairs for backward compatibility
}

// EC2 Configuration
export interface EC2Configuration extends BaseAWSResource {
  // Basic Configuration
  instanceType: string;
  amiId: string;
  keyPairName: string;

  // Instance Details
  availabilityZone: string;
  subnetId: string;
  securityGroups: string[];
  iamInstanceProfile?: string;

  // Storage
  rootVolumeSize: number;
  rootVolumeType: 'gp2' | 'gp3' | 'io1' | 'io2' | 'st1' | 'sc1' | 'standard';
  deleteOnTermination: boolean;
  encrypted: boolean;

  // Monitoring & Management
  detailedMonitoring: boolean;
  terminationProtection: boolean;
  autoRecovery: boolean;

  // User Data
  userData?: string;

  // Network Settings
  associatePublicIpAddress: boolean;
  enhancedNetworking?: boolean;
  sriovNetSupport?: boolean;

  // Placement
  tenancy: 'default' | 'dedicated' | 'host';
  hostId?: string;
  affinity?: string;

  // Tags
  tags: Record<string, string>;
}

// Subnet Configurations
export interface BaseSubnetConfiguration extends Omit<BaseAWSResource, 'tags'> {
  cidrBlock: string;
  availabilityZone: string;
  vpcId: string;
  routeTableId?: string;
  tags: string; // comma-separated key=value pairs for backward compatibility
}

export interface PublicSubnetConfiguration extends BaseSubnetConfiguration {
  internetGatewayId?: string;
  mapPublicIpOnLaunch?: boolean;
  natGatewayId?: string;
}

export interface PrivateSubnetConfiguration extends BaseSubnetConfiguration {
  natGatewayId?: string;
  networkAclId?: string;
  enableNatGateway?: boolean; // for form compatibility
}

// AWS Region Configuration
export interface AWSRegionConfiguration extends Omit<BaseAWSResource, 'tags'> {
  regionCode: string; // e.g., 'us-east-1'
  displayName?: string; // e.g., 'US East (N. Virginia)'
  isAvailable?: boolean;
  supportedServices?: string[];
  // Form compatibility fields
  isEnabled?: boolean;
  isDefault?: boolean;
  tags?: string; // comma-separated for backward compatibility
}

// Availability Zone Configuration
export interface AvailabilityZoneConfiguration extends Omit<BaseAWSResource, 'tags'> {
  zoneId: string; // e.g., 'use1-az1'
  zoneName: string; // e.g., 'us-east-1a'
  region: string;
  state: 'available' | 'information' | 'impaired' | 'unavailable';
  messages?: string[];
  // Form compatibility fields
  availabilityZone?: string; // alias for zoneName
  isEnabled?: boolean;
  isPreferred?: boolean;
  tags?: string; // comma-separated for backward compatibility
}

// Security Group Configuration
export interface SecurityGroupConfiguration extends BaseAWSResource {
  groupId?: string;
  vpcId: string;
  ingressRules: SecurityGroupRule[];
  egressRules: SecurityGroupRule[];
}

export interface SecurityGroupRule {
  protocol: 'tcp' | 'udp' | 'icmp' | 'all';
  port: number | string; // can be port number or 'all'
  source?: string; // CIDR or security group ID for ingress
  destination?: string; // CIDR or security group ID for egress
  description?: string;
}

// Internet Gateway Configuration
export interface InternetGatewayConfiguration extends BaseAWSResource {
  vpcId?: string;
  state?: 'available' | 'attaching' | 'attached' | 'detaching' | 'detached';
}

// NAT Gateway Configuration
export interface NATGatewayConfiguration extends BaseAWSResource {
  subnetId: string;
  allocationId?: string; // Elastic IP allocation ID
  state?: 'pending' | 'failed' | 'available' | 'deleting' | 'deleted';
  natGatewayType?: 'public' | 'private';
}

// Route Table Configuration
export interface RouteTableConfiguration extends BaseAWSResource {
  vpcId: string;
  routes: Route[];
  associations: RouteTableAssociation[];
}

export interface Route {
  destinationCidrBlock?: string;
  destinationIpv6CidrBlock?: string;
  gatewayId?: string;
  instanceId?: string;
  natGatewayId?: string;
  networkInterfaceId?: string;
  vpcPeeringConnectionId?: string;
  state?: 'active' | 'blackhole';
}

export interface RouteTableAssociation {
  associationId?: string;
  subnetId?: string;
  gatewayId?: string;
  main?: boolean;
}

// Load Balancer Configuration
export interface LoadBalancerConfiguration extends BaseAWSResource {
  type: 'application' | 'network' | 'classic';
  scheme: 'internet-facing' | 'internal';
  subnets: string[];
  securityGroups?: string[];
  listeners: LoadBalancerListener[];
  targetGroups?: TargetGroup[];
}

export interface LoadBalancerListener {
  port: number;
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP' | 'TLS';
  sslPolicy?: string;
  certificateArn?: string;
  defaultActions: ListenerAction[];
}

export interface ListenerAction {
  type: 'forward' | 'redirect' | 'fixed-response';
  targetGroupArn?: string;
  redirectConfig?: {
    statusCode: '301' | '302';
    host?: string;
    path?: string;
    port?: string;
    protocol?: 'HTTP' | 'HTTPS';
    query?: string;
  };
  fixedResponseConfig?: {
    statusCode: string;
    contentType?: string;
    messageBody?: string;
  };
}

export interface TargetGroup {
  name: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP';
  port: number;
  vpcId: string;
  targetType: 'instance' | 'ip' | 'lambda';
  healthCheck: HealthCheck;
}

export interface HealthCheck {
  enabled: boolean;
  path?: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP';
  port?: number;
  intervalSeconds: number;
  timeoutSeconds: number;
  healthyThresholdCount: number;
  unhealthyThresholdCount: number;
  matcher?: string; // for HTTP/HTTPS
}

// RDS Configuration
export interface RDSConfiguration extends BaseAWSResource {
  engine: 'mysql' | 'postgres' | 'mariadb' | 'oracle-ee' | 'sqlserver-ee' | 'aurora-mysql' | 'aurora-postgresql';
  engineVersion: string;
  instanceClass: string;
  allocatedStorage: number;
  storageType: 'gp2' | 'gp3' | 'io1' | 'io2' | 'standard';
  storageEncrypted: boolean;
  dbName?: string;
  username: string;
  port: number;
  vpcSecurityGroupIds: string[];
  dbSubnetGroupName?: string;
  parameterGroupName?: string;
  optionGroupName?: string;
  backupRetentionPeriod: number;
  preferredBackupWindow?: string;
  preferredMaintenanceWindow?: string;
  multiAZ: boolean;
  publiclyAccessible: boolean;
  autoMinorVersionUpgrade: boolean;
  deletionProtection: boolean;
}

// S3 Configuration
export interface S3Configuration extends BaseAWSResource {
  bucketName: string;
  region: string;
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
  versioning: boolean;
  encryption: {
    enabled: boolean;
    kmsKeyId?: string;
    sseAlgorithm?: 'AES256' | 'aws:kms';
  };
  publicAccessBlock: {
    blockPublicAcls: boolean;
    blockPublicPolicy: boolean;
    ignorePublicAcls: boolean;
    restrictPublicBuckets: boolean;
  };
  lifecycleConfiguration?: S3LifecycleRule[];
  corsConfiguration?: S3CorsRule[];
}

export interface S3LifecycleRule {
  id: string;
  status: 'Enabled' | 'Disabled';
  filter?: {
    prefix?: string;
    tags?: Record<string, string>;
  };
  transitions?: S3Transition[];
  expiration?: {
    days?: number;
    date?: string;
  };
}

export interface S3Transition {
  days: number;
  storageClass: 'STANDARD_IA' | 'ONEZONE_IA' | 'GLACIER' | 'DEEP_ARCHIVE';
}

export interface S3CorsRule {
  allowedOrigins: string[];
  allowedMethods: ('GET' | 'PUT' | 'POST' | 'DELETE' | 'HEAD')[];
  allowedHeaders?: string[];
  exposeHeaders?: string[];
  maxAgeSeconds?: number;
}

// Default/Generic Configuration for unknown resources
export interface DefaultConfiguration extends BaseAWSResource {
  resourceType?: string;
  properties?: Record<string, unknown>;
}

// Union type for all AWS resource configurations
export type AWSResourceConfiguration =
  | VPCConfiguration
  | EC2Configuration
  | PublicSubnetConfiguration
  | PrivateSubnetConfiguration
  | AWSRegionConfiguration
  | AvailabilityZoneConfiguration
  | SecurityGroupConfiguration
  | InternetGatewayConfiguration
  | NATGatewayConfiguration
  | RouteTableConfiguration
  | LoadBalancerConfiguration
  | RDSConfiguration
  | S3Configuration
  | DefaultConfiguration;

// Type guards for runtime type checking
export function isVPCConfiguration(config: AWSResourceConfiguration): config is VPCConfiguration {
  return 'cidrBlock' in config && 'region' in config && 'enableDnsSupport' in config;
}

export function isEC2Configuration(config: AWSResourceConfiguration): config is EC2Configuration {
  return 'instanceType' in config && 'amiId' in config;
}

export function isPublicSubnetConfiguration(config: AWSResourceConfiguration): config is PublicSubnetConfiguration {
  return 'cidrBlock' in config && 'availabilityZone' in config && 'vpcId' in config && 'internetGatewayId' in config;
}

export function isPrivateSubnetConfiguration(config: AWSResourceConfiguration): config is PrivateSubnetConfiguration {
  return 'cidrBlock' in config && 'availabilityZone' in config && 'vpcId' in config && !('internetGatewayId' in config);
}

export function isAWSRegionConfiguration(config: AWSResourceConfiguration): config is AWSRegionConfiguration {
  return 'regionCode' in config;
}

export function isAvailabilityZoneConfiguration(config: AWSResourceConfiguration): config is AvailabilityZoneConfiguration {
  return 'zoneId' in config && 'zoneName' in config && 'state' in config;
}

// Service type mapping for configuration forms
export const AWS_SERVICE_TYPE_MAP = {
  'aws-vpc': 'VPC',
  'aws-ec2': 'EC2',
  'aws-public-subnet': 'PublicSubnet',
  'aws-private-subnet': 'PrivateSubnet',
  'aws-region': 'AWSRegion',
  'aws-availability-zone': 'AvailabilityZone',
  'aws-security-group': 'SecurityGroup',
  'aws-internet-gateway': 'InternetGateway',
  'aws-nat-gateway': 'NATGateway',
  'aws-route-table': 'RouteTable',
  'aws-load-balancer': 'LoadBalancer',
  'aws-rds': 'RDS',
  'aws-s3': 'S3',
} as const;

export type AWSServiceType = keyof typeof AWS_SERVICE_TYPE_MAP;
export type AWSServiceName = typeof AWS_SERVICE_TYPE_MAP[AWSServiceType];
