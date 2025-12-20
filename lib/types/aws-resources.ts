/**
 * AWS Resource Types - 
 * Aligned with Terraform conventions using snake_case naming
 * and simplified resource type identifiers
 * 
 * @version 2.0.0
 * @date December 2025
 */

// Base interfaces
export interface BaseAWSResource {
	description?: string;
	tags?: Record<string, string>;
}

export interface ConfigurationFormProps<T = Record<string, unknown>> {
	config: T;
	onChange: (config: T) => void;
}

// =====================================================================
// VPC Configuration
// =====================================================================
export interface VPCConfiguration extends BaseAWSResource {
	cidr_block: string; // Required: IPv4 CIDR block
	region?: string;
	enable_dns_support?: boolean; // Default: true
	enable_dns_hostnames?: boolean; // Default: false
	instance_tenancy?: "default" | "dedicated"; // Default: "default"
	assign_generated_ipv6_cidr_block?: boolean; // Default: false
	ipv6_cidr_block?: string; // IPv6 CIDR block (if assigned)
	ipv6_ipam_pool_id?: string; // IPv6 IPAM pool ID
	ipv6_netmask_length?: number; // IPv6 netmask length
	enable_network_address_usage_metrics?: boolean; // Default: false
}

// =====================================================================
// EC2 Configuration
// =====================================================================
export interface EC2Configuration extends BaseAWSResource {
	// Basic Configuration
	instance_type: string; // Required: e.g., "t3.micro", "t2.micro"
	ami_id: string; // Required: Amazon Machine Image ID
	key_pair_name?: string;

	// Instance Details
	region?: string;
	availability_zone?: string;
	subnet_id?: string;
	security_groups?: string[]; // VPC security group IDs
	iam_instance_profile?: string;

	// Storage
	root_volume_size?: number; // Default: 8 GB (AMI default)
	root_volume_type?: "gp2" | "gp3" | "io1" | "io2" | "st1" | "sc1" | "standard"; // Default: gp3
	delete_on_termination?: boolean; // Default: true
	encrypted?: boolean; // Default: false
	ebs_optimized?: boolean; // Default: false
	kms_key_id?: string; // KMS key ID for EBS encryption

	// Monitoring & Management
	detailed_monitoring?: boolean; // Default: false
	termination_protection?: boolean; // Default: false (disable_api_termination)
	auto_recovery?: boolean; // Default: true
	shutdown_behavior?: "stop" | "terminate"; // Default: "stop"

	// User Data
	user_data?: string; // Base64 encoded user data script
	user_data_replace_on_change?: boolean; // Default: false

	// Network Settings
	associate_public_ip_address?: boolean; // Default: false
	enhanced_networking?: boolean; // Default: false
	private_ip?: string;
	ipv6_addresses?: string[];
	ipv6_address_count?: number;

	// Placement
	tenancy?: "default" | "dedicated" | "host"; // Default: "default"
	host_id?: string;
	placement_group?: string;

	// Instance Metadata Service (IMDS)
	metadata_options?: {
		http_endpoint?: "enabled" | "disabled"; // Default: "enabled"
		http_tokens?: "optional" | "required"; // Default: "optional", recommended: "required"
		http_put_response_hop_limit?: number; // Default: 1
		instance_metadata_tags?: "enabled" | "disabled"; // Default: "disabled"
	};

	// CPU Options
	cpu_credits?: "standard" | "unlimited"; // For T-series instances

	// Capacity Reservation
	capacity_reservation_specification?: {
		capacity_reservation_preference?: "open" | "none"; // Default: "open"
		capacity_reservation_target?: {
			capacity_reservation_id?: string;
			capacity_reservation_resource_group_arn?: string;
		};
	};

	// Credit Specification (for T-series instances)
	credit_specification?: {
		cpu_credits?: "standard" | "unlimited";
	};

	// Tags
	volume_tags?: Record<string, string>; // Tags for EBS volumes
}

// =====================================================================
// Unified Subnet Configuration
// =====================================================================
export interface SubnetConfiguration extends BaseAWSResource {
	subnet_type: "public" | "private"; // Required: Subnet type
	cidr_block: string; // Required: IPv4 CIDR block
	vpc_id: string; // Required: VPC ID
	availability_zone: string; // Required: Availability Zone
	region?: string;
	availability_zone_id?: string; // Availability Zone ID
	map_public_ip_on_launch?: boolean; // Default: false
	assign_ipv6_address_on_creation?: boolean; // Default: false
	ipv6_cidr_block?: string; // IPv6 CIDR block
	ipv6_native?: boolean; // Default: false
	enable_dns64?: boolean; // Default: false
	enable_resource_name_dns_a_record_on_launch?: boolean; // Default: false
	enable_resource_name_dns_aaaa_record_on_launch?: boolean; // Default: false
	private_dns_hostname_type_on_launch?: "ip-name" | "resource-name"; // Default: "ip-name"
	customer_owned_ipv4_pool?: string; // Customer-owned IPv4 pool
	outpost_arn?: string; // Outpost ARN

