/**
 * AWS Resource Types
 * Comprehensive type definitions for all AWS resources used in the architecture designer
 */

// Base interfaces
export interface BaseAWSResource {
	awsResourceId: string;
	description?: string;
	tags?: Record<string, string>;
}

export interface ConfigurationFormProps<T = Record<string, unknown>> {
	config: T;
	onChange: (config: T) => void;
}

// VPC Configuration
export interface VPCConfiguration {
	awsVpcId: string;
	cidrBlock: string; // Required: IPv4 CIDR block
	awsRegionId?: string;
	description?: string;
	enableDnsSupport?: boolean; // Default: true
	enableDnsHostnames?: boolean; // Default: false
	instanceTenancy?: "default" | "dedicated"; // Default: "default"
	assignGeneratedIpv6CidrBlock?: boolean; // Default: false
	ipv6CidrBlock?: string; // Optional: IPv6 CIDR block
	ipv6IpamPoolId?: string; // Optional: IPv6 IPAM pool ID
	ipv6NetmaskLength?: number; // Optional: IPv6 netmask length
	tags?: Record<string, string>; // comma-separated key=value pairs for backward compatibility
}

// EC2 Configuration
export interface EC2Configuration {
	// Basic Configuration
	awsEc2Id: string;
	instanceType: string; // Required: e.g., "t3.micro", "t2.micro"
	amiId: string; // Required: Amazon Machine Image ID
	keyPairName?: string;

	// Instance Details
	awsRegionId?: string;
	awsAvailabilityZone?: string;
	subnetId?: string;
	securityGroups?: string[]; // VPC security group IDs
	iamInstanceProfile?: string;

	// Storage
	rootVolumeSize?: number; // Default: 8 GB (AMI default)
	rootVolumeType?: "gp2" | "gp3" | "io1" | "io2" | "st1" | "sc1" | "standard"; // Default: gp3 (modern) or gp2 (legacy)
	deleteOnTermination?: boolean; // Default: true
	encrypted?: boolean; // Default: false
	ebsOptimized?: boolean; // Default: false (or true for some instance types)

	// Monitoring & Management
	detailedMonitoring?: boolean; // Default: false
	terminationProtection?: boolean; // Default: false (disable_api_termination)
	autoRecovery?: boolean; // Default: true (maintenance_options)
	shutdownBehavior?: "stop" | "terminate"; // Default: "stop" for EBS-backed

	// User Data
	userData?: string; // Base64 encoded user data script
	userDataReplaceOnChange?: boolean; // Default: false

	// Network Settings
	associatePublicIpAddress?: boolean; // Default: false
	enhancedNetworking?: boolean; // Default: false (ena_support)
	sriovNetSupport?: "simple"; // SR-IOV support
	privateIp?: string; // Primary private IPv4 address
	ipv6AddressCount?: number; // Number of IPv6 addresses
	ipv6Addresses?: string[]; // Specific IPv6 addresses

	// Placement
	tenancy?: "default" | "dedicated" | "host"; // Default: "default"
	hostId?: string;
	placementGroup?: string;
	availabilityZone?: string;

	// Instance Metadata Service (IMDSv2)
	metadataOptions?: {
		httpEndpoint?: "enabled" | "disabled"; // Default: "enabled"
		httpTokens?: "optional" | "required"; // Default: "optional", use "required" for IMDSv2
		httpPutResponseHopLimit?: number; // Default: 1
		instanceMetadataTags?: "enabled" | "disabled"; // Default: "disabled"
	};

	// CPU Options (for T-series instances)
	cpuCoreCount?: number;
	cpuThreadsPerCore?: number;
	cpuCredits?: "standard" | "unlimited"; // For T2/T3 instances, default: "standard"

	// Capacity Reservation
	capacityReservationSpecification?: {
		capacityReservationPreference?: "open" | "none"; // Default: "open"
		capacityReservationTarget?: {
			capacityReservationId?: string;
			capacityReservationResourceGroupArn?: string;
		};
	};

	// Tags
	tags?: Record<string, string>;
	volumeTags?: Record<string, string>; // Tags for EBS volumes
}

