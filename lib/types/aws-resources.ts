/**
 * AWS Resource Types
 * Comprehensive type definitions for all AWS resources used in the architecture designer
 */

// Base interfaces
export interface BaseAWSResource {
	resourceName: string;
	description?: string;
	tags?: Record<string, string>;
}

export interface ConfigurationFormProps<T = Record<string, unknown>> {
	config: T;
	onChange: (config: T) => void;
}

// VPC Configuration
export interface VPCConfiguration {
	resourceName: string;
	cidrBlock?: string;
	region?: string;
	description?: string;
	enableDnsSupport?: boolean;
	enableDnsHostnames?: boolean;
	tags?: string; // comma-separated key=value pairs for backward compatibility
}

// EC2 Configuration
export interface EC2Configuration {
	// Basic Configuration
	resourceName: string;
	instanceType?: string;
	amiId?: string;
	keyPairName?: string;

	// Instance Details
	availabilityZone?: string;
	subnetId?: string;
	securityGroups?: string[];
	iamInstanceProfile?: string;

	// Storage
	rootVolumeSize?: number;
	rootVolumeType?: string;
	deleteOnTermination?: boolean;
	encrypted?: boolean;

	// Monitoring & Management
	detailedMonitoring?: boolean;
	terminationProtection?: boolean;
	autoRecovery?: boolean;

	// User Data
	userData?: string;

	// Network Settings
	associatePublicIpAddress?: boolean;
	enhancedNetworking?: boolean;
	sriovNetSupport?: boolean;

	// Placement
	tenancy?: string;
	hostId?: string;

	// Tags
	tags?: Record<string, string>;
}

// Subnet Configurations
export interface PublicSubnetConfiguration {
	resourceName: string;
	cidrBlock: string;
	vpcId: string;
	region: string;
	availabilityZone: string;
	description: string;
	mapPublicIpOnLaunch: boolean;
	tags?: string; // comma-separated key=value pairs for backward compatibility
}

export interface PrivateSubnetConfiguration {
	resourceName: string;
	cidrBlock: string;
	vpcId: string;
	region: string;
	availabilityZone: string;
	description: string;
	mapPublicIpOnLaunch: boolean;
	enableNatGateway: boolean;
	tags?: string; // comma-separated key=value pairs for backward compatibility
}

// AWS Region Configuration
export interface AWSRegionConfiguration {
	resourceName: string;
	region: string;
	regionName: string;
	description: string;
	isEnabled: boolean;
	isDefault: boolean;
	tags: string; // comma-separated for backward compatibility
}

// Availability Zone Configuration
export interface AvailabilityZoneConfiguration {
	resourceName: string;
	region: string;
	availabilityZone: string;
	description: string;
	isEnabled: boolean;
	isPreferred: boolean;
	tags: string; // comma-separated for backward compatibility
}

// Default/Generic Configuration for unknown resources
export interface DefaultConfiguration {
	resourceName?: string;
	description?: string;
	properties?: Record<string, unknown>;
}

// Type guards for runtime type checking
export function isVPCConfiguration(
	config: AWSResourceConfiguration
): config is VPCConfiguration {
	return "cidrBlock" in config && "region" in config;
}

export function isEC2Configuration(
	config: AWSResourceConfiguration
): config is EC2Configuration {
	return "instanceType" in config && "amiId" in config;
}

export function isPublicSubnetConfiguration(
	config: AWSResourceConfiguration
): config is PublicSubnetConfiguration {
	return (
		"cidrBlock" in config &&
		"availabilityZone" in config &&
		"vpcId" in config &&
		"mapPublicIpOnLaunch" in config
	);
}

export function isPrivateSubnetConfiguration(
	config: AWSResourceConfiguration
): config is PrivateSubnetConfiguration {
	return (
		"cidrBlock" in config &&
		"availabilityZone" in config &&
		"vpcId" in config &&
		"enableNatGateway" in config
	);
}

export function isAWSRegionConfiguration(
	config: AWSResourceConfiguration
): config is AWSRegionConfiguration {
	return "regionCode" in config;
}

export function isAvailabilityZoneConfiguration(
	config: AWSResourceConfiguration
): config is AvailabilityZoneConfiguration {
	return "availabilityZone" in config && "region" in config;
}

// Service type mapping for configuration forms
export const AWS_SERVICE_TYPE_MAP = {
	"aws-vpc": "VPC",
	"aws-ec2": "EC2",
	"aws-public-subnet": "PublicSubnet",
	"aws-private-subnet": "PrivateSubnet",
	"aws-region": "AWSRegion",
	"aws-availability-zone": "AvailabilityZone",
	"aws-security-group": "SecurityGroup",
} as const;

export type AWSResourceConfiguration =
	| AvailabilityZoneConfiguration
	| AWSRegionConfiguration
	| EC2Configuration
	| PrivateSubnetConfiguration
	| VPCConfiguration
	| PublicSubnetConfiguration
	| SecurityGroupConfiguration
	| DefaultConfiguration;

export type AWSServiceType = keyof typeof AWS_SERVICE_TYPE_MAP;
export type AWSServiceName = (typeof AWS_SERVICE_TYPE_MAP)[AWSServiceType];

// =============================================================================
// SECURITY GROUP CONFIGURATION - NOW IMPLEMENTED
// =============================================================================

// Security Group Configuration
export interface SecurityGroupConfiguration extends BaseAWSResource {
	resourceName: string;
	groupId?: string;
	vpcId: string;
	description?: string;
	ingressRules: SecurityGroupRule[];
	egressRules: SecurityGroupRule[];
	tags?: Record<string, string>;
}

export interface SecurityGroupRule {
	protocol: 'tcp' | 'udp' | 'icmp' | 'all';
	port: number | string; // can be port number or 'all'
	source?: string; // CIDR or security group ID for ingress
	destination?: string; // CIDR or security group ID for egress
	description?: string;
}

// =============================================================================
// COMMENTED OUT RESOURCES - NO CONFIGURATION FORMS AVAILABLE
// =============================================================================
// The following resources do not have corresponding configuration sidebar forms
// and are commented out until forms are implemented.

/*

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
*/