	// Darch-specific (only for private subnets)
	enable_nat_gateway?: boolean; // Whether to create NAT Gateway for private subnet
}

// =====================================================================
// AWS Region Configuration
// =====================================================================
export interface AWSRegionConfiguration extends BaseAWSResource {
	region: string; // Required: Region code (e.g., "us-east-1")
	region_name: string; // Human-readable region name
	is_enabled: boolean;
	is_default: boolean;
}

// =====================================================================
// Availability Zone Configuration
// =====================================================================
export interface AvailabilityZoneConfiguration extends BaseAWSResource {
	region: string; // Required: Parent region
	availability_zone: string; // Required: Availability zone code
	is_enabled: boolean;
	is_preferred: boolean;
}

// =====================================================================
// Security Group Configuration
// =====================================================================
export interface SecurityGroupConfiguration extends BaseAWSResource {
	name: string; // Security group name (required)
	vpc_id: string; // Required: VPC ID
	ingress_rules: SecurityGroupRule[]; // Ingress rules (can be empty)
	egress_rules: SecurityGroupRule[]; // Egress rules (Terraform removes AWS default)
	revoke_rules_on_delete?: boolean; // Default: false
}

export interface SecurityGroupRule {
	protocol: "tcp" | "udp" | "icmp" | "icmpv6" | "all" | string; // Protocol (-1 for all)

	// Simplified fields for frontend forms
	port?: number | "all"; // Port (single value or "all")
	source?: string; // Source CIDR block or security group (for ingress rules)
	destination?: string; // Destination CIDR block (for egress rules)

	// AWS Terraform fields
	from_port?: number; // Start of port range (required for tcp/udp)
	to_port?: number; // End of port range (required for tcp/udp)
	cidr_blocks?: string[]; // IPv4 CIDR blocks
	ipv6_cidr_blocks?: string[]; // IPv6 CIDR blocks
	source_security_group_id?: string; // Source security group ID
	self_reference?: boolean; // Reference to the security group itself
	prefix_list_ids?: string[]; // Prefix list IDs

	description?: string;
}

// =====================================================================
// Internet Gateway Configuration
// =====================================================================
export interface InternetGatewayConfiguration extends BaseAWSResource {
	vpc_id?: string; // VPC ID (optional, can be attached later)
}

// =====================================================================
// NAT Gateway Configuration
// =====================================================================
export interface NATGatewayConfiguration extends BaseAWSResource {
	subnet_id: string; // Required: Subnet ID for the NAT Gateway (must be public subnet)
	allocation_id?: string; // Elastic IP allocation ID (required for public NAT Gateway)
	connectivity_type?: "public" | "private"; // Default: "public"
	private_ip?: string; // Private IPv4 address (for private NAT Gateway)
	secondary_allocation_ids?: string[]; // Secondary Elastic IP allocation IDs
	secondary_private_ip_addresses?: string[]; // Secondary private IP addresses
	secondary_private_ip_address_count?: number; // Number of secondary private IPs

	// Darch-specific convenience field
	create_eip?: boolean; // Whether to create Elastic IP (default: true for public)
}

// =====================================================================
// Route Table Configuration
// =====================================================================
export interface RouteTableConfiguration extends BaseAWSResource {
	vpc_id: string; // Required: VPC ID
	
	// Convenience fields (not AWS parameters, but useful for Darch)
	internet_gateway_id?: string; // For quick route creation
	subnet_id?: string; // For quick association
	
	// AWS Terraform fields
	routes: Record<string, Route>; // Routes with named keys (local route is implicit)
	associations: Record<string, RouteTableAssociation>; // Subnet associations with named keys
	propagating_vgws?: string[]; // List of virtual gateways for route propagation
}

export interface Route {
	// Destination (one required)
	destination_cidr_block?: string; // IPv4 CIDR block
	destination_ipv6_cidr_block?: string; // IPv6 CIDR block
	destination_prefix_list_id?: string; // Prefix list ID