// Subnet Configurations
export interface PublicSubnetConfiguration {
	awsPublicSubnetId: string;
	cidrBlock: string; // Required: IPv4 CIDR block
	awsVpcId: string; // Required: VPC ID
	awsRegionId?: string;
	awsAvailabilityZone: string; // Required: Availability Zone
	availabilityZoneId?: string; // Optional: AZ ID
	description?: string;
	mapPublicIpOnLaunch: boolean; // Default: true for public subnets
	assignIpv6AddressOnCreation?: boolean; // Default: false
	customerOwnedIpv4Pool?: string; // Optional: Customer owned IPv4 pool
	enableDns64?: boolean; // Default: false
	enableResourceNameDnsARecordOnLaunch?: boolean; // Default: false
	enableResourceNameDnsAAAARecordOnLaunch?: boolean; // Default: false
	ipv6CidrBlock?: string; // Optional: IPv6 CIDR block
	ipv6Native?: boolean; // Default: false (IPv6-only subnet)
	outpostArn?: string; // Optional: Outpost ARN
	privateDnsHostnameTypeOnLaunch?: "ip-name" | "resource-name"; // Default: "ip-name"
	tags?: Record<string, string>; // comma-separated key=value pairs for backward compatibility
}

export interface PrivateSubnetConfiguration {
	awsPrivateSubnetId: string;
	cidrBlock: string; // Required: IPv4 CIDR block
	awsVpcId: string; // Required: VPC ID
	awsRegionId?: string;
	awsAvailabilityZone: string; // Required: Availability Zone
	availabilityZoneId?: string; // Optional: AZ ID
	description?: string;
	mapPublicIpOnLaunch: boolean; // Default: false for private subnets
	enableNatGateway?: boolean; // Custom field for Darch - whether to create NAT Gateway
	assignIpv6AddressOnCreation?: boolean; // Default: false
	customerOwnedIpv4Pool?: string; // Optional: Customer owned IPv4 pool
	enableDns64?: boolean; // Default: false
	enableResourceNameDnsARecordOnLaunch?: boolean; // Default: false
	enableResourceNameDnsAAAARecordOnLaunch?: boolean; // Default: false
	ipv6CidrBlock?: string; // Optional: IPv6 CIDR block
	ipv6Native?: boolean; // Default: false (IPv6-only subnet)
	outpostArn?: string; // Optional: Outpost ARN
	privateDnsHostnameTypeOnLaunch?: "ip-name" | "resource-name"; // Default: "ip-name"
	tags?: Record<string, string>; // comma-separated key=value pairs for backward compatibility
}

// AWS Region Configuration
export interface AWSRegionConfiguration {
	awsRegionId: string;
	region: string;
	regionName: string;
	description: string;
	isEnabled: boolean;
	isDefault: boolean;
	tags?: Record<string, string>; // comma-separated for backward compatibility
}

// Availability Zone Configuration
export interface AvailabilityZoneConfiguration {
	awsAvailabilityZoneId: string;
	awsRegionId: string;
	availabilityZone: string;
	description: string;
	isEnabled: boolean;
	isPreferred: boolean;
	tags?: Record<string, string>; // comma-separated for backward compatibility
}

// Security Group Configuration
export interface SecurityGroupConfiguration {
	awsSecurityGroupId: string;
	name?: string; // Security group name (will be generated if not provided)
	namePrefix?: string; // Creates unique name beginning with prefix
	groupId?: string; // The ID of the security group (output)
	awsVpcId: string; // Required: VPC ID
	description?: string; // Default: "Managed by Terraform"
	ingressRules: SecurityGroupRule[]; // Ingress rules (can be empty)
	egressRules: SecurityGroupRule[]; // Egress rules (Terraform removes AWS default)
	revokeRulesOnDelete?: boolean; // Default: false
	tags?: Record<string, string>;
}

export interface SecurityGroupRule {
	protocol: "tcp" | "udp" | "icmp" | "icmpv6" | "all" | string; // Protocol (-1 for all)
	fromPort?: number; // Start of port range (required for tcp/udp)
	toPort?: number; // End of port range (required for tcp/udp)
	port?: number | string; // Simplified port (for backward compatibility)
	cidrBlocks?: string[]; // IPv4 CIDR blocks
	ipv6CidrBlocks?: string[]; // IPv6 CIDR blocks
	source?: string; // CIDR or security group ID for ingress (backward compatibility)
	destination?: string; // CIDR or security group ID for egress (backward compatibility)
	sourceSecurityGroupId?: string; // Source security group ID
	selfReference?: boolean; // Reference to the security group itself
	prefixListIds?: string[]; // Prefix list IDs
	description?: string;
}

// Internet Gateway Configuration
export interface InternetGatewayConfiguration {
	awsInternetGatewayId: string;
	awsVpcId?: string;
	description?: string;
	state?: "available" | "attaching" | "attached" | "detaching" | "detached";
	tags?: Record<string, string>;
}

// NAT Gateway Configuration
export interface NATGatewayConfiguration {
	awsNatGatewayId: string;
	awsSubnetId: string; // Required: Subnet ID for the NAT Gateway
	allocationId?: string; // Elastic IP allocation ID (required for public NAT Gateway)
	connectivityType?: "public" | "private"; // Default: "public"
	privateIp?: string; // Private IPv4 address (for private NAT Gateway)
	secondaryAllocationIds?: string[]; // Secondary EIP allocation IDs
	secondaryPrivateIpAddressCount?: number; // Number of secondary private IPs
	secondaryPrivateIpAddresses?: string[]; // Secondary private IP addresses
	state?: "pending" | "failed" | "available" | "deleting" | "deleted"; // Status (output)
	description?: string;
	tags?: Record<string, string>;
}

// Route Table Configuration
export interface RouteTableConfiguration {
	awsRouteTableId: string;
	awsVpcId: string; // Required: VPC ID
	awsInternetGatewayId?: string; // For convenience (not AWS parameter)
	awsSubnetId?: string; // For convenience (not AWS parameter)
	routes: Route[]; // Routes (can be empty, local route is implicit)
	associations: RouteTableAssociation[]; // Subnet associations
	propagatingVgws?: string[]; // List of virtual gateways for route propagation
	description?: string;
	tags?: Record<string, string>;
}

export interface Route {
	// Destination (one required)
	destinationCidrBlock?: string; // IPv4 CIDR block
	destinationIpv6CidrBlock?: string; // IPv6 CIDR block
	destinationPrefixListId?: string; // Prefix list ID

	// Target (one required)
	gatewayId?: string; // Internet Gateway or Virtual Private Gateway ID
	egressOnlyGatewayId?: string; // Egress Only Internet Gateway ID (IPv6)
	instanceId?: string; // EC2 instance ID
	natGatewayId?: string; // NAT Gateway ID
	localGatewayId?: string; // Local Gateway ID
	networkInterfaceId?: string; // Network Interface ID
	transitGatewayId?: string; // Transit Gateway ID
	vpcEndpointId?: string; // VPC Endpoint ID
	vpcPeeringConnectionId?: string; // VPC Peering Connection ID
	carrierGatewayId?: string; // Carrier Gateway ID
	coreNetworkArn?: string; // Core Network ARN

	// Status (output)
	state?: "active" | "blackhole";
}

export interface RouteTableAssociation {
	associationId?: string; // Association ID (output)
	subnetId?: string; // Subnet ID to associate
	gatewayId?: string; // Gateway ID to associate
	main?: boolean; // Whether this is the main route table
}

// Default/Generic Configuration for unknown resources
export interface DefaultConfiguration {
	awsResourceId?: string;
	description?: string;
	properties?: Record<string, unknown>;
	tags?: Record<string, string>;
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

export function isInternetGatewayConfiguration(
	config: AWSResourceConfiguration
): config is InternetGatewayConfiguration {
	return "awsInternetGatewayId" in config;
}

export function isNATGatewayConfiguration(
	config: AWSResourceConfiguration
): config is NATGatewayConfiguration {
	return "awsNatGatewayId" in config && "awsSubnetId" in config;
}

export function isRouteTableConfiguration(
	config: AWSResourceConfiguration
): config is RouteTableConfiguration {
	return "awsRouteTableId" in config && "routes" in config;
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
	"aws-internet-gateway": "InternetGateway",
	"aws-nat-gateway": "NATGateway",
	"aws-route-table": "RouteTable",
} as const;

export type AWSResourceConfiguration =
	| AvailabilityZoneConfiguration
	| AWSRegionConfiguration
	| EC2Configuration
	| PrivateSubnetConfiguration
	| VPCConfiguration
	| PublicSubnetConfiguration
	| SecurityGroupConfiguration
	| InternetGatewayConfiguration
	| NATGatewayConfiguration
	| RouteTableConfiguration
	| DefaultConfiguration;

export type AWSServiceType = keyof typeof AWS_SERVICE_TYPE_MAP;
export type AWSServiceName = (typeof AWS_SERVICE_TYPE_MAP)[AWSServiceType];

// =============================================================================
// COMMENTED OUT RESOURCES - NO CONFIGURATION FORMS AVAILABLE
// =============================================================================
// The following resources do not have corresponding configuration sidebar forms
// and are commented out until forms are implemented.

/*

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