	// Target (one required)
	gateway_id?: string; // Internet Gateway or Virtual Private Gateway ID
	egress_only_gateway_id?: string; // Egress Only Internet Gateway ID (IPv6)
	instance_id?: string; // EC2 instance ID
	nat_gateway_id?: string; // NAT Gateway ID
	local_gateway_id?: string; // Local Gateway ID
	network_interface_id?: string; // Network Interface ID
	transit_gateway_id?: string; // Transit Gateway ID
	vpc_endpoint_id?: string; // VPC Endpoint ID
	vpc_peering_connection_id?: string; // VPC Peering Connection ID
	carrier_gateway_id?: string; // Carrier Gateway ID
	core_network_arn?: string; // Core Network ARN

	// Status (output)
	state?: "active" | "blackhole";
}

export interface RouteTableAssociation {
	association_id?: string; // Association ID (output)
	subnet_id?: string; // Subnet ID to associate
	gateway_id?: string; // Gateway ID to associate
	main?: boolean; // Whether this is the main route table
}

// =====================================================================
// Default/Generic Configuration for unknown resources
// =====================================================================
export interface DefaultConfiguration {
	description?: string;
	properties?: Record<string, unknown>;
	tags?: Record<string, string>;
}

// =====================================================================
// Type guards for runtime type checking
// =====================================================================
export function isVPCConfiguration(
	config: AWSResourceConfiguration
): config is VPCConfiguration {
	return "cidr_block" in config && !("subnet_type" in config);
}

export function isEC2Configuration(
	config: AWSResourceConfiguration
): config is EC2Configuration {
	return "instance_type" in config && "ami_id" in config;
}

export function isSubnetConfiguration(
	config: AWSResourceConfiguration
): config is SubnetConfiguration {
	return (
		"cidr_block" in config &&
		"subnet_type" in config &&
		"availability_zone" in config &&
		"vpc_id" in config
	);
}

export function isAWSRegionConfiguration(
	config: AWSResourceConfiguration
): config is AWSRegionConfiguration {
	return "region" in config && "region_name" in config;
}

export function isAvailabilityZoneConfiguration(
	config: AWSResourceConfiguration
): config is AvailabilityZoneConfiguration {
	return "availability_zone" in config && "region" in config;
}

export function isSecurityGroupConfiguration(
	config: AWSResourceConfiguration
): config is SecurityGroupConfiguration {
	return "name" in config && "vpc_id" in config && "ingress_rules" in config;
}

export function isInternetGatewayConfiguration(
	config: AWSResourceConfiguration
): config is InternetGatewayConfiguration {
	// Minimal check since IGW has very few required fields
	return !("cidr_block" in config) && 
	       !("instance_type" in config) &&
	       !("subnet_type" in config);
}

export function isNATGatewayConfiguration(
	config: AWSResourceConfiguration
): config is NATGatewayConfiguration {
	return "subnet_id" in config && "connectivity_type" in config;
}

export function isRouteTableConfiguration(
	config: AWSResourceConfiguration
): config is RouteTableConfiguration {
	return "vpc_id" in config && "routes" in config && typeof config.routes === "object";
}

// =====================================================================
// Service type mapping for configuration forms
// =====================================================================
export const AWS_SERVICE_TYPE_MAP_ = {
	"vpc": "VPC",
	"ec2": "EC2",
	"subnet": "Subnet", // Unified subnet type
	"region": "AWSRegion",
	"availability-zone": "AvailabilityZone",
	"security-group": "SecurityGroup",
	"internet-gateway": "InternetGateway",
	"nat-gateway": "NATGateway",
	"route-table": "RouteTable",
} as const;

// =====================================================================
// Union type for all AWS resource configurations
// =====================================================================
export type AWSResourceConfiguration =
	| AvailabilityZoneConfiguration
	| AWSRegionConfiguration
	| EC2Configuration
	| SubnetConfiguration // Unified subnet
	| VPCConfiguration
	| SecurityGroupConfiguration
	| InternetGatewayConfiguration
	| NATGatewayConfiguration
	| RouteTableConfiguration
	| DefaultConfiguration;

export type AWSServiceType = keyof typeof AWS_SERVICE_TYPE_MAP_;
export type AWSServiceName = (typeof AWS_SERVICE_TYPE_MAP_)[AWSServiceType];

// =====================================================================
// Resource Type Constants (without aws- prefix)
// =====================================================================
export const RESOURCE_TYPES_ = {
	VPC: "vpc",
	EC2: "ec2",
	SUBNET: "subnet", // Unified
	REGION: "region",
	AVAILABILITY_ZONE: "availability-zone",
	SECURITY_GROUP: "security-group",
	INTERNET_GATEWAY: "internet-gateway",
	NAT_GATEWAY: "nat-gateway",
	ROUTE_TABLE: "route-table",
} as const;

export const NODE_TYPES_ = {
	SERVICE: "aws_service",
	CONTAINER: "aws_container",
} as const;
